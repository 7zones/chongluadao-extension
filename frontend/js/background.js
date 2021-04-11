/* global chrome*/
// global variables, accessed in plugin_ui.js via chrome.extension.getBackgroundPage()
window.isWhiteList = {};
window.isBlocked = {};
window.results = {};
window.isPhish = {};
window.legitimatePercents = {};


// File level variables
let blackListing = [];
const whiteListing = [];
let inputBlockLenient = false;
const inputBlockFrames = true;

const REDIRECT_PORT_NAME = 'REDIRECT_PORT_NAME';
const CLOSE_TAB_PORT_NAME = 'CLOSE_TAB_PORT_NAME';
const ML_PORT_NAME = 'ML_PORT_NAME';


const decisionTree = (root) => {
  const predictOne = (x) => {
    let node = root;
    while(node['type'] == 'split') {
      const threshold = node['threshold'].split(' <= ');
      if (x[threshold[0]] <= threshold[1]) { //Left
        node = node['left'];
      } else { //Right
        node = node['right'];
      }
    }
    return node['value'][0];
  };

  const predict = (X) => {
    return X.map((row) => predictOne(row));
  };

  return {
    'predict': predict,
    'predictOne': predictOne
  };
};


const randomForest = (clf) => {
  const predict = (X) => {
    let pred = [clf['estimators'].map((row) => decisionTree(row).predict(X))];
    pred = pred[0].map((col, i) => pred.map((row) => row[i]));
    const results = [];
    for (const p in pred) {
      let positive=0, negative=0;
      for (const i in pred[p]) {
        positive += pred[p][i][1];
        negative += pred[p][i][0];
      }
      results.push([positive>=negative, Math.max(positive, negative)]);
    }
    return results;
  };
  return {
    'predict': predict
  };
};


const fetchLive = (callback) => {
  fetch('http://localhost:6969/classifier.json')
    .then((data) => data.json())
    .then((data) => {
      chrome.storage.local.set({
        cache: data,
        cacheTime: Date.now()
      }, () => callback(data));
    });
};


const fetchCLF = (callback) => {
  chrome.storage.local.get(['cache', 'cacheTime'], (items) => {
    if (items.cache && items.cacheTime) {
      return callback(items.cache);
    }
    fetchLive(callback);
  });
};


const classify = (tabId, result, url)  => {
  /**
   * If this site is on whitelist, we don't need to classify it anymore
   * I return it here because don't know where to disable the ML event, should not trigger this
   * event later
   */
  if (window.isWhiteList[tabId] == url) {
    return;
  }

  let legitimateCount = 0;
  let suspiciousCount = 0;
  let phishingCount = 0;
  for (const key in result) {
    if (result[key] == '1') {
      phishingCount++;
    }
    else if (result[key] == '0') {
      suspiciousCount++;
    }
    else {
      legitimateCount++;
    }
  }
  window.legitimatePercents[tabId] = (
    legitimateCount / (phishingCount + suspiciousCount + legitimateCount) * 100);

  if (result.length) {
    const X = [result.map((row) => parseInt(row))];
    fetchCLF(function(clf) {
      const rf = randomForest(clf);
      window.isPhish[tabId] = rf.predict(X)[0][0];
      //TODO: correction
      if (window.isPhish[tabId] && window.legitimatePercents[tabId] > 60) {
        window.isPhish[tabId] = false;
      }
      updateBadge(window.isPhish[tabId], window.legitimatePercents[tabId], tabId);
    });
  }
};


const startup = () => {
  fetch('http://localhost:6969/v1/blacklist')
    .then((data) => data.json())
    .then((data) => {
      data.forEach((item) => {
        blackListing.push(item.url);
      });
    }).catch(() => {});


  fetch('http://localhost:6969/v1/whitelist')
    .then((data) => data.json())
    .then((data) => {
      data.forEach((item) => {
        whiteListing.push(item.url);
      });
    }).catch(() => {});
};


const blockingFunction = (url, blackSite, tabId) => {
    const message = {
      site: url,
      match: blackSite,
      title: url,
      lenient: inputBlockLenient,
      favicon: `https://www.google.com/s2/favicons?domain=${url}`,
    };
    window.isBlocked[tabId] = url;

    // TODO: This still not work, must find another way to change icon to red
    chrome.browserAction.setIcon({
      path: '../assets/cldvn_red.png',
      tabId
    });

    const redirectUrl = `${chrome.extension.getURL('blocking.html')}#${JSON.stringify(message)}`;
    return {
      redirectUrl: redirectUrl
    };
}

const safeCheck = ({frameId, url, tabId}) => {
    const sites = blackListing;
    const currentUrl = new URL(url);
    const currentSite = psl.parse(currentUrl.host);
    const currentPath = currentUrl.pathname.replaceAll('/', '');

    for (let i = 0; i < sites.length; ++i) {
        let blackSite = new URL(sites[i]);
        let prefix = blackSite.host.split(".")[0];
        let suffix = blackSite.pathname

        /**
         * Here we check if this blackSite is being blocked for all subdomains
         * format: *.blacksite.com
         */
        if(prefix == "%2A") {
            let blackDomain = blackSite.host.slice(4, blackSite.host.length);
            if(blackDomain == currentSite.domain) {
                return blockingFunction(url, blackSite.host, tabId)
            }
        }

        /**
         * Now we check if this blacksite is being blocked for all url suffix
         * format: blacksite.com/*
         */
        if(suffix == "/*") {
            if(currentUrl.host === blackSite.host) {
                return blockingFunction(url, blackSite.host, tabId)
            }
        }

        /**
         * If it wasn't blocked by prefix & suffix above, then we finally check if it match the pathname
         * format: blacksite.com/this-is-path-name?query=some-stupid-query
         */
        if(currentPath && currentPath == blackSite.pathname.replaceAll('/', '')) {
            console.log(currentPath);
            return blockingFunction(url, blackSite.host, tabId)
        }
    }

    return;
}

const filter = ({frameId, url, tabId}) => {
    console.log(url)
  // Invalid url
  if (!url || url.indexOf('chrome://') === 0 || url.indexOf(chrome.extension.getURL('/')) === 0) {
    return;
  }

  // Blacklist is empty or undefined
  if (!blackListing || !blackListing.length) {
    return;
  }

  // In case user decided to not blocking this site, we let them in
  if(localStorage.getItem('whiteList')) {
    return localStorage.removeItem('whiteList');
  }

  const sites = blackListing;
  for (let i = 0; i < sites.length; ++i) {
    try {
      let site = sites[i].replace('https://', '').replace('http://', '').replace('www.', '');
      let appendix = '[/]?(?:index.[a-z0-9]+)?[/]?$';
      const trail = site.substr(site.length - 2);
      let match = false;
      if (trail == '/*') {
        site = site.substr(0, site.length - 2);
        appendix = '(?:$|/.*$)';
        site = `^(?:[a-z0-9\\-_]+://)?(?:www\\.)?${site}${appendix}`;
        const regex = new RegExp(site, 'i');
        match = url.match(regex);
        match = match ? (match.length > 0) : false;
      } else {
        match = encodeURIComponent(site) == encodeURIComponent(url.replace('https://', '').replace('http://', '').replace('www.', ''));
      }

      // Check if the URL has suffix or not, ie https://www.facebook.com/profile.php?id=100060251539767
      const siteSuffix = sites[i].match(/(?:id=)(\d+)/);
      const urlSuffix = url.match(/(?:id=)(\d+)/);
      const suffix = siteSuffix && urlSuffix && siteSuffix[1] === urlSuffix[1];

      if (match || suffix) {
        if (inputBlockLenient) {
          const access = localStorage.getItem(sites[i]);
          if (access) {
            const num = parseFloat(access);
            const time = Date.now();
            if (num > time) {
              break;
            } else {
              localStorage.removeItem(sites[i]);
            }
          }
        }

        if (frameId !== 0) {
          // This will always be true?
          if (inputBlockFrames) {
            return {
              cancel: true
            };
          }
          return;
        }

        const message = {
          site: url,
          match: sites[i],
          title: url,
          lenient: inputBlockLenient,
          favicon: `https://www.google.com/s2/favicons?domain=${url}`,
        };
        window.isBlocked[tabId] = url;

        // TODO: This still not work, must find another way to change icon to red
        chrome.browserAction.setIcon({
          path: '../assets/cldvn_red.png',
          tabId
        });

        const redirectUrl = `${chrome.extension.getURL('blocking.html')}#${JSON.stringify(message)}`;
        return {
          redirectUrl: redirectUrl
        };
      }
    } catch(e) {
      console.log(e);
      continue;
    }
  }

  /**
   * Check if this site is in whitelist
   * REMEMBER : Have to check whitelist AFTER blacklist
   */
  for (let i = 0; i < whiteListing.length; i++) {
    if (whiteListing[i].includes(getDomain(url))) {
      window.isWhiteList[tabId] = getDomain(url);
      return;
    }
  }
};


const sendCurrentUrl = (tab = null) => {
  if(tab) {
    return updateBadge(window.isPhish[tab.id], window.legitimatePercents[tab.id], tab.id);
  }
  chrome.tabs.getSelected(null, (tab) =>  {
    updateBadge(window.isPhish[tab.id], window.legitimatePercents[tab.id], tab.id);
  });
};


const updateBadge = (isPhishing, legitimatePercent, tabId) => {
  chrome.browserAction.setTitle({title: `P:${isPhishing} per: ${legitimatePercent}`});
  if (isPhishing) {
    return chrome.browserAction.setIcon({
      path: '../assets/cldvn_red.png',
      tabId
    });
  }
  //else(!isPhishing && parseInt(legitimatePercent) < 50)
  chrome.browserAction.setIcon({
    path: '../assets/cldvn128.png',
    tabId
  });
};

/**
 * function to get domain from url
 * @param  {String}     url
 * @return {String}     domain
 */
const getDomain = (url) => {
  const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
  return matches && matches[1];
};


chrome.runtime.onStartup.addListener(startup);
chrome.runtime.onInstalled.addListener(() => {
  startup();
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.extension.getURL('assets/logo.png'),
    title: 'Cài đặt thành công!',
    message: 'Khởi động lại trình duyệt của bạn để có thể bắt đầu sử dụng ChongLuaDao. Xin cảm ơn!'
  });
});

chrome.tabs.onActivated.addListener(sendCurrentUrl);
chrome.tabs.onSelectionChanged.addListener(sendCurrentUrl);


chrome.tabs.onUpdated.addListener((tabId, changeinfo, tab) => {
  if(tab.status == 'complete') {
    chrome.tabs.sendMessage(tab.id, tab);
  }
});

chrome.runtime.onConnect.addListener((port) => {
  switch (port.name) {
  case REDIRECT_PORT_NAME:
    port.onMessage.addListener((msg) => {
      chrome.tabs.query({currentWindow: true, active: true}, ([tab,]) => {
        chrome.tabs.update(tab.id, {url: msg.redirect});
      });
    });
    break;
  case CLOSE_TAB_PORT_NAME:
    port.onMessage.addListener((msg) => {
      if (msg.close_tab) {
        chrome.tabs.query({currentWindow: true, active: true}, ([tab,]) => {
          chrome.tabs.remove(tab.id);
        });
      }
    });
    break;
  case ML_PORT_NAME:
    port.onMessage.addListener((msg) => {
      const {request} = msg;
      if (request.input_block_list !== undefined) {
        blackListing = request.input_block_list;
        inputBlockLenient = request.input_block_lenient;
      }
      chrome.tabs.query({currentWindow: true, active: true}, ([tab,]) => {
        window.results[tab.id] = request;
        classify(tab.id, request, tab.url);
      });
    });
    break;
  default:
    ML_PORT_NAME;
    break;
  }
});

chrome.webRequest.onBeforeRequest.addListener(safeCheck, {
  urls: ['*://*/*'],
  types: ['main_frame', 'sub_frame']
}, ['blocking']);

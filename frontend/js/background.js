/* global chrome*/
/* global psl*/
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

const REDIRECT_PORT_NAME = 'REDIRECT_PORT_NAME';
const CLOSE_TAB_PORT_NAME = 'CLOSE_TAB_PORT_NAME';
const ML_PORT_NAME = 'ML_PORT_NAME';
const ML_URL = 'http://103.90.227.67:45000/predict';


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

const classify = (tabId, result, url)  => {
  /**
     * If this site is on whitelist, we don't need to classify it anymore
     * I return it here because don't know where to disable the ML event, should not trigger this
     * event later
     */
  if (window.isWhiteList[tabId] == url) {
    return;
  }

  const requestBody = {url};
  fetch(ML_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
    .then((data) => data.json())
    .then((data) => {
      const resultPercentage = data.predictions[0]['phishing percentage'];
      window.isPhish[tabId] = resultPercentage >= 60;
      window.legitimatePercents[tabId] = 100 - resultPercentage;
      // updateBadge(window.isPhish[tabId], resultPercentage, tabId);
    }).catch(() => {});

};


const startup = () => {
  fetch('https://api.chongluadao.vn/v1/blacklist')
    .then((data) => data.json())
    .then((data) => {
      data.forEach((item) => {
        blackListing.push(item.url);
      });
    }).catch(() => {});


  fetch('https://api.chongluadao.vn/v1/whitelist')
    .then((data) => data.json())
    .then((data) => {
      data.forEach((item) => {
        whiteListing.push(item.url);
      });
    }).catch(() => {});
};

/**
 * Method to block user from accessing a phishing site
 * @param {String}   url of current site
 * @param {String}   blackSite URL of blacksite in our DB
 * @param {Integer}  tabId
 * @return Redirect
 */
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
};


const createUrlObject = (url) => {
  try {
    return new URL(url);
  } catch(err) {
    return;
  }
};

/**
 * Method to decide if user can access an URL
 * @param {Object} details of onBeforeRequest event
 * @docs https://developer.chrome.com/docs/extensions/reference/webRequest/#event-onBeforeRequest
 */
const safeCheck = ({url, tabId, initiator}) => {
  // Invalid url
  if (!url || url.indexOf('chrome://') === 0 || url.indexOf(chrome.extension.getURL('/')) === 0) {
    return;
  }

  // Blacklist is empty or undefined
  if (!blackListing || !blackListing.length) {
    return;
  }

  // In case user decided to not blocking this site, we let them in
  if (localStorage.getItem('whiteList')) {
    return localStorage.removeItem('whiteList');
  }

  const sites = blackListing;
  const currentUrl = createUrlObject(url);
  const currentSite = psl.parse(currentUrl.host);
  const currentPath = currentUrl.href.replaceAll('/', '');

  for (let i = 0; i < sites.length; ++i) {
    const blackSite = createUrlObject(sites[i]);
    if (!blackSite) {
      continue;
    }
    const prefix = blackSite.host.split('.')[0];
    const suffix = blackSite.pathname;

    /**
     * Here we check if this blackSite is being blocked for all subdomains
     * format: *.blacksite.com
     */
    if (prefix == '%2A') {
      const blackDomain = blackSite.host.slice(4, blackSite.host.length);
      if(blackDomain == currentSite.domain) {
        return blockingFunction(url, blackSite.host, tabId);
      }
    }

    /**
     * Now we check if this blacksite is being blocked for all url suffix
     * format: blacksite.com/*
     */
    if (suffix == '/*' && currentUrl.host === blackSite.host) {
      return blockingFunction(url, blackSite.host, tabId);
    }

    /**
     * If it wasn't blocked by prefix & suffix above, then we finally check if it match the pathname
     * format: blacksite.com/this-is-path-name?query=some-stupid-query
     */
    if(currentPath && currentPath == blackSite.href.replaceAll('/', '')) {
      return blockingFunction(url, blackSite.host, tabId);
    }
  }

  /**
   * Check if this site is in whitelist
   * REMEMBER : Have to check whitelist AFTER blacklist
   */

  // If not blocklisted, then just check the domain of the initiator instead of sub frame url
  const domain = getDomain(initiator || url);
  if (whiteListing.find((row) => row.includes(domain))) {
    window.isWhiteList[tabId] = domain;
    return;
  }

  return;
};

const sendCurrentUrl = (tab = null) => {
  if (tab && tab.tabId) {
    return updateBadge(window.isPhish[tab.tabId], window.legitimatePercents[tab.tabId], tab.tabId);
  }
  chrome.tabs.query({active: true, currentWindow: true}, ([tab]) =>  {
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

chrome.tabs.onUpdated.addListener((tabId, changeinfo, tab) => {
  if (tab.status == 'complete') {
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

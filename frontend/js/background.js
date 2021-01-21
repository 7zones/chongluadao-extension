var results = {};
var legitimatePercents = {};
var isPhish = {};

var blackListing = [];
var whiteListing = [];
var inputBlockLenient = false;
var inputBlockFrames = true;

var currentUrl = "";

const REDIRECT_PORT_NAME = 'REDIRECT_PORT_NAME'
const CLOSE_TAB_PORT_NAME = 'CLOSE_TAB_PORT_NAME'
const ML_PORT_NAME = 'ML_PORT_NAME'


function fetchLive(callback) {
  $.getJSON("http://207.148.119.106:6969/classifier.json", function(data) {
      chrome.storage.local.set({cache: data, cacheTime: Date.now()}, function() {
          callback(data);
      });
  });
}

function fetchCLF(callback) {
  chrome.storage.local.get(['cache', 'cacheTime'], function(items) {
      if (items.cache && items.cacheTime) {
          return callback(items.cache);
      }
      fetchLive(callback);
  });
}

function classify(tabId, result) {
  var legitimateCount = 0;
  var suspiciousCount = 0;
  var phishingCount = 0;
  for(var key in result) {
    if(result[key] == "1") phishingCount++;
    else if(result[key] == "0") suspiciousCount++;
    else legitimateCount++;
  }
  legitimatePercents[tabId] = legitimateCount / (phishingCount+suspiciousCount+legitimateCount) * 100;

  if(result.length != 0) {
    var X = [];
    X[0] = [];
    for(var key in result) {
        X[0].push(parseInt(result[key]));
    }
    console.log(result);
    console.log(X);
    fetchCLF(function(clf) {
      var rf = random_forest(clf);
      y = rf.predict(X);
      console.log(y[0]);
      if(y[0][0]) {
        isPhish[tabId] = true;
        // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        //   chrome.tabs.sendMessage(tabs[0].id, {action: "alert_user"}, function(response) {
        //   });
        // });
      } else {
        isPhish[tabId] = false;
      }
      updateBadge(isPhish[tabId], legitimatePercents[tabId], tabId);
    });
  }
}

function startup() {

    $.getJSON("http://207.148.119.106:6969/blacklist.json", function(data) {
      data.forEach(item => {
        blackListing.push(item.url);
      })
    }).fail(function() {
    });

}

function filter({frameId, url}) {
	let currentUrl = url;
  if (!currentUrl 
    || currentUrl.indexOf("chrome://") == 0 
    || currentUrl.indexOf(chrome.extension.getURL("/")) == 0) {
		return; // invalid url
  }
  
	if (!blackListing) {
    //TODO: whitelisting
    console.log('no block')
		return; // no block list
  }

  let whiteList = localStorage.getItem('whiteList');

  // if (whiteList !== null && whiteList !== 'null') {
  //   whiteList = JSON.parse(whiteList);
  //   blackListing = blackListing.filter(url => !whiteList.includes(url));
  // }

  if (whiteList !== null) {
    localStorage.removeItem('whiteList');
    return;
  }
  
	let sites = blackListing
	for (let i = 0; i < sites.length; ++i) {
		let site = sites[i];
		let appendix = "[/]?(?:index\.[a-z0-9]+)?[/]?$";
		let trail = site.substr(site.length - 3);
		if (trail == "/.*") {
			site = site.substr(0, site.length - 3);
			appendix = "(?:$|/.*$)";
		}

		site = "^(?:[a-z0-9\-_]+:\/\/)?(?:www\.)?" + site + appendix;
		let regex = new RegExp(site, "i");
    let match = currentUrl.match(regex);
    
		if (match && match.length > 0) {
			if (inputBlockLenient) {
				let access = localStorage.getItem(sites[i]);
				if (access) {
					let num = parseFloat(access);
					let time = Date.now();
					if (num > time) {
						break;
					}
					else {
						localStorage.removeItem(sites[i]);
					}
				}
			}
			if (frameId !== 0) {
				if (inputBlockFrames) {
					return { cancel: true };
				}
				return;
			}
			let message = {
				site: currentUrl,
				match: sites[i],
				title: currentUrl,
				lenient: inputBlockLenient,
				favicon: "https://www.google.com/s2/favicons?domain=" + currentUrl,
			};
			let url = chrome.extension.getURL("blocking.html") + "#" + JSON.stringify(message);
			return { redirectUrl: url };
		}
	}
}


function sendCurrentUrl() {
  chrome.tabs.getSelected(null, function(tab) {
    currentUrl = tab.url
    updateBadge(isPhish[tab.id], legitimatePercents[tab.id], tab.id);
  });
}

function updateBadge(isPhishing, legitimatePercent, tabId) { 
  chrome.browserAction.setTitle({title: `P:${isPhishing} per: ${legitimatePercent}`}); 
  if (isPhishing.toString() == "true") {
    chrome.browserAction.setIcon({path: './assets/cldvn128_a.png', tabId});
  }
  //else(!isPhishing && parseInt(legitimatePercent) < 50)
  else {
    chrome.browserAction.setIcon({path: './assets/cldvn128.png', tabId});
  }
}

chrome.runtime.onStartup.addListener(startup);
chrome.runtime.onInstalled.addListener(startup);


chrome.tabs.onActivated.addListener(function(activeInfo){  
  sendCurrentUrl();
});
chrome.tabs.onSelectionChanged.addListener(function() {
  sendCurrentUrl();
});

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   if (request.input_block_list !== undefined) {
//     blackListing = request.input_block_list;
//     inputBlockLenient = request.input_block_lenient;
//   }
//   if (request.close_tab) {
//     chrome.tabs.query({ currentWindow: true, active: true }, function([tab, ...tabs]) {
//       chrome.tabs.remove(tab.id);
//     });
//   }
  
//   results[sender.tab.id]=request;
//   classify(sender.tab.id, request);
//   sendResponse({received: "result"});
// });

chrome.runtime.onConnect.addListener(function(port) {
  switch (port.name){
    case REDIRECT_PORT_NAME:
      port.onMessage.addListener(function(msg) {
        chrome.tabs.query({ currentWindow: true, active: true }, function([tab, ...tabs]) {
          chrome.tabs.update(tab.id, {url: msg.redirect});
        });
      });
      break;

    case CLOSE_TAB_PORT_NAME:
      port.onMessage.addListener(function(msg) {
        if (msg.close_tab) {
          chrome.tabs.query({ currentWindow: true, active: true }, function([tab, ...tabs]) {
            chrome.tabs.remove(tab.id);
          });
        }
      });
      break;

    case ML_PORT_NAME:
      port.onMessage.addListener(function(msg) {
        const { request } = msg
        if (request.input_block_list !== undefined) {
          blackListing = request.input_block_list;
          inputBlockLenient = request.input_block_lenient;
        }
  
        chrome.tabs.query({ currentWindow: true, active: true }, function([tab, ...tabs]) {
          results[tab.id]=request;
          classify(tab.id, request);
        });
      });

    default:
      break;
  }
});

chrome.webRequest.onBeforeRequest.addListener(filter, {
	urls: ["*://*/*"],
	types: ["main_frame", "sub_frame"]
}, ["blocking"]);
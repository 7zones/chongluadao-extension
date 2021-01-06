var results = {};
var legitimatePercents = {};
var isPhish = {};

var blackListing = [];
var inputBlockLenient = false;
var inputBlockFrames = true;

function fetchLive(callback) {
  $.getJSON("https://raw.githubusercontent.com/picopalette/phishing-detection-plugin/master/static/classifier.json", function(data) {
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
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "alert_user"}, function(response) {
          });
        });
      } else {
        isPhish[tabId] = false;
      }
    });
  }

}

function startup() {
	try {
		blackListing = ["http://vietnamairslines.com/*",
      "http://jetstarairlines.vn/*",
      "http://bamboairways.com.vn/*",
      "http://vietjetvn.com/*",
      "https://www.youtube.com/channel/UC5rpGxIdqpwVLIZAFwqMdpg/*",
      "https://www.youtube.com/channel/UCSbUXtl321OOn72HhfF6hcA?pbjreload=102/*",
      "https://www.youtube.com/c/Tuy%E1%BB%81nM%E1%BB%91c1986/*",
      "https://sieuno.win/*",
      "https://www.facebook.com/Ng%C3%B4-Minh-Hi%C3%AA%CC%81u-Hi%C3%AA%CC%81u-PC-101048191917982/*",
      "https://www.facebook.com/Hi%E1%BA%BFu-PC-101620821829780/*",
      "https://www.facebook.com/HieuPC.Fan/*",
      "https://www.facebook.com/Ng%C3%B4-Minh-Hi%E1%BA%BFu-103827758000990/*",
      "https://www.facebook.com/hieu.ngominh.330/*",
      "https://www.facebook.com/profile.php?id=100060251539767/*",
      "https://www.facebook.com/profile.php?id=100060251539767/*",
      "https://www.facebook.com/profile.php?id=100051958609895/*",
      "https://www.facebook.com/profile.php?id=100035099033165/*",
      "https://www.facebook.com/profile.php?id=100023377551188/*",
      "http://k9vn.com/*",
      "https://thegioigaigoi.net/*",
      "https://tuoi69.cc/*",
      "https://xamvn.us/*",
      "https://www.pornhub.com/*",
      "https://pornjimbo.com/*"];
	}
	catch (e) {
		console.trace(e);
	}
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
  
	let sites = blackListing;
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

chrome.runtime.onStartup.addListener(startup);
chrome.runtime.onInstalled.addListener(startup);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.input_block_list !== undefined) {
		blackListing = request.input_block_list;
		inputBlockLenient = request.input_block_lenient;
	}
	if (request.close_tab) {
		chrome.tabs.query({ currentWindow: true, active: true }, function([tab, ...tabs]) {
			chrome.tabs.remove(tab.id);
		});
  }
  
  results[sender.tab.id]=request;
  classify(sender.tab.id, request);
  sendResponse({received: "result"});
});

chrome.webRequest.onBeforeRequest.addListener(filter, {
	urls: ["*://*/*"],
	types: ["main_frame", "sub_frame"]
}, ["blocking"]);
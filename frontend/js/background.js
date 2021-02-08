var results = {};
var legitimatePercents = {};
var isPhish = {};
var isWhiteList = {}
var isBlocked = {}

var blackListing = [];
var whiteListing = [];
var inputBlockLenient = false;
var inputBlockFrames = true;

var currentUrl = "";

const REDIRECT_PORT_NAME = 'REDIRECT_PORT_NAME'
const CLOSE_TAB_PORT_NAME = 'CLOSE_TAB_PORT_NAME'
const ML_PORT_NAME = 'ML_PORT_NAME'


function fetchLive(callback) {
    $.getJSON("https://api.chongluadao.vn/classifier.json", function(data) {
        chrome.storage.local.set({
            cache: data,
            cacheTime: Date.now()
        }, function() {
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

function classify(tabId, result, url) {
    /**
     * if this site is on whitelist, we don't need to classify it anymore
     * I return it here because don't know where to disable the ML event, should not trigger this event later
     */
    if(isWhiteList[tabId] == url)
        return;

    var legitimateCount = 0;
    var suspiciousCount = 0;
    var phishingCount = 0;
    for (var key in result) {
        if (result[key] == "1") phishingCount++;
        else if (result[key] == "0") suspiciousCount++;
        else legitimateCount++;
    }
    legitimatePercents[tabId] = legitimateCount / (phishingCount + suspiciousCount + legitimateCount) * 100;

    if (result.length != 0) {
        var X = [];
        X[0] = [];
        for (var key in result) {
            X[0].push(parseInt(result[key]));
        }
        fetchCLF(function(clf) {
            var rf = random_forest(clf);
            y = rf.predict(X);
            isPhish[tabId] = y[0][0];
            //TODO: correction
            if (isPhish[tabId] && legitimatePercents[tabId] > 60) {
                isPhish[tabId] = false;
            }
            updateBadge(isPhish[tabId], legitimatePercents[tabId], tabId);
        });
    }
}

function startup() {
    $.getJSON("https://api.chongluadao.vn/v1/blacklist", function(data) {
        data.forEach(item => {
            blackListing.push(item.url);
        })
    }).fail(function() {});

    $.getJSON("https://api.chongluadao.vn/v1/whitelist", function(data) {
        data.forEach(item => {
            whiteListing.push(item.url);
        })
    }).fail(function() {});
}

function filter({
    frameId,
    url,
    tabId
}) {
    let currentUrl = url;
    if (!currentUrl ||
        currentUrl.indexOf("chrome://") == 0 ||
        currentUrl.indexOf(chrome.extension.getURL("/")) == 0) {
        return; // invalid url
    }

    if (!blackListing) {
        return; // no block list
    }

    // In case user decided to not blocking this site, we let them in :
    if(localStorage.getItem("whiteList")) {
        localStorage.removeItem("whiteList")
        return;
    }

    let sites = blackListing
    for (let i = 0; i < sites.length; ++i) {
        let site = sites[i].replace('https://', '').replace('http://', '').replace('www.', '')
        let appendix = "[/]?(?:index\.[a-z0-9]+)?[/]?$";
        let trail = site.substr(site.length - 2);

        if (trail == "/*") {
            site = site.substr(0, site.length - 2);
            appendix = "(?:$|/.*$)";
        }

        site = "^(?:[a-z0-9\-_]+:\/\/)?(?:www\.)?" + site + appendix;
        let regex = new RegExp(site, "i");
        let match = currentUrl.match(regex);

        // Check if the URL has suffix or not, for ex: https://www.facebook.com/profile.php?id=100060251539767
        let suffix = false
        if (sites[i].match(/(?:id=)(\d+)/) && currentUrl.match(/(?:id=)(\d+)/))
            suffix = (sites[i].match(/(?:id=)(\d+)/)[1] == currentUrl.match(/(?:id=)(\d+)/)[1])

        if ((match && match.length > 0) || suffix) {
            if (inputBlockLenient) {
                let access = localStorage.getItem(sites[i]);
                if (access) {
                    let num = parseFloat(access);
                    let time = Date.now();
                    if (num > time) {
                        break;
                    } else {
                        localStorage.removeItem(sites[i]);
                    }
                }
            }

            if (frameId !== 0) {
                if (inputBlockFrames) {
                    return {
                        cancel: true
                    };
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
            isBlocked[tabId] = currentUrl

            // TODO: This still not work, must find another way to change icon to red:
            chrome.browserAction.setIcon({
                path: '../assets/cldvn_red.png',
                tabId
            });

            return {
                redirectUrl: url
            };
        }
    }

    /**
     * Check if this site is in whitelist
     * REMEMBER : Have to check whitelist AFTER blacklist
     */
    for (let i = 0; i < whiteListing.length; i++) {
        if (whiteListing[i].includes(getDomain(currentUrl))) {
            isWhiteList[tabId] = getDomain(currentUrl)
            return;
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
    const colors = {
        "-1": "#28a745",
        "0": "#ffeb3c",
        "1": "#cc0000"
    };

    chrome.browserAction.setTitle({
        title: `P:${isPhishing} per: ${legitimatePercent}`
    });


    if (isPhishing) {
        chrome.browserAction.setIcon({
            path: '../assets/cldvn_red.png',
            tabId
        });
    }
    //else(!isPhishing && parseInt(legitimatePercent) < 50)
    else {
        chrome.browserAction.setIcon({
            path: '../assets/cldvn128.png',
            tabId
        });
    }
}

/**
 * function to get domain from url
 * @param  {String}     url
 * @return {String}     domain
 */
function getDomain(url) {
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    return matches && matches[1];
}

chrome.runtime.onStartup.addListener(startup);
chrome.runtime.onInstalled.addListener(startup);

chrome.tabs.onActivated.addListener(function(activeInfo) {
    /**
     *  We have to refresh the page if this is the first time user using this plugin,
     *  so that the classifier can work on this tab
     */
    let checked = Object.keys(isPhish).concat(Object.keys(isWhiteList)).concat(Object.keys(isBlocked))
    if(!checked.includes(activeInfo.tabId.toString()))
        chrome.tabs.reload(activeInfo.tabId, null, function() {
            sendCurrentUrl();
        })
    else
        sendCurrentUrl();
});

chrome.tabs.onSelectionChanged.addListener(function(tabId) {
    /**
     *  We have to refresh the page if this is the first time user using this plugin,
     *  so that the classifier can work on this tab
     */
    let checked = Object.keys(isPhish).concat(Object.keys(isWhiteList)).concat(Object.keys(isBlocked))
    if(!checked.includes(tabId.toString()))
        chrome.tabs.reload(tabId, null, function() {
            sendCurrentUrl();
        })
    else
        sendCurrentUrl();
});

chrome.runtime.onConnect.addListener(function(port) {
    switch (port.name) {
        case REDIRECT_PORT_NAME:
            port.onMessage.addListener(function(msg) {
                chrome.tabs.query({
                    currentWindow: true,
                    active: true
                }, function([tab, ...tabs]) {
                    chrome.tabs.update(tab.id, {
                        url: msg.redirect
                    });
                });
            });
            break;

        case CLOSE_TAB_PORT_NAME:
            port.onMessage.addListener(function(msg) {
                if (msg.close_tab) {
                    chrome.tabs.query({
                        currentWindow: true,
                        active: true
                    }, function([tab, ...tabs]) {
                        chrome.tabs.remove(tab.id);
                    });
                }
            });
            break;

        case ML_PORT_NAME:
            port.onMessage.addListener(function(msg) {
                const {
                    request
                } = msg
                if (request.input_block_list !== undefined) {
                    blackListing = request.input_block_list;
                    inputBlockLenient = request.input_block_lenient;
                }

                chrome.tabs.query({
                    currentWindow: true,
                    active: true
                }, function([tab, ...tabs]) {
                    results[tab.id] = request;
                    classify(tab.id, request, tab.url);
                });
            });

        default:ML_PORT_NAME
            break;
    }
});

chrome.webRequest.onBeforeRequest.addListener(filter, {
    urls: ["*://*/*"],
    types: ["main_frame", "sub_frame"]
}, ["blocking"]);

const REDIRECT_PORT_NAME = 'REDIRECT_PORT_NAME'
const CLOSE_TAB_PORT_NAME = 'CLOSE_TAB_PORT_NAME'
const ML_PORT_NAME = 'ML_PORT_NAME'

let redirectPort = chrome.runtime.connect({ name: REDIRECT_PORT_NAME });
let closeTabPort = chrome.runtime.connect({ name: CLOSE_TAB_PORT_NAME });

document.getElementById("close").addEventListener("click", function (e) {
	closeTabPort.postMessage({ close_tab: true })
	return false;
});

document.getElementById("allow").addEventListener("click", function(e) {
	localStorage.setItem("whiteList", "true");
	redirectPort.postMessage({ redirect: message.site })
})

let hash = window.location.hash.substring(1);
try {
	var message = JSON.parse(decodeURI(hash));

	if (!message.v2) {
		message.v2 = true;
		// reload once to be able to connect to chrome.runtime
		// workaround for firefox bug ?
		window.location.hash = JSON.stringify(message);
	}

	let link = document.createElement("link");
	link.type = "image/x-icon";
	link.rel = "icon";
	link.href = message.favicon;
	document.head.appendChild(link);

	let spans = document.getElementsByClassName("sitename");
	for (let i = 0; i < spans.length; ++i) {
		spans[i].textContent = message.site;
	}
	spans = document.getElementsByClassName("sitetitle");
	for (let i = 0; i < spans.length; ++i) {
		spans[i].textContent = message.title;
	}
	spans = document.getElementsByClassName("sitematch");
	let match;
	for (let i = 0; i < spans.length; ++i) {
		if (!match) match = message.match.replace(/\\([.+?^${}()|[\]\\]{1})/g, "$1").replace(/[.]{1}[*]{1}/g, "*");
		spans[i].textContent = match;
	}

	document.title = document.title + " " + message.title;

	if (message.lenient) {
		document.getElementById("access").style.display = "inline-block";
		document.getElementById("access").addEventListener("click", function (e) {
			chrome.runtime.sendMessage({ "access": message.match, "access_seconds": (5 * 60), "site": message.site });
		});
	}
}
catch (e) {
	console.trace(e);
}

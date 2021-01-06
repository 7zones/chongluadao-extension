document.getElementById("close").addEventListener("click", function (e) {
	chrome.runtime.sendMessage({ close_tab: true });
	return false;
});

let hash = window.location.hash.substring(1);
try {
	let message = JSON.parse(decodeURI(hash));

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
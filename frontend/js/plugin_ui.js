var background = chrome.extension.getBackgroundPage();
var colors = {
  "-1": "#58bc8a",
  "0": "#ffeb3c",
  "1": "#ff8b66"
};
var featureList = document.getElementById("features");
chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  var tab = tabs[0];

  var result = background.results[tab.id];
  var isPhish = background.isPhish[tab.id];
  var legitimatePercent = background.legitimatePercents[tab.id];

  var url = new URL(tab.url)
  var domain = url.hostname

  for (var key in result) {
    var newFeature = document.createElement("li");
    //console.log(key);
    newFeature.textContent = key;
    //newFeature.className = "rounded";
    newFeature.style.backgroundColor = colors[result[key]];
    featureList.appendChild(newFeature);
  }

  let phishingMessage = isPhish ? "Cảnh báo!! Website này không an toàn." : "Website này an toàn"
  let phishingColor =colors["-1"]

  if (isPhish) {
    phishingColor = colors[1]
  }

  if (!isPhish && parseInt(legitimatePercent) < 50) {
    phishingColor = colors[0]
  }
  
  $("#site_msg").text(phishingMessage);
  $("#site_msg").css("fontColor", phishingColor);
  $("#site_score").text(parseInt(legitimatePercent) - 1 + "%");

  $("#domain_url").text(domain);
});

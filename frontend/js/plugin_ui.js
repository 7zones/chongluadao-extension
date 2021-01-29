var background = chrome.extension.getBackgroundPage();
var colors = {
  "-1": "#28a745",
  "0": "#ffeb3c",
  "1": "#cc0000"
};
var featureList = document.getElementById("features");
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}
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

  const phishingMessage = isPhish ? "Website này có thể không an toàn." : "Website cớ thể này an toàn"

  let site_score = document.getElementById("site_score");
  let percentage_content = document.getElementById("percentage_content");
  let site_msg = document.getElementById("site_msg");
  percentage_content.classList.add(`p${parseInt(legitimatePercent)}`);

  if (isPhish) {
    percentage_content.classList.add("orange");
    site_score.classList.add("warning");
    site_msg.classList.add("warning");
  }
  else {
    site_score.classList.add("safe");
    site_msg.classList.add("safe");
  }
  
  const percentage  = parseInt(legitimatePercent);
  $("#site_msg").text(isNaN(percentage) ? "..." : phishingMessage);
  $("#site_score").text(isNaN(percentage) ? "..." : parseInt(legitimatePercent) - 1 + "%");
  $("#domain_url").text(domain);
});

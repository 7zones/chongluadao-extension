/*global chrome*/
/*global $*/
const background = chrome.extension.getBackgroundPage();
const colors = {
  '-1': '#28a745',
  '0': '#ffeb3c',
  '1': '#cc0000'
};

[...document.getElementsByClassName('collapsible')].forEach((el) => {
  el.addEventListener('click', function () {
    this.classList.toggle('active');
    const content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = `${content.scrollHeight}px`;
    }
  });
});

chrome.tabs.query({currentWindow: true, active: true}, ([tab,]) => {
  const tabId = tab.id;
  const url = new URL(tab.url);
  const domain = url.hostname;
  // Display nothing if protocol is neither http or https
  if (!['https:', 'http:'].includes(url.protocol)) {
    $('#pluginBody').hide();
    $('#domain_url').text(domain);
    return;
  }

  if (background.isWhiteList[tab.id] == domain) {
    $('#pluginBody').hide();
    $('#isSafe').show();
    $('#isSafe .site-url').text(domain);

    chrome.browserAction.setIcon({
      path: '../assets/cldvn128.png',
      tabId
    });

  } else if(background.isBlocked[tab.id] == domain){
    $('#pluginBody').hide();
    $('#isPhishing').show();
    $('#isPhishing .site-url').text(background.isBlocked[tab.id]);

    chrome.browserAction.setIcon({
      path: '../assets/cldvn_red.png',
      tabId
    });
  } else {
    const result = background.results[tab.id];
    const isPhish = background.isPhish[tab.id];
    const legitimatePercent = background.legitimatePercents[tab.id];

    for (const key in result) {
      const newFeature = document.createElement('li');
      newFeature.textContent = key;
      newFeature.style.backgroundColor = colors[result[key]];
      const featureList = document.getElementById('features');
      featureList.appendChild(newFeature);
    }

    const phishingMessage = isPhish ? 'Website này có thể không an toàn.' : 'Website này có thể an toàn.';

    const site_score = document.getElementById('site_score');
    const percentage_content = document.getElementById('percentage_content');
    const site_msg = document.getElementById('site_msg');
    percentage_content.classList.add(`p${Math.round(legitimatePercent)}`);

    if (isPhish) {
      percentage_content.classList.add('orange');
      site_score.classList.add('warning');
      site_msg.classList.add('warning');
    }
    else {
      site_score.classList.add('safe');
      site_msg.classList.add('safe');
    }

    const percentage  = parseInt(legitimatePercent);
    $('#site_msg').text(isNaN(percentage) ? '...' : phishingMessage);
    $('#site_score').text(isNaN(percentage) ? '...' : `${Math.round(legitimatePercent)}%`);
    $('#domain_url').text(domain);
  }
});

$(document).ready(function () {
  /* 1. Visualizing things on Hover - See next part for action on click */
  $('#stars li').on('mouseover', function () {
    var onStar = parseInt($(this).data('value'), 10); // The star currently mouse on

    // Now highlight all the stars that's not after the current hovered star
    $(this).parent().children('li.star').each(function (e) {
      if (e < onStar) {
        $(this).addClass('hover');
      }
      else {
        $(this).removeClass('hover');
      }
    });

  }).on('mouseout', function () {
    $(this).parent().children('li.star').each(function (e) {
      $(this).removeClass('hover');
    });
  });

  $('.success-box').hide();
  /* 2. Action to perform on click */
  $('#stars li').on('click', function () {
    var onStar = parseInt($(this).data('value'), 10); // The star currently selected
    var stars = $(this).parent().children('li.star');

    for (i = 0; i < stars.length; i++) {
      $(stars[i]).removeClass('selected');
    }

    for (i = 0; i < onStar; i++) {
      $(stars[i]).addClass('selected');
    }

    var ratingValue = parseInt($('#stars li.selected').last().data('value'), 10);
    sendRatingRequest({currentUrl, ratingValue}, function() {
      $('.success-box').show();
      $('.success-box').fadeIn(200);
      $('.success-box div.text-message').html("<span>" + msg + "</span>");    

      //remove all click
      $('#stars li').off();

      //cache to storage
      chrome.storage.local.set({cachedUrl: currentUrl, cacheTime: Date.now()}, function() {});
    }, msg)
  });
});

function sendRatingRequest(rating, callback, msg) {
  //TODO: here callback hell
  $.post("https://api.chongluadao.vn/v1/initSession", {
    "app": "chrome-extension",
    "secret": "luatinhkhongluadao" //need hashing
  }, function(auth){
    if (auth && auth.token) {
      const {token} = auth;
      $.ajax({
        type: 'POST',
        url: 'https://api.chongluadao.vn/v1/rate',
        headers: {
          "Authorization": "Bearer " + token
        },
        dataType: 'json',
        data: {
          rating: rating.ratingValue,
          url: rating.currentUrl,
        },
        success : function(data) {
        },
      });  
    }
  });

  if (callback) {
    callback(msg);
  }
}
var msg = "Cảm ơn bạn đã đánh giá";
var currentUrl = "";
chrome.tabs.query({ active: true,lastFocusedWindow: true}, function(tabs) {
  var tab = tabs[0];
  currentUrl = tab.url;
  chrome.storage.local.get(['cachedUrl'], function(result) {
    if (result && result.cachedUrl) {
      if (currentUrl.match( new RegExp( result.cachedUrl, "g")).length) {
        //todo: uhm, what kind of logic here ?
        $('#stars li').off();
        $('.success-box').show();
        $('.success-box').fadeIn(200);
        $('.success-box div.text-message').html("<span>" + msg + "</span>");    
      }
    }
  });
});

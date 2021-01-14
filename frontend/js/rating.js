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
    var msg = "Cảm ơn! Bạn đánh giá " + ratingValue + " sao";
    sendRatingRequest({currentUrl, ratingValue}, function() {
      $('.success-box').fadeIn(200);
      $('.success-box div.text-message').html("<span>" + msg + "</span>");    
    }, msg)
  });
});

function sendRatingRequest(rating, callback, msg) {
  //TODO: here callback hell
  $.post("http://207.148.119.106:6969/v1/initSession", {
    "app": "chrome-extension",
    "secret": "luatinhkhongluadao" //need hashing
  }, function(auth){
    if (auth && auth.token) {
      const {token} = auth;
      $.ajax({
        type: 'POST',
        url: 'http://207.148.119.106:6969/v1/rate',
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

var currentUrl = "";
chrome.tabs.query({ active: true,lastFocusedWindow: true}, function(tabs) {
  var tab = tabs[0];
  currentUrl = tab.url;
});

/*global $*/
/*global chrome*/

const msg = 'Cảm ơn bạn đã đánh giá';

$(document).ready(() => {
  /* 1. Visualizing things on Hover - See next part for action on click */
  $('#stars li').on('mouseover', () => {
    const onStar = parseInt($(this).data('value'), 10); // The star currently mouse on

    // Now highlight all the stars that's not after the current hovered star
    $(this).parent().children('li.star').each((e) => {
      if (e < onStar) {
        $(this).addClass('hover');
      }
      else {
        $(this).removeClass('hover');
      }
    });

  }).on('mouseout', function () {
    $(this).parent().children('li.star').each(() => {
      $(this).removeClass('hover');
    });
  });

  $('.success-box').hide();
  /* 2. Action to perform on click */
  $('#stars li').on('click', function () {
    const onStar = parseInt($(this).data('value'), 10); // The star currently selected
    const stars = $(this).parent().children('li.star');

    for (let i = 0; i < stars.length; i++) {
      $(stars[i]).removeClass('selected');
    }

    for (let i = 0; i < onStar; i++) {
      $(stars[i]).addClass('selected');
    }

    const ratingValue = parseInt($('#stars li.selected').last().data('value'), 10);
    sendRatingRequest(ratingValue);
  });
});

const sendRatingRequest = (ratingValue) => {
  //TODO: here callback hell
  $.post('https://api.chongluadao.vn/v1/initSession', {
    'app': 'chrome-extension',
    'secret': 'xxeaWiCnkx' //need hashing
  }, function(auth){
    if (auth && auth.token) {
      const {token} = auth;
      chrome.tabs.query({currentWindow: true, active: true}, ([tab,]) => {
        $.ajax({
          type: 'POST',
          url: 'https://api.chongluadao.vn/v1/rate',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          dataType: 'json',
          data: {
            rating: ratingValue,
            url: tab.url,
          },
          success : () => {
            chrome.storage.local.set({cachedUrl: tab.url, cacheTime: Date.now()});
            $('#stars li').off();
            $('.success-box').show();
            $('.success-box').fadeIn(200);
            $('.success-box div.text-message').html(`<span>${msg}</span>`);
          },
        });
      });
    }
  });
};

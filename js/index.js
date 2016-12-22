Ractive.DEBUG = false;

window.onhashchange = OnHashChange;
window.onload = OnHashChange;

$(document).ready(function() {
  const box1 = $('.box-1'),
    box2 = $('.box-2'),
    box3 = $('.box-3'),
    box4 = $('.box-4');

  box1.addClass('hover').delay(300).queue(function(next) {
    $(this).removeClass('hover');
    next();

    box2.addClass('hover').delay(300).queue(function(next) {
      $(this).removeClass('hover');
      next();

      box3.addClass('hover').delay(300).queue(function(next) {
        $(this).removeClass('hover');
        next();

        box4.addClass('hover').delay(300).queue(function(next) {
          $(this).removeClass('hover');
          next();

          box3.addClass('hover').delay(300).queue(function(next) {
            $(this).removeClass('hover');
            next();

            box2.addClass('hover').delay(300).queue(function(next) {
              $(this).removeClass('hover');
              next();

              box1.addClass('hover').delay(300).queue(function(next) {
                $(this).removeClass('hover');
                next();
              });
            });
          });
        });
      });
    });
  });
});

var ractive = new Ractive({
  el: '.cd-modal-content',
  template: '#template'
});

//trigger the animation - open modal window
$('[data-type="modal-trigger"]').on('click', function() {

  SetHashLocation($(this).attr('name'));
  OpenModal($(this));
});

$(document).keyup(function(event) {
  if (event.which == '27') closeModal();
});

$(window).on('resize', function() {
  //on window resize - update cover layer dimention and position
  if ($('.cd-section.modal-is-visible').length > 0) window.requestAnimationFrame(updateLayer);
});

function CustomSearch(boxName) {
  $.get('pages/' + boxName + '.html').done(function(datain) {
    ractive.set('dataout', datain);

    if (boxName == 'contact' && $('.floating-labels').length > 0) {
      floatLabels();
      CheckRequired();

      $('input[type="submit"]').click(function(e) {
        CheckBefore();
        if (BeforeSubmit() != true) e.preventDefault();
      });
    }
  });
}

function SetHashLocation(boxName) {
  window.location.hash = '#' + boxName;
}

function OnHashChange() {
  var boxName = window.location.hash.substring(1);

  (boxName != '') ? CustomSearch(boxName): closeModal();

  $('[data-type="modal-trigger"]').each(function() {
    if (boxName != '' && $(this).attr('name') == boxName && !$(this).hasClass('to-circle')) OpenModal($(this));
  });

}

function WhichTransitionEvent() {
  var t, el = document.createElement("fakeelement");

  const transitions = {
    "transition": "transitionend",
    "OTransition": "oTransitionEnd",
    "MozTransition": "transitionend",
    "WebkitTransition": "webkitTransitionEnd"
  };

  for (t in transitions) {
    if (el.style[t] !== undefined) return transitions[t];
  }
}

const transitionEvent = WhichTransitionEvent();

function OpenModal(actionBtn) {
  var scaleValue = retrieveScale(actionBtn.next('.cd-modal-bg'));

  actionBtn.addClass('to-circle');
  actionBtn.next('.cd-modal-bg').addClass('is-visible').one(transitionEvent, function() {
    animateLayer(actionBtn.next('.cd-modal-bg'), scaleValue[0], scaleValue[1], true);
  });

  //if browser doesn't support transitions...
  if (actionBtn.parents('.no-csstransitions').length > 0) animateLayer(actionBtn.next('.cd-modal-bg'), scaleValue[0], scaleValue[1], true);
}

function retrieveScale(btn) {

  var btnH = btn.height() / 2,
    btnW = btn.width() / 2,
    top = btn.offset().top + btnH - $(window).scrollTop(),
    left = btn.offset().left + btnW,
    scale = scaleValue(top, left, btnH, btnW);

  btn.css('position', 'fixed').velocity({
    top: top - btnH,
    left: left - btnW,
    translateX: 0,
  }, 0);

  return [scale[0], scale[1]];
}

function scaleValue(topValue, leftValue, hValue, wValue) {
  var maxDistH = (topValue > $(window).height() / 2) ? topValue : ($(window).height() - topValue),
    maxDistW = (leftValue > $(window).width() / 2) ? leftValue : ($(window).width() - leftValue);

  return [Math.ceil(maxDistH / hValue), Math.ceil(maxDistW / wValue)];
}

function animateLayer(layer, scaleValY, scaleValX, bool) {
  layer.velocity({
    scaleY: scaleValY,
    scaleX: scaleValX
  }, 400, function() {
    $('body').toggleClass('overflow-hidden', bool);
    (bool) ? layer.parents('.cd-section').addClass('modal-is-visible').end().off(transitionEvent): layer.removeClass('is-visible').removeAttr('style').siblings('[data-type="modal-trigger"]').removeClass('to-circle');
  });
}

function updateLayer() {
  var layer = $('.cd-section.modal-is-visible').find('.cd-modal-bg'),
    layerH = layer.height() / 2,
    layerW = layer.width() / 2,
    layerTop = layer.siblings('.box').offset().top + layerH - $(window).scrollTop(),
    layerLeft = layer.siblings('.box').offset().left + layerW,
    scale = scaleValue(layerTop, layerLeft, layerH, layerW);

  layer.velocity({
    top: layerTop - layer.height() / 2,
    left: layerLeft - layer.width() / 2,
    scaleY: scale[0],
    scaleX: scale[1]
  }, 0);
}

function closeModal() {
  var section = $('.cd-section.modal-is-visible');

  section.removeClass('modal-is-visible').one(transitionEvent, function() {
    animateLayer(section.find('.cd-modal-bg'), 1, 1, false);
  });

  //if browser doesn't support transitions...
  if (section.parents('.no-csstransitions').length > 0) animateLayer(section.find('.cd-modal-bg'), 1, 1, false);
}

// form

function floatLabels() {
  $('.floating-labels .cd-label').next().each(function() {

    $(this).on('change keyup', function() {
      ($(this).val() != '') ? $(this).prev('.cd-label').addClass('float'): $(this).prev('.cd-label').removeClass('float');
    });
  });
}

function CheckRequired() {
  $('.required').each(function() {

    $(this).on('keyup keypress blur change', function() {
      const name_regex = /^[a-zA-Z]+$/,
        email_regex = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
      var regex;

      if ($(this).attr("id") == "cd-name") regex = name_regex;
      if ($(this).attr("id") == "cd-email") regex = email_regex;

      (!$(this).val().match(regex) || $(this).val().length == 0 || $(this).val() == '') ? $(this).addClass('error'): $(this).removeClass('error');
    });
  });
}

function BeforeSubmit() {
  if ($('.cd-form').find('input, textarea').hasClass('error')) {
    var errorWhere = $('.error').attr('id');
    var errorMessage = $('.error-message');

    if ($(".error").length > 1) errorMessage.html('<p>Please fill out the required fields.</p>')
    else if (errorWhere == 'cd-name') errorMessage.html('<p>Please enter your NAME (only letters).</p>')
    else if (errorWhere == 'cd-email') errorMessage.html('<p>Please enter a valid EMAIL address.</p>')
    else if (errorWhere == 'cd-textarea') errorMessage.html('<p>Write me a message.</p>');

    errorMessage.fadeIn(400);
    return false;

  } else {
    return true;
  }
}

function CheckBefore() {
  $('.required').each(function() {
    if ($(this).val() == 0) $(this).addClass('error');
  });
}

// end form

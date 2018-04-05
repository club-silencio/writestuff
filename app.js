document.addEventListener('DOMContentLoaded', () => {
  
  var sigWrapper = document.getElementById('signature'),
   phraseWrapper = document.getElementById('phrase'),
 signatureCanvas = sigWrapper.querySelector('canvas'),
    phraseCanvas = phraseWrapper.querySelector('canvas'),
   signatureData,
      phraseData;
  
//  setInterval(getForceTouchData,15); // 15? => 1000ms/15 = ~60fps;
  
  phrasePad = new SignaturePad(phraseCanvas, {
    throttle: 0,
    minWidth: 1,
    maxWidth: 3.5,
    minDistance: 0,
    penColor: 'rgb(0, 0, 0)',
    backgroundColor: 'rgba(255, 255, 255, 0)'
  }),
  signaturePad = new SignaturePad(signatureCanvas, {
    throttle: 0,
    minWidth: 1,
    maxWidth: 3.5,
    minDistance: 0,
    penColor: 'rgb(0, 0, 0)',
    backgroundColor: 'rgba(255, 255, 255, 0)'
  });

  // Adjust canvas coordinate space taking into account pixel ratio,
  // to make it look crisp on mobile.
  // This also causes canvas to be cleared.
  
  window.onresize = resizeCanvas;
  resizeCanvas();

  var saveSigButton = $('#next-sig'),
      savePhraseButton = $('#next-phrase'),
      clearSigButton = $('#clear-sig'),
      clearPhraseButton = $('#clear-phrase');
  
  // Initialize fastclick
  
  $(function() {
    FastClick.attach(document.body);
  });
  
  // Prevent elastic scrolling
  document.ontouchmove = function(e) {e.preventDefault()};
  //uses body because jquery on events are called off of the element they are
  //added to, so bubbling would not work if we used document instead.
  $('body').on('touchstart','.scrollable',function(e) {
    if (e.currentTarget.scrollTop === 0) {
      e.currentTarget.scrollTop = 1;
    } else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
      e.currentTarget.scrollTop -= 1;
    }
  });
  //prevents preventDefault from being called on document if it sees a scrollable div
  $('body').on('touchmove','.scrollable',function(e) {
    e.stopPropagation();
  });
  
  // Listeners
  $('input[type=radio]').click(function() {
    if (allFilled() && validateEmail()) {
      $('#submit').removeAttr('disabled');
    }
  });
  
  $('#fname, #lname, #business, #email').on('keyup', function() {
    if (allFilled() && validateEmail()) {
      $('#submit').removeAttr('disabled');
    }
  });
  
  $('.refresh').click(function() {
    window.location.reload(true);
  });
  
  $('#finish').click(function() {
    window.location.reload(true);
  });
  
  $('.error-modal-close').click(function() {
    $('#errorModal').removeClass('is-active');
  });
  
  $('#email').blur(function() {
    if (!(validateEmail())) {
      $('#email-error').animate({opacity: 1});
      $('#email').addClass('is-danger');
      $('#submit').prop('disabled', true);;
    } else {
      $('#email-error').animate({opacity: 0});
      $('#email').removeClass('is-danger');
    }
  })
  
  
  // Section click handlers
  
  $('#splash').click(function() {
    $('#splash').fadeOut();
    
    setTimeout(function() {
      $('#identity').fadeIn();
    }, 500);    
  });
  
  $('#submit').click(function(event) {
    event.preventDefault();
    
    $('#identity').fadeOut();

    setTimeout(function() {
      $('#instructions').fadeIn();
    }, 500);

    var role = $('input[name=role-desc]:checked').val();
    reskin(role);
    
//    if (validateForm() == 'valid') {
//      $('#identity').fadeOut();
//    
//      setTimeout(function() {
//        $('#instructions').fadeIn();
//      }, 500);
//      
//      var role = $('input[name=role-desc]:checked').val();
//      reskin(role);
//    }
  });
  
  $('#next-inst').click(function() {
    $('#instructions').fadeOut();
    
    setTimeout(function() {
      $('#phrase').fadeIn();
    }, 500);
    
    // This needs to fire after phrase is fully rendered.
    setTimeout(function() {
      resizeCanvas();
    }, 600);
  });
                          

  
  savePhraseButton.click(function() {
    phraseData = phrasePad.toDataURL();
    
    $('#phrase').fadeOut();
    setTimeout(function() {
      $('#signature').fadeIn();
    }, 500);
    
    // This needs to fire after signature is fully rendered.
    // May need to make new functions for resizing per canvas
    // because it does clear the canvas data.
    setTimeout(function() {
      resizeCanvas();
    }, 600);
  });
                 
  // Actual AJAX call
  saveSigButton.on('click', function (event) {
    event.preventDefault();
    signatureData = signaturePad.toDataURL();
    
    // trimCanvas(canvas); // trim out whitespace
    
    var dataObject = {
      'fname': $('#fname').val(),
      'lname': $('#lname').val(),
      'business': $('#business').val(),
      'email': $('#email').val(),
      'role': $('input[name=role-desc]:checked', '#identityForm').val(),
      'cardmember': $('input[name=cardmember]:checked', '#identityForm').val(),
//          'phraseType': 'joy',
      'timestamp': moment().format('YYYYMMDDHHmmss'),
      'dateNumber': moment().format('YYYYMMDD'),
      'phraseImg': phraseData,
      'sigImg': signatureData,
      'APIToken': 'ApDB3iPOtkrxfVPcUqS1jC3tXHoeDO',
      'SF_Campaign_ID__C': '701A0000000yyHI',
      'SF_Campaign_ID': '701A0000000yyHI'
    };
    
    console.log(JSON.stringify(dataObject));
    
    $.ajax({
      url: 'http://amex.scanmyhandwriting.com/remote/surveyService.cfm',
      type: 'post',
      crossDomain: true,
      async: true,
      dataType: 'text',
      contentType: 'json',
      data: JSON.stringify(dataObject),
      success: function(result) {
        $('#signature').fadeOut();
    
        setTimeout(function() {
          $('#thanks').fadeIn();
        }, 500);
        
        setTimeout(function() {
          window.location.reload(true);
        }, 7000);
      },
      statusCode: {
        200: function (response) {
            console.log('Success!')
        },
        400: function (response) {
            console.log('Bad Request')
        },
        400: function (response) {
            console.log('Bad Request')
        },
        404: function (response) {
            console.log('Unknown Method')
        },
        500: function (response) {
            console.log(response.responseText);
        },
        503: function (response) {
            console.log('Service unavailable')
        }
      },
      error: function(xhr, textStatus, error){
        console.log(xhr.statusText);
        console.log(textStatus);
        $('#errorModal').addClass('is-active');
      }
    }).done(function(o) {
      console.log(o);
    });
  });

  clearSigButton.on('click', function (event) {
    signaturePad.clear();
    console.log('Clear signature canvas');
  });
  
  clearPhraseButton.on('click', function (event) {
    phrasePad.clear();
    console.log('Clear phrase canvas');
  });
  
  function reskin(role) {
    console.log(role);
    
    if (role == 'Decision Maker') {
      $('#instructions').addClass('purple');
      $('#phrase').addClass('purple');
      $('#signature').addClass('purple');
      $('#thanks').addClass('purple');
    } else if (role == 'Employee') {
      $('#instructions').addClass('green');
      $('#phrase').addClass('green');
      $('#signature').addClass('green');
      $('img.open-logo').attr('src', 'img/logo-open-dark.png');
      $('#thanks').addClass('green');
    } else {
      $('#instructions').addClass('orange');
      $('#phrase').addClass('orange');
      $('#signature').addClass('orange');
      $('#thanks').addClass('orange');
    }
  }
  
  function fadeGhost() {
    $('div.ghost').fadeOut();
  }
  
  function validateEmail() {
    var regex = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/,
        email = $('#email').val();
    return regex.test(email);
  }

  function allFilled() {
    var filled = true,
        validity = 'invalid',
        roleValidity = 'invalid',
        cardmemberValidity = 'invalid',
        roleDesc = $("input[name='role-desc']"),
        cardmember = $("input[name='cardmember']");

    $('input.required').each(function() {
      if ($(this).val() == '') {
        filled = false;
        console.log('Something is empty');
      }
    });
    
    // Check role description radio button
    for (var i = 0; i < roleDesc.length; i++) {
      if (roleDesc[i].checked == true) {
        roleValidity = 'valid';
      }
    }
    
    if (roleValidity === 'invalid') {
      filled = false;
    }
    
    // Check cardmember radio buttons
    for (var i = 0; i < cardmember.length; i++) {
      if (cardmember[i].checked == true) {
        cardmemberValidity = 'valid';
      }
    }
    
    if (cardmemberValidity === 'invalid') {
      filled = false;
    }
    
    return filled
  };
  
  function validateForm() {
    var validity = 'invalid',
        roleValidity = 'invalid',
        cardmemberValidity = 'invalid',
        roleDesc = $("input[name='role-desc']"),
        cardmember = $("input[name='cardmember']");
    
    // Check role description radio buttons
    for (var i = 0; i < roleDesc.length; i++) {
      if (roleDesc[i].checked == true) {
        roleValidity = 'valid';
      }
    }
    
    if (roleValidity === 'invalid') {
      $('.role-label').addClass('is-danger-text');
    }
    
    // Check cardmember radio buttons
    for (var i = 0; i < cardmember.length; i++) {
      if (cardmember[i].checked == true) {
        cardmemberValidity = 'valid';
      }
    }
    
    if (cardmemberValidity === 'invalid') {
      $('.cardmember-label').addClass('is-danger-text');
    }
    
    // Check input fields
    $('input.required').each(function() {
      if ($(this).val() === '') {
        console.log(this);
        $(this).addClass('is-danger');
        validity = 'invalid';
      }      
    });
    
    // Remove error class
    $('form').on('keyup', 'input.is-danger', function(){
      $(this).removeClass('is-danger');
    });
    
    roleDesc.click(function() {
      $('.role-label').removeClass('is-danger-text');
    });
    
    cardmember.click(function() {
      $('.cardmember-label').removeClass('is-danger-text');
    });

    return validity;
  }
  
  function resizeCanvas() {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    console.log('Canvases Cleared.')
    var ratio =  Math.max(window.devicePixelRatio || 1, 1);

    // Size signature canvas
    signatureCanvas.width = signatureCanvas.offsetWidth * ratio;
    signatureCanvas.height = signatureCanvas.offsetHeight * ratio;
    signatureCanvas.getContext("2d").scale(ratio, ratio);
    
    // Size phrase canvas
    phraseCanvas.width = phraseCanvas.offsetWidth * ratio;
    phraseCanvas.height = phraseCanvas.offsetHeight * ratio;
    phraseCanvas.getContext("2d").scale(ratio, ratio);

    // Signature Pad does not listen for canvas changes, so after the canvas is automatically
    // cleared by the browser, SignaturePad#isEmpty might still return false, even though the
    // canvas looks empty, because the internal data of this library wasn't cleared. To make sure
    // that the state of this library is consistent with visual state of the canvas, you
    // have to clear it manually.

    phrasePad.clear();
    signaturePad.clear();
  }

});


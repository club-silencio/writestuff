document.addEventListener('DOMContentLoaded', () => {

  
  var sigWrapper = document.getElementById('signature'),
      phraseWrapper = document.getElementById('phrase'),
  signatureCanvas = sigWrapper.querySelector('canvas'),
  phraseCanvas = phraseWrapper.querySelector('canvas'),
  phrasePad = new SignaturePad(phraseCanvas, {
    throttle: 0,
    minWidth: 1,
    maxWidth: 3.5,
    minDistance: 0,
    penColor: "rgb(0, 0, 0)",
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
  
  
  // Temporary click handlers
  
  $('#splash').click(function() {
    $('#splash').fadeOut();
    
    setTimeout(function() {
      $('#instructions').fadeIn();
    }, 500);    
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
  
  saveSigButton.click(function(){
    $('#signature').fadeOut();
    setTimeout(function() {
      $('#identity').fadeIn();
    }, 500);
  });
  
  savePhraseButton.click(function() {
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
  
  $('#submit').click(function() {
    $('#identity').fadeOut();
    setTimeout(function() {
      $('#thanks').fadeIn();
    }, 500);
  });
  
  // Actual AJAX call
  $('submit').on('click', function (event) {
    event.preventDefault();
    
    // trimCanvas(canvas); // trim out whitespace
    var imageData = signaturePad.toDataURL();
    
    $.ajax({
      url: "server/index.php",
      type: "post",
      crossDomain: true,
      async: true,
      dataType: "text",
      data: {
        'imgBase64': imageData
      },
      success: function(result) {
        console.log('Image saved!');
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
      error: function (e) {
        console.log(e);
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
  
  function resizeCanvas() {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
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
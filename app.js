document.addEventListener('DOMContentLoaded', () => {
  
  var wrapper = document.getElementById('signaturePad'),
  clearButton = wrapper.querySelector('[data-action=clear]'),
  savePNGButton = wrapper.querySelector('[data-action=save-png]'),
  saveSVGButton = wrapper.querySelector('[data-action=save-svg]'),
  canvas = wrapper.querySelector('canvas'),
  signaturePad = new SignaturePad(canvas, {
    throttle: 0,
    minWidth: 1,
    maxWidth: 3.5,
    minDistance: 0,
    penColor: "rgb(0, 0, 0)",
    backgroundColor: 'rgba(255, 255, 255, 0)'
  });

  // Adjust canvas coordinate space taking into account pixel ratio,
  // to make it look crisp on mobile devices.
  // This also causes canvas to be cleared.

  // On mobile devices it might make more sense to listen to orientation change,
  // rather than window resize events.
//  window.onresize = resizeCanvas;
  resizeCanvas();

  var saveButton = document.getElementById('save');
  var cancelButton = document.getElementById('clear');
  
  saveButton.addEventListener('click', function (event) {
    event.preventDefault();
    
    // trimCanvas(canvas); // trim out whitespace
    var imageData = signaturePad.toDataURL();
    
    $.ajax({
      url: "server/index.php",
      type: "post",
      crossDomain: true,
      async: false,
      dataType: "text",
      data: {
        'imgBase64': imageData
      },
      success: function(result) {
        alert('Image saved!');
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
      console.log('saved');
      console.log(o);
      // If you want the file to be visible in the browser 
      // - please modify the callback in javascript. All you
      // need is to return the url to the file, you just saved 
      // and than put the image in your browser.
    });
    // window.open(imageData);
  });

  cancelButton.addEventListener('click', function (event) {
    signaturePad.clear();
  });
  
  function resizeCanvas() {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    var ratio =  Math.max(window.devicePixelRatio || 1, 1);

    // This part causes the canvas to be cleared
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);

    // Signature Pad does not listen for canvas changes, so after the canvas is automatically
    // cleared by the browser, SignaturePad#isEmpty might still return false, even though the
    // canvas looks empty, because the internal data of this library wasn't cleared. To make sure
    // that the state of this library is consistent with visual state of the canvas, you
    // have to clear it manually.
    signaturePad.clear();
  }

});
 chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("app/index.html", {
    'outerBounds': {
      'width': 700,
      'height': 500
    }
  });
});
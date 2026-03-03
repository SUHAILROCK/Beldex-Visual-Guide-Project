/* UI effects module */
function legacyCopyFallback(address) {
  var textArea = document.createElement('textarea');
  textArea.value = address;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'absolute';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();

  var copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (error) {
    copied = false;
  }

  document.body.removeChild(textArea);
  if (!copied) throw new Error('Clipboard copy command not supported');
}

function copyAddress(button, address) {
  function onSuccess() {
    button.classList.add('copied');
    setTimeout(function () {
      button.classList.remove('copied');
    }, 2000);
  }

  function onFailure() {
    console.warn('Clipboard write failed; please copy manually.');
  }

  if (!address) {
    onFailure();
    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(address)
      .then(onSuccess)
      .catch(function () {
        try {
          legacyCopyFallback(address);
          onSuccess();
        } catch (error) {
          onFailure();
        }
      });
    return;
  }

  try {
    legacyCopyFallback(address);
    onSuccess();
  } catch (error) {
    onFailure();
  }
}

export function initUIEffects() {
  document.addEventListener('click', function (event) {
    var navTab = event.target.closest('.nav-tab');
    if (!navTab) return;

    var circle = document.createElement('div');
    var diameter = Math.max(navTab.clientWidth, navTab.clientHeight);
    var radius = diameter / 2;
    var rect = navTab.getBoundingClientRect();

    circle.style.width = diameter + 'px';
    circle.style.height = diameter + 'px';
    circle.style.left = (event.clientX - rect.left - radius) + 'px';
    circle.style.top = (event.clientY - rect.top - radius) + 'px';
    circle.classList.add('ripple');

    var existingRipple = navTab.getElementsByClassName('ripple')[0];
    if (existingRipple) existingRipple.remove();
    navTab.appendChild(circle);
  });

  window.copyAddress = copyAddress;

  document.querySelectorAll('.ca-copy-btn[data-copy-address]').forEach(function (button) {
    button.addEventListener('click', function () {
      copyAddress(button, button.dataset.copyAddress);
    });
  });
}

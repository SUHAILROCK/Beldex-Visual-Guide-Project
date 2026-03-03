/* Theme toggle module */
export function initTheme() {
  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = localStorage.getItem('beldex-theme');

  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggle) themeToggle.textContent = '\uD83C\uDF19';
  }

  if (!themeToggle) return;

  themeToggle.addEventListener('click', function () {
    var isCurrentlyLight = document.documentElement.getAttribute('data-theme') === 'light';
    var newTheme = isCurrentlyLight ? 'dark' : 'light';

    document.documentElement.classList.add('theme-transitioning');

    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      themeToggle.textContent = '\uD83C\uDF19';
      localStorage.setItem('beldex-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '\u2600\uFE0F';
      localStorage.setItem('beldex-theme', 'dark');
    }

    setTimeout(function () {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  });
}

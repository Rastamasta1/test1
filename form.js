// Conductor — email signup form handler (client-only, no backend)
(function () {
  var form = document.getElementById('signup-form');
  var thanks = document.getElementById('thanks');
  var email = document.getElementById('email');
  if (!form || !thanks) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // must be first: no default GET submit

    var value = (email && email.value ? email.value : '').trim();
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!valid) {
      if (email) {
        email.focus();
        email.setAttribute('aria-invalid', 'true');
      }
      return;
    }
    if (email) email.removeAttribute('aria-invalid');

    form.style.display = 'none';
    thanks.style.display = 'block';
    thanks.setAttribute('role', 'status');
  });
})();

/* TR / EN seçimi: kayıtlı tercih → adres (#en-…) → tarayıcı dili. Sayfa çizilmeden önce çalışır. */
(function () {
  var KEY = 'emberline-lang';
  var root = document.documentElement;
  function stored() { try { var s = localStorage.getItem(KEY); return s === 'tr' || s === 'en' ? s : null; } catch (e) { return null; } }
  function save(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }
  function browser() {
    var n = (navigator.languages && navigator.languages[0]) || navigator.language || 'tr';
    return /^tr/i.test(n) ? 'tr' : 'en';
  }
  var first = /^#en-/.test(location.hash) ? 'en' : (stored() || browser());

  function apply(l) {
    root.lang = l;
    root.classList.toggle('l-en', l === 'en');
    var t = root.getAttribute('data-title-' + l);
    if (t) document.title = t;
    var btns = document.querySelectorAll('[data-set-lang]');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i].getAttribute('data-set-lang') === l));
    document.dispatchEvent(new CustomEvent('langchange', { detail: l }));
  }
  window.emberLang = function () { return root.classList.contains('l-en') ? 'en' : 'tr'; };
  apply(first);
  document.addEventListener('DOMContentLoaded', function () {
    apply(window.emberLang());
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-set-lang]') : null;
      if (!b) return;
      var l = b.getAttribute('data-set-lang');
      save(l); apply(l);
    });
  });
})();

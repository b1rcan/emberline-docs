(function () {
  function L() { return window.emberLang ? window.emberLang() : 'tr'; }
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NAMES = { tr: { l: 'Yolcu', r: 'Bekçi' }, en: { l: 'The traveller', r: 'The watchman' } };

  // Bir sahne anını bir okuma ekranına uygula: konuşan öne çıkar, öteki geri çekilir.
  function setBeat(view, beat) {
    var side = beat[0], txt = beat[1];
    var l = view.querySelector('.char.l'), r = view.querySelector('.char.r');
    var bub = view.querySelector('.bubble');
    l.classList.toggle('dim', side !== 'l');
    r.classList.toggle('dim', side !== 'r');
    bub.className = 'bubble ' + (side === 'n' ? 'narr' : side === 'l' ? 'left' : 'right');
    bub.querySelector('.who').textContent = side === 'n' ? '' : NAMES[L()][side];
    bub.querySelector('.who').style.display = side === 'n' ? 'none' : '';
    bub.querySelector('.txt').textContent = txt;
  }
  function pop(el) { if (calm) return; el.classList.add('hide'); void el.offsetWidth; el.classList.remove('hide'); }

  // ============ açılıştaki oynanabilir sahne ============
  var PLAY = {
    tr: {
      start: { d: 1, beats: [['n', 'Koridorun sonundaki kapı aralık. İçeriden biri adını söylüyor.'], ['r', 'Geç kaldın. Seni bekliyordum.'], ['l', 'Beni nereden tanıyorsun?']], choices: [['Kapıyı it ve içeri gir', 'gir'], ['Olduğun yerde bekle', 'bekle']] },
      gir: { d: 2, beats: [['n', 'İçerisi loş. Masada senin için bırakılmış bir mektup duruyor.'], ['r', 'Aç onu. Ama okuduktan sonra geri dönüş yok.']], choices: [['Mektubu aç', 'mektup'], ['Önce bekçiyi sorgula', 'sorgu']] },
      bekle: { d: 2, beats: [['r', 'Demek temkinlisin. İyi.'], ['n', 'Kapının altından katlanmış bir kâğıt kayıyor.']], choices: [['Kâğıdı al', 'kagit'], ['Kapıyı zorla aç', 'gir']] },
      mektup: { d: 3, beats: [['n', '"Geleceğini biliyordum," yazıyor. "Ama beklemeyi seçseydin, sana başka bir şey söyleyecektim."']] },
      sorgu: { d: 3, beats: [['r', 'Soru sormayı seviyorsun. Ama her soru bir kapıyı kapatır.'], ['n', 'Döndüğünde mektup masada yok.']] },
      kagit: { d: 3, beats: [['l', '"İçeri girmediğin için teşekkürler." Bu da ne demek?'], ['n', 'Bu cümlenin anlamını ancak hikâyenin sonunda öğreneceksin.']] },
      reset: 'Baştan oku, başka yol seç', end: 'Son'
    },
    en: {
      start: { d: 1, beats: [['n', 'The door at the end of the corridor is ajar. Someone inside is saying your name.'], ['r', 'You\'re late. I was waiting for you.'], ['l', 'How do you know me?']], choices: [['Push the door and go in', 'gir'], ['Wait where you are', 'bekle']] },
      gir: { d: 2, beats: [['n', 'It is dim inside. On the table lies a letter left for you.'], ['r', 'Open it. But once you read it, there\'s no going back.']], choices: [['Open the letter', 'mektup'], ['Question the watchman first', 'sorgu']] },
      bekle: { d: 2, beats: [['r', 'Careful, are you? Good.'], ['n', 'A folded note slides out from under the door.']], choices: [['Take the note', 'kagit'], ['Force the door open', 'gir']] },
      mektup: { d: 3, beats: [['n', '"I knew you would come," it says. "But if you had chosen to wait, I would have told you something else."']] },
      sorgu: { d: 3, beats: [['r', 'You like asking questions. But every question closes a door.'], ['n', 'When you turn back, the letter is gone from the table.']] },
      kagit: { d: 3, beats: [['l', '"Thank you for not coming in." What does that mean?'], ['n', 'You will only understand it at the end of the story.']] },
      reset: 'Start over, take another path', end: 'End'
    }
  };
  var play = document.getElementById('play');
  var ps = { node: 'start', beat: 0 };
  function renderPlay(animate) {
    if (!play) return;
    var S = PLAY[L()], n = S[ps.node];
    var bub = play.querySelector('.bubble');
    setBeat(play, n.beats[ps.beat]);
    if (animate) pop(bub);
    var last = ps.beat >= n.beats.length - 1;
    var box = document.getElementById('playChoices');
    document.getElementById('playStep').textContent = n.choices ? n.d + '/3' : S.end;
    document.getElementById('playTap').hidden = last;
    document.getElementById('playHint').hidden = last;
    box.hidden = !last;
    box.innerHTML = '';
    if (!last) return;
    var opts = n.choices || [[S.reset, 'start', 'reset']];
    opts.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = o[0]; if (o[2]) b.className = o[2];
      b.addEventListener('click', function () { ps = { node: o[1], beat: 0 }; renderPlay(true); });
      box.appendChild(b);
    });
  }
  if (play) document.getElementById('playTap').addEventListener('click', function () { ps.beat++; renderPlay(true); });

  // ============ adım 2: kendi kendine akan okuma ekranı ============
  var READ = {
    tr: [['n', 'Yağmur camı dövüyor. Odada iki kişi, aralarında söylenmemiş bir şey.'], ['l', 'Bana o gece ne olduğunu anlatacak mısın?'], ['r', 'Anlatırsam bana inanacak mısın?'], ['l', 'Denemeden bilemezsin.'], ['r', 'Peki. Ama önce kapıyı kapat.']],
    en: [['n', 'Rain beats on the glass. Two people in the room, something unsaid between them.'], ['l', 'Will you tell me what happened that night?'], ['r', 'If I tell you, will you believe me?'], ['l', 'You won\'t know until you try.'], ['r', 'Fine. But close the door first.']]
  };
  var readI = 0;
  function renderReaders(animate) {
    var b = READ[L()][readI];
    document.querySelectorAll('.auto-reader').forEach(function (v) { setBeat(v, b); if (animate) pop(v.querySelector('.bubble')); });
  }

  // ============ adım 3: kendi kendine oynayan soru merkezi ============
  var HUB = {
    tr: {
      open: 'Sor bakalım. Ama vaktim az, her şeyi anlatamam.',
      qs: ['O gece neredeydin?', 'Neden şimdi konuşuyorsun?', 'Bana bir sır verir misin?'],
      a1: 'Kapının önünde. Ama biri benden önce gelmişti.', f1: 'Kimdi o?',
      a2: 'Yüzünü görmedim. Ama yürüyüşünü tanıdım.', f2: 'Nasıl bir yürüyüş?',
      a3: 'Sol bacağını hafif sürüyordu. Bu koridorlarda öyle yürüyen tek kişi var.',
      exit: 'Konuyu kapat',
      flags: ['Bir soru seç.', 'Bir soru seçtin…', 'Öteki sorular kapandı. Daha derine inebilirsin.', '2. takip sorusu', '✦ Önemli bilgi kaydedildi']
    },
    en: {
      open: 'Go on, ask. But I have little time, I can\'t tell you everything.',
      qs: ['Where were you that night?', 'Why are you talking now?', 'Will you tell me a secret?'],
      a1: 'At the door. But someone got there before me.', f1: 'Who was it?',
      a2: 'I didn\'t see the face. But I knew the walk.', f2: 'What kind of walk?',
      a3: 'Dragging the left leg a little. Only one person in these corridors walks like that.',
      exit: 'Close the topic',
      flags: ['Pick a question.', 'You picked a question…', 'The other questions are closed. You can go deeper.', 'Follow-up, level 2', '✦ Key information saved']
    }
  };
  var hubI = 0;
  function q(t, cls) { var d = document.createElement('div'); d.className = 'q' + (cls ? ' ' + cls : ''); d.textContent = t; return d; }
  function renderHubs() {
    var H = HUB[L()], i = hubI;
    document.querySelectorAll('.auto-hub').forEach(function (v) {
      var said = v.querySelector('.said'), qs = v.querySelector('.qs');
      qs.innerHTML = '';
      said.textContent = i < 2 ? H.open : i === 2 ? H.a1 : i === 3 ? H.a2 : H.a3;
      if (i < 2) H.qs.forEach(function (t, j) { qs.appendChild(q(t, i === 1 && j === 0 ? 'pick' : '')); });
      else if (i === 2) { qs.appendChild(q(H.qs[0], 'pick')); qs.appendChild(q(H.f1, 'follow')); qs.appendChild(q(H.exit, 'exit')); qs.appendChild(q(H.qs[1], 'gone')); qs.appendChild(q(H.qs[2], 'gone')); }
      else if (i === 3) { qs.appendChild(q(H.f1, 'pick')); qs.appendChild(q(H.f2, 'follow')); qs.appendChild(q(H.exit, 'exit')); }
      else { qs.appendChild(q(H.f2, 'pick')); }
      v.querySelector('.flag').textContent = H.flags[i];
    });
  }

  // ============ adımlar: yapışkan telefonda ekran değiştir ============
  var demo = document.getElementById('demoScreen');
  var steps = document.querySelectorAll('.step');
  steps.forEach(function (st) {
    var src = demo && demo.querySelector('[data-v="' + st.getAttribute('data-view') + '"]');
    var holder = st.querySelector('.inline-phone');
    if (!src || !holder) return;
    var phone = document.createElement('div'); phone.className = 'phone'; phone.setAttribute('aria-hidden', 'true');
    var screen = document.createElement('div'); screen.className = 'screen';
    var c = src.cloneNode(true); c.classList.add('on');
    screen.appendChild(c); phone.appendChild(screen); holder.appendChild(phone);
  });
  function showView(name) {
    if (!demo) return;
    demo.querySelectorAll('.view').forEach(function (v) { v.classList.toggle('on', v.getAttribute('data-v') === name); });
    steps.forEach(function (s) { s.classList.toggle('active', s.getAttribute('data-view') === name); });
  }
  if ('IntersectionObserver' in window && steps.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) showView(e.target.getAttribute('data-view')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }

  // ============ dallanma haritası ============
  var ENDS = {
    tr: [['I · Birlikte', 'Doğruyu söyledin ve yalnız kalmadın. Yolların en açık sonu.'], ['II · Bedel', 'Bir şey kazandın, bir şey kaybettin. İki ayrı yol bu sonda buluşur.'], ['III · Yalnız', 'Sırrı sakladın ve tek başına yürüdün. Ne olduğunu kimse bilmeyecek.']],
    en: [['I · Together', 'You told the truth and you weren\'t left alone. The most open of the endings.'], ['II · The price', 'You gained something and lost something. Two different paths meet at this ending.'], ['III · Alone', 'You kept the secret and walked alone. No one will ever know what happened.']]
  };
  var br = { a: 0, b: 0 };
  function $(id) { return document.getElementById(id); }
  function renderBranch(animate) {
    if (!$('p-sa')) return;
    var on = {};
    var mid = br.a === 0 ? 'a' : 'b';
    on['p-s' + mid] = 1; on['n-' + mid] = 1;
    var end = br.a === 0 ? (br.b === 0 ? 1 : 2) : (br.b === 0 ? 2 : 3);
    on['p-' + mid + (br.b + 1)] = 1; on['e-' + end] = 1; on['t-' + end] = 1;
    ['p-sa', 'p-sb', 'p-a1', 'p-a2', 'p-b1', 'p-b2', 'n-a', 'n-b', 'e-1', 'e-2', 'e-3', 't-1', 't-2', 't-3'].forEach(function (id) {
      var el = $(id), was = el.classList.contains('on'), now = !!on[id];
      el.classList.toggle('on', now);
      if (now && !was && animate && !calm && el.tagName === 'path') {
        var len = Math.ceil(el.getTotalLength());
        el.style.transition = 'none'; el.style.strokeDasharray = len; el.style.strokeDashoffset = len;
        void el.getBoundingClientRect();
        el.style.transition = 'stroke-dashoffset .7s ease, stroke .45s, stroke-width .45s'; el.style.strokeDashoffset = 0;
      }
    });
    var E = ENDS[L()][end - 1];
    $('endName').textContent = E[0]; $('endText').textContent = E[1];
  }
  document.querySelectorAll('.seg').forEach(function (seg) {
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      br[seg.getAttribute('data-ctl')] = +b.getAttribute('data-v');
      renderBranch(true);
    });
  });

  // ============ başlat ============
  function renderAll() { renderPlay(false); renderReaders(false); renderHubs(); renderBranch(false); }
  renderAll();
  document.addEventListener('langchange', renderAll);
  if (!calm) {
    setInterval(function () { if (document.hidden) return; readI = (readI + 1) % READ.tr.length; renderReaders(true); }, 2800);
    setInterval(function () { if (document.hidden) return; hubI = (hubI + 1) % 5; renderHubs(); }, 2400);
  }
})();

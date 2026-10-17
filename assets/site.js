(function () {
  function L() { return window.emberLang ? window.emberLang() : 'tr'; }

  // ---- deneme sahnesi / sample scene ----
  var scene = {
    tr: {
      start: { line: 'Koridorun sonundaki kapı aralık. İçeriden biri, alçak sesle adını söylüyor.', choices: [['Kapıyı it ve içeri gir', 'gir'], ['Kapıyı çal ve bekle', 'cal']] },
      gir: { line: 'İçerisi karanlık, ama ses artık susmuş. Masanın üstünde senin için bırakılmış bir mektup duruyor.', choices: [['Mektubu aç', 'mektup'], ['Işığı yakmayı dene', 'isik']] },
      cal: { line: 'Ses kesiliyor. Bir süre hiçbir şey olmuyor, sonra kapının altından katlanmış bir kâğıt kayıyor.', choices: [['Kâğıdı al', 'kagit'], ['Kapıyı zorla aç', 'gir']] },
      mektup: { line: '"Geleceğini biliyordum," yazıyor. "Ama kapıyı çalsaydın, sana başka bir şey söyleyecektim."', end: true },
      isik: { line: 'Lamba yanıyor. Oda boş. Masada mektup yok, çünkü onu birinin şimdi aldığını fark ediyorsun.', end: true },
      kagit: { line: 'Kâğıtta tek bir cümle var: "İçeri girmediğin için teşekkürler." Bu cümlenin anlamını ancak hikâyenin sonunda öğreneceksin.', end: true },
      reset: 'Baştan oku, başka bir yol seç'
    },
    en: {
      start: { line: 'The door at the end of the corridor is ajar. Someone inside is quietly saying your name.', choices: [['Push the door and go in', 'gir'], ['Knock and wait', 'cal']] },
      gir: { line: 'It is dark inside, and the voice has gone quiet. On the table lies a letter left for you.', choices: [['Open the letter', 'mektup'], ['Try the light', 'isik']] },
      cal: { line: 'The voice stops. For a while nothing happens, then a folded note slides out from under the door.', choices: [['Take the note', 'kagit'], ['Force the door open', 'gir']] },
      mektup: { line: '"I knew you would come," it says. "But if you had knocked, I would have told you something else."', end: true },
      isik: { line: 'The lamp comes on. The room is empty. There is no letter on the table, because someone has only just taken it.', end: true },
      kagit: { line: 'The note holds a single sentence: "Thank you for not coming in." You will only understand it at the end of the story.', end: true },
      reset: 'Start over and take another path'
    }
  };
  var lineEl = document.getElementById('sceneLine');
  var chEl = document.getElementById('sceneChoices');
  var sceneKey = 'start';
  function fresh(el) { el.classList.remove('fresh'); void el.offsetWidth; el.classList.add('fresh'); }
  function show(key, animate) {
    sceneKey = key;
    var S = scene[L()], s = S[key];
    lineEl.textContent = s.line;
    if (animate) fresh(lineEl);
    chEl.innerHTML = '';
    var opts = s.end ? [[S.reset, 'start', true]] : s.choices;
    opts.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'choice' + (o[2] ? ' reset' : ''); b.textContent = o[0];
      b.addEventListener('click', function () { show(o[1], true); });
      chEl.appendChild(b);
    });
  }

  // ---- soru merkezi / question hub ----
  var said = document.getElementById('askSaid');
  var qEl = document.getElementById('askQ');
  var note = document.getElementById('askNote');
  var ask = {
    tr: {
      open: 'Sor bakalım. Ama vaktim az, her şeyi anlatamam.', pick: 'Bir soru seç.',
      root: [
        { q: 'O gece neredeydin?', a: 'Kapının önünde. Her gece olduğu gibi. Ama o gece biri benden önce gelmişti.', follow: { q: 'Kimdi o?', a: 'Yüzünü görmedim. Ama yürüyüşünü tanıdım; bu koridorlarda onun gibi yürüyen tek kişi var.' } },
        { q: 'Neden şimdi konuşuyorsun?', a: 'Çünkü sen sordun. Daha önce kimse sormadı.', follow: { q: 'Başka kim bilmeli bunu?', a: 'Kimse. Ve bana sorarsan, sen de unutsan iyi olur.' } },
        { q: 'Bana bir sır verir misin?', a: 'Sırlar bedava değildir. Belki bir dahaki sefere.', follow: null }
      ],
      closed: 'Öteki sorular kapandı. Aynı konuda daha derine inebilirsin.',
      deeper: 'Konuyu derinleştirdin. Öteki sorular bu konuşmada sorulmadan kaldı.',
      skipped: 'Takip sorusunu sormadın. Belki ileride önemli olacak.',
      noFollow: 'Bu konunun devamı yok. Öteki sorular kapandı.',
      closeTopic: 'Konuyu kapat', fine: 'Peki. Kendi bileceğin iş.', retry: 'Konuşmayı baştan dene', locked: ' (sorulamaz)'
    },
    en: {
      open: 'Go on, ask. But I have little time, I can\'t tell you everything.', pick: 'Pick a question.',
      root: [
        { q: 'Where were you that night?', a: 'At the door. Like every night. But that night, someone got there before me.', follow: { q: 'Who was it?', a: 'I didn\'t see the face. But I knew the walk; only one person in these corridors walks like that.' } },
        { q: 'Why are you talking now?', a: 'Because you asked. Nobody asked before.', follow: { q: 'Who else should know this?', a: 'No one. And if you ask me, you\'d better forget it too.' } },
        { q: 'Will you tell me a secret?', a: 'Secrets aren\'t free. Maybe next time.', follow: null }
      ],
      closed: 'The other questions are closed. You can dig deeper into this topic.',
      deeper: 'You went deeper. The other questions stayed unasked in this conversation.',
      skipped: 'You didn\'t ask the follow-up. It may matter later.',
      noFollow: 'This topic goes no further. The other questions are closed.',
      closeTopic: 'Close the topic', fine: 'Fine. Your call.', retry: 'Try the conversation again', locked: ' (closed)'
    }
  };
  var askState = { step: 'root', idx: -1 };
  function setSaid(t, animate) { said.textContent = t; if (animate) fresh(said); }
  function btn(text, cls, fn) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = text; if (cls) b.className = cls;
    b.addEventListener('click', fn); qEl.appendChild(b); return b;
  }
  function renderAsk(animate) {
    var A = ask[L()]; qEl.innerHTML = '';
    var st = askState;
    if (st.step === 'root') {
      setSaid(A.open, animate); note.textContent = A.pick;
      A.root.forEach(function (item, i) { btn(item.q, '', function () { askState = { step: 'answer', idx: i }; renderAsk(true); }); });
      return;
    }
    var item = A.root[st.idx];
    if (st.step === 'answer') {
      setSaid(item.a, animate);
      if (item.follow) {
        note.textContent = A.closed;
        btn(item.follow.q, 'follow', function () { askState = { step: 'deeper', idx: st.idx }; renderAsk(true); });
        btn(A.closeTopic, 'close', function () { askState = { step: 'skipped', idx: st.idx }; renderAsk(true); });
      } else {
        note.textContent = A.noFollow;
        btn(A.retry, 'close', function () { askState = { step: 'root', idx: -1 }; renderAsk(true); });
      }
      A.root.forEach(function (o, j) { if (j !== st.idx) { var d = btn(o.q, '', null); d.disabled = true; d.setAttribute('aria-label', o.q + A.locked); } });
      return;
    }
    if (st.step === 'deeper') { setSaid(item.follow.a, animate); note.textContent = A.deeper; }
    else { setSaid(A.fine, animate); note.textContent = A.skipped; }
    btn(A.retry, 'close', function () { askState = { step: 'root', idx: -1 }; renderAsk(true); });
  }

  function renderAll() {
    if (lineEl && chEl) show(sceneKey, false);
    if (said && qEl) renderAsk(false);
  }
  renderAll();
  document.addEventListener('langchange', renderAll);

  // ---- dallanma çizimi: görünür olunca bir kez ----
  var g = document.querySelector('.paths .draw');
  if (g) {
    g.querySelectorAll('path').forEach(function (p) { p.style.setProperty('--len', Math.ceil(p.getTotalLength())); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { g.classList.add('on'); io.disconnect(); } });
      }, { threshold: 0.45 });
      io.observe(g.closest('svg'));
    } else g.classList.add('on');
  }
})();

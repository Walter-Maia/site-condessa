/* Studio: menu, links de agendamento, câmera da entrada e salas na rolagem.
   Um único rAF; lê antes de escrever; nada roda fora da tela ou em modo estático. */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var comFx = raiz.classList.contains('fx');
  var topo = document.getElementById('topo');
  var todos = function (sel, base) { return Array.prototype.slice.call((base || document).querySelectorAll(sel)); };
  var limitar = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var faixa = function (p, a, b) { return limitar((p - a) / (b - a), 0, 1); };
  var suave = function (t) { return t * t * (3 - 2 * t); };

  /* ---------- Links do WhatsApp com o nome do procedimento ---------- */
  todos('a[data-zap]').forEach(function (a) {
    var nome = a.getAttribute('data-zap');
    if (!nome) return;
    try {
      var u = new URL(a.href);
      u.searchParams.set('text', 'Olá! Vim pelo site e gostaria de saber mais sobre ' + nome + '.');
      a.href = u.toString();
    } catch (e) { /* mantém o link padrão */ }
  });

  /* ---------- Menu em tela cheia ---------- */
  var menu = document.getElementById('menu');
  var abrir = document.getElementById('abrir-menu');
  var fechar = document.getElementById('fechar-menu');

  var definirMenu = function (aberto) {
    if (!menu) return;
    menu.classList.toggle('is-aberto', aberto);
    abrir.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    raiz.style.overflow = aberto ? 'hidden' : '';
    if (aberto) { fechar.focus(); } else { abrir.focus(); }
  };

  if (menu && abrir && fechar) {
    abrir.addEventListener('click', function () { definirMenu(true); });
    fechar.addEventListener('click', function () { definirMenu(false); });
    menu.addEventListener('click', function (ev) {
      if (ev.target.closest && ev.target.closest('a')) {
        menu.classList.remove('is-aberto');
        abrir.setAttribute('aria-expanded', 'false');
        raiz.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && menu.classList.contains('is-aberto')) definirMenu(false);
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (m) {
      if (m.matches && menu.classList.contains('is-aberto')) definirMenu(false);
    });
  }

  /* ---------- Revelar ao rolar ---------- */
  var itens = todos('[data-revelar]');
  if (comFx && 'IntersectionObserver' in window) {
    var alturaJanela = window.innerHeight;
    // O que já está na tela nasce pronto; só o que está abaixo da dobra é armado.
    itens.forEach(function (el) {
      if (el.getBoundingClientRect().top < alturaJanela * 0.92) el.classList.add('is-visivel');
    });
    raiz.classList.add('revelar-armado');
    var obsRevelar = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visivel');
          obsRevelar.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    itens.forEach(function (el) { if (!el.classList.contains('is-visivel')) obsRevelar.observe(el); });
  }

  /* ---------- Rolagem ---------- */
  var entrada = document.getElementById('entrada');
  var palco = entrada && entrada.querySelector('.entrada__palco');
  var cams = entrada ? todos('.entrada__cam', entrada) : [];
  var salas = todos('.sala');
  var mapa = document.getElementById('mapa');
  var linksMapa = mapa ? todos('a', mapa) : [];
  var retrato = window.matchMedia('(orientation: portrait)');

  var vh = window.innerHeight;
  var alvo = 0;      // progresso da entrada medido na rolagem
  var atual = -1;    // progresso suavizado que vai para a tela
  var ultimoQuadro = 0;
  var agendado = false;
  var salasVisiveis = [];

  // Ponto de fuga de cada "câmera" em px, calculado sobre o recorte real da imagem (object-fit: cover).
  var ajustarFocos = function () {
    cams.forEach(function (cam) {
      var img = cam.querySelector('img');
      var sufixo = retrato.matches ? 'v' : '';
      var fx = parseFloat(cam.getAttribute('data-foco-x' + sufixo)) || 0.5;
      var fy = parseFloat(cam.getAttribute('data-foco-y' + sufixo)) || 0.5;
      var bw = cam.clientWidth, bh = cam.clientHeight;
      var iw = img.naturalWidth || 16, ih = img.naturalHeight || 9;
      var s = Math.max(bw / iw, bh / ih);
      var x = (bw - iw * s) / 2 + fx * iw * s;
      var y = (bh - ih * s) / 2 + fy * ih * s;
      cam.style.transformOrigin = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
    });
  };

  var pintarEntrada = function (p) {
    // 0 → 0.36: aproxima da porta. A troca para a recepção acontece na chegada
    // (0.14 → 0.33), sem o zoom extremo dentro da fachada.
    var t = Math.pow(faixa(p, 0, 0.36), 1.15);
    var fs = Math.pow(3.2, t);
    var fo = 1 - suave(faixa(p, 0.14, 0.33));
    // A recepção assenta e segue num avanço lento enquanto o site sobe por cima (0.55 → 1).
    var rs = 1.24 - 0.24 * suave(faixa(p, 0.1, 0.5)) + 0.06 * faixa(p, 0.5, 1);
    var t1 = 1 - faixa(p, 0, 0.1);
    var t2 = faixa(p, 0.36, 0.46);
    var cl = faixa(p, 0.56, 1) * 0.55;

    var st = palco.style;
    st.setProperty('--fs', fs.toFixed(4));
    st.setProperty('--fo', fo.toFixed(3));
    st.setProperty('--rs', rs.toFixed(4));
    st.setProperty('--t1', t1.toFixed(3));
    st.setProperty('--t2', t2.toFixed(3));
    st.setProperty('--veu', t1.toFixed(3));
    st.setProperty('--cl', cl.toFixed(3));
  };

  var quadro = function () {
    agendado = false;
    var y = window.pageYOffset;
    var total = document.documentElement.scrollHeight - vh;

    // -- leituras --
    var rEntrada = entrada ? entrada.getBoundingClientRect() : null;
    var medidas = salasVisiveis.map(function (s) { return s.getBoundingClientRect(); });

    // -- escritas --
    if (topo) {
      // com efeitos: o cabeçalho fica sólido quando o site encosta no topo
      var limite = rEntrada && comFx ? rEntrada.height - vh - 90 : vh * 0.5;
      topo.classList.toggle('is-solido', y > limite);
      topo.style.setProperty('--prog', total > 0 ? limitar(y / total, 0, 1).toFixed(4) : '0');
    }

    if (!comFx) return;

    if (rEntrada && palco) {
      var curso = rEntrada.height - vh;
      alvo = curso > 0 ? limitar(-rEntrada.top / curso, 0, 1) : 0;
      // Suavização por tempo (não por quadro): igual em 60 Hz, 120 Hz ou com quadros perdidos.
      var agora = performance.now();
      var dt = agora - ultimoQuadro;
      ultimoQuadro = agora;
      if (atual < 0 || dt > 180) atual = alvo;
      else atual += (alvo - atual) * (1 - Math.exp(-dt / 95));
      if (Math.abs(alvo - atual) < 0.0004) atual = alvo;
      if (rEntrada.bottom > -vh) pintarEntrada(atual);
      if (atual !== alvo) agendar();
    }

    salasVisiveis.forEach(function (sala, i) {
      var r = medidas[i];
      var chegada = limitar((vh - r.top) / vh, 0, 1);          // a sala sobe até encostar no topo
      var dentro = limitar(-r.top / Math.max(1, r.height - vh), 0, 1);
      var zoom = 1.16 - 0.1 * chegada - 0.06 * dentro;
      var entra = faixa(-r.top, vh * 0.3, vh * 0.85);          // cartões começam a cobrir o fundo
      var sai = faixa(r.bottom - vh, vh * 0.02, vh * 0.3);     // no fim, a sala reaparece limpa
      sala.style.setProperty('--zoom', zoom.toFixed(4));
      sala.style.setProperty('--veu', (Math.min(entra, sai) * 0.62).toFixed(3));
    });
  };

  var agendar = function () {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(quadro);
  };

  if (comFx && 'IntersectionObserver' in window) {
    var obsSalas = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        var i = salasVisiveis.indexOf(e.target);
        if (e.isIntersecting && i < 0) salasVisiveis.push(e.target);
        if (!e.isIntersecting && i >= 0) salasVisiveis.splice(i, 1);
      });
      agendar();
    }, { rootMargin: '20% 0px 20% 0px' });
    salas.forEach(function (s) { obsSalas.observe(s); });

    // Sala atual no mapa lateral
    if (mapa) {
      var noMeio = [];
      var obsMapa = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          var i = noMeio.indexOf(e.target);
          if (e.isIntersecting && i < 0) noMeio.push(e.target);
          if (!e.isIntersecting && i >= 0) noMeio.splice(i, 1);
        });
        var atualId = noMeio.length ? noMeio[noMeio.length - 1].id : '';
        mapa.classList.toggle('is-ligado', !!atualId);
        linksMapa.forEach(function (a) {
          if (a.getAttribute('href') === '#' + atualId) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }, { rootMargin: '-48% 0px -48% 0px' });
      salas.forEach(function (s) { obsMapa.observe(s); });
    }
  }

  var aoRedimensionar = function () {
    vh = window.innerHeight;
    if (comFx) ajustarFocos();
    agendar();
  };

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', aoRedimensionar);
  retrato.addEventListener('change', aoRedimensionar);
  cams.forEach(function (cam) {
    var img = cam.querySelector('img');
    if (img && !img.complete) img.addEventListener('load', aoRedimensionar);
  });

  if (comFx) ajustarFocos();
  agendar();
})();

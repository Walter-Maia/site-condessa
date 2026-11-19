/* Studio: menu, links de agendamento, câmera da entrada e salas na rolagem.

   Regras de desempenho deste arquivo:
   - um único requestAnimationFrame por quadro, disparado pela rolagem;
   - posições das seções ficam em cache (medidas só quando o layout muda),
     então rolar não força o navegador a recalcular layout;
   - só transform e opacity são escritos, direto no elemento animado e apenas
     quando o valor muda (nada de variáveis CSS em contêineres);
   - as fotos de fundo são decodificadas antes de a sala chegar à tela. */
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
  var cam = entrada && entrada.querySelector('.entrada__cam');
  var camImg = cam && cam.querySelector('img');
  var veuEntrada = entrada && entrada.querySelector('.entrada__veu');
  var sombra = entrada && entrada.querySelector('.entrada__sombra');
  var txt = entrada && entrada.querySelector('.entrada__txt');
  var role = entrada && entrada.querySelector('.entrada__role');
  var progresso = topo && topo.querySelector('.topo__progresso');
  var mapa = document.getElementById('mapa');
  var linksMapa = mapa ? todos('a', mapa) : [];
  var retrato = window.matchMedia('(orientation: portrait)');

  var salas = todos('.sala').map(function (el) {
    return {
      el: el,
      img: el.querySelector('.sala__fundo img'),
      veu: el.querySelector('.sala__veu'),
      topo: 0, altura: 0,
      perto: false, pedida: false,
      zoom: '', brilho: ''
    };
  });

  var vh = window.innerHeight;
  var m = { eTopo: 0, eAlt: 0, total: 1 };   // medidas em cache
  var sujo = true;                           // layout mudou: medir de novo no próximo quadro
  var alvo = 0;                              // progresso da entrada medido na rolagem
  var atual = -1;                            // progresso suavizado que vai para a tela
  var ultimoQuadro = 0;
  var agendado = false;
  var eraSolido = null;
  var ult = {};                              // últimos valores escritos (evita escrita repetida)

  var escrever = function (el, prop, valor, chave) {
    if (!el || ult[chave] === valor) return;
    ult[chave] = valor;
    el.style[prop] = valor;
  };

  var medir = function () {
    sujo = false;
    vh = window.innerHeight;
    var y = window.pageYOffset;
    if (entrada) {
      var r = entrada.getBoundingClientRect();
      m.eTopo = r.top + y;
      m.eAlt = r.height;
    }
    salas.forEach(function (s) {
      var rs = s.el.getBoundingClientRect();
      s.topo = rs.top + y;
      s.altura = rs.height;
    });
    m.total = Math.max(1, raiz.scrollHeight - vh);
  };

  // Ponto de fuga da câmera (a porta) em px, sobre o recorte real da imagem (object-fit: cover).
  var ajustarFoco = function () {
    if (!cam || !camImg) return;
    var sufixo = retrato.matches ? 'v' : '';
    var fx = parseFloat(cam.getAttribute('data-foco-x' + sufixo)) || 0.5;
    var fy = parseFloat(cam.getAttribute('data-foco-y' + sufixo)) || 0.5;
    var bw = cam.clientWidth, bh = cam.clientHeight;
    var iw = camImg.naturalWidth || 16, ih = camImg.naturalHeight || 9;
    var s = Math.max(bw / iw, bh / ih);
    var x = (bw - iw * s) / 2 + fx * iw * s;
    var y = (bh - ih * s) / 2 + fy * ih * s;
    cam.style.transformOrigin = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
  };

  // Entrada: a câmera se aproxima da porta e o site sobe por cima (sem cena intermediária).
  var pintarEntrada = function (p) {
    var escala = Math.pow(2.2, Math.pow(p, 1.05));
    var texto = 1 - faixa(p, 0, 0.16);
    var escuro = suave(faixa(p, 0.28, 1)) * 0.5;
    escrever(cam, 'transform', 'scale(' + escala.toFixed(4) + ')', 'cam');
    escrever(txt, 'opacity', texto.toFixed(3), 'txtO');
    escrever(txt, 'transform', 'translate3d(0,' + ((1 - texto) * -30).toFixed(1) + 'px,0)', 'txtT');
    escrever(veuEntrada, 'opacity', texto.toFixed(3), 'veu');
    escrever(role, 'opacity', texto.toFixed(3), 'role');
    escrever(sombra, 'opacity', escuro.toFixed(3), 'sombra');
  };

  var pedirImagem = function (s) {
    if (s.pedida || !s.img) return;
    s.pedida = true;
    s.img.loading = 'eager';
    if (s.img.decode) s.img.decode().catch(function () { /* decodifica na pintura, como antes */ });
  };

  var quadro = function () {
    agendado = false;
    if (sujo) medir();
    var y = window.pageYOffset;

    // -- cabeçalho --
    if (topo) {
      var limite = comFx ? m.eTopo + m.eAlt - vh - 90 : vh * 0.5;
      var solido = y > limite;
      if (solido !== eraSolido) { eraSolido = solido; topo.classList.toggle('is-solido', solido); }
      escrever(progresso, 'transform', 'scaleX(' + limitar(y / m.total, 0, 1).toFixed(4) + ')', 'prog');
    }

    if (!comFx) return;

    // -- entrada --
    if (entrada && cam) {
      var dentroEntrada = y < m.eTopo + m.eAlt;
      if (dentroEntrada !== ult.entradaOn) {
        ult.entradaOn = dentroEntrada;
        entrada.classList.toggle('is-fora', !dentroEntrada);
      }
      if (dentroEntrada) {
        var curso = m.eAlt - vh;
        alvo = curso > 0 ? limitar((y - m.eTopo) / curso, 0, 1) : 0;
        // Suavização por tempo (não por quadro): igual em 60 Hz, 120 Hz ou com quadros perdidos.
        var agora = performance.now();
        var dt = agora - ultimoQuadro;
        ultimoQuadro = agora;
        if (atual < 0 || dt > 180) atual = alvo;
        else atual += (alvo - atual) * (1 - Math.exp(-dt / 90));
        if (Math.abs(alvo - atual) < 0.0005) atual = alvo;
        pintarEntrada(atual);
        if (atual !== alvo) agendar();
      }
    }

    // -- salas --
    for (var i = 0; i < salas.length; i++) {
      var s = salas[i];
      var topoRel = s.topo - y;               // topo da sala em relação à janela
      var fim = topoRel + s.altura;           // fim da sala em relação à janela
      var perto = topoRel < vh * 2.5 && fim > -vh * 0.5;
      if (perto !== s.perto) {
        s.perto = perto;
        s.el.classList.toggle('is-perto', perto);
        if (perto) pedirImagem(s);
      }
      if (topoRel >= vh || fim <= 0) continue; // fora da tela: nada a animar

      // zoom leve: a sala "chega" e assenta
      var chegada = limitar((vh - topoRel) / vh, 0, 1);
      var dentro = limitar(-topoRel / Math.max(1, s.altura - vh), 0, 1);
      var zoom = 'scale(' + (1.1 - 0.07 * chegada - 0.03 * dentro).toFixed(4) + ')';
      if (zoom !== s.zoom) { s.zoom = zoom; s.img.style.transform = zoom; }

      // brilho só na passagem: começa quando a próxima sala está para entrar
      // e cresce enquanto ela sobe; durante a sala o fundo fica nítido.
      var falta = fim - vh;                   // > 0: ainda há conteúdo desta sala abaixo da janela
      var brilho = (suave(faixa(-falta, -vh * 0.16, vh * 0.5)) * 0.8).toFixed(3);
      if (brilho !== s.brilho) { s.brilho = brilho; s.veu.style.opacity = brilho; }
    }
  };

  var agendar = function () {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(quadro);
  };

  var remedir = function () {
    sujo = true;
    agendar();
  };

  var aoRedimensionar = function () {
    if (comFx) ajustarFoco();
    remedir();
  };

  // Sala atual no mapa lateral
  if (comFx && mapa && 'IntersectionObserver' in window) {
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
    salas.forEach(function (s) { obsMapa.observe(s.el); });
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', aoRedimensionar);
  window.addEventListener('load', aoRedimensionar);
  retrato.addEventListener('change', aoRedimensionar);
  if (camImg && !camImg.complete) camImg.addEventListener('load', aoRedimensionar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remedir);
  // Qualquer mudança de altura do conteúdo (fontes, imagens, quebra de linha) invalida o cache.
  if ('ResizeObserver' in window) {
    var principal = document.querySelector('main');
    if (principal) new ResizeObserver(remedir).observe(principal);
  }

  if (comFx) ajustarFoco();
  agendar();
})();

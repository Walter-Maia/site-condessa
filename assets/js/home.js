/* Home: liga/encerra a abertura e cuida da escolha Studio | Shop.
   Toda a coreografia está no CSS; aqui só ligamos, encerramos e limpamos. */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var comFx = raiz.classList.contains('fx');

  /* ---------- Abertura ---------- */
  var intro = document.getElementById('intro');
  var SAIDA_NATURAL = 2500; // ms: começo da abertura das portas
  var DURACAO_SAIDA = 820;
  var TRAVA = 4000;

  if (intro && raiz.classList.contains('intro-active')) {
    var encerrada = false;
    var timers = [];

    try { sessionStorage.setItem('condessa-intro', '1'); } catch (e) { /* storage bloqueado */ }

    var remover = function () {
      if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
      intro = null;
    };

    var finalizar = function (natural) {
      if (encerrada) return;
      encerrada = true;
      timers.forEach(clearTimeout);
      raiz.classList.remove('intro-trava'); // devolve a rolagem no início da saída
      document.removeEventListener('keydown', aoTeclar, true);
      document.removeEventListener('visibilitychange', aoOcultar);
      if (natural && intro) {
        intro.classList.add('is-saindo');
        setTimeout(remover, DURACAO_SAIDA);
      } else {
        remover();
      }
    };

    var aoTeclar = function (ev) {
      if (ev.key === 'Escape' || ev.key === 'Tab' || ev.key === 'Enter') finalizar(false);
    };
    var aoOcultar = function () {
      if (document.hidden) finalizar(false);
    };

    document.addEventListener('keydown', aoTeclar, true);
    document.addEventListener('visibilitychange', aoOcultar);
    intro.addEventListener('pointerdown', function () { finalizar(true); });

    var ligado = false;
    var ligar = function () {
      if (ligado || !intro) return;
      ligado = true;
      intro.classList.add('is-playing');
      timers.push(setTimeout(function () { finalizar(true); }, SAIDA_NATURAL));
      timers.push(setTimeout(function () { finalizar(false); }, TRAVA));
    };

    // Duas oportunidades de pintura antes de animar; reserva para abas sem rAF.
    try {
      requestAnimationFrame(function () { requestAnimationFrame(ligar); });
    } catch (e) { /* segue pela reserva */ }
    setTimeout(ligar, 250);
    window.addEventListener('error', function () { finalizar(false); });
  }

  /* ---------- Escolha ---------- */
  var escolha = document.getElementById('escolha');
  if (!escolha) return;

  // Paralaxe leve seguindo o ponteiro (somente mouse/trackpad).
  var podeHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (comFx && podeHover) {
    var alvoX = 0, alvoY = 0, x = 0, y = 0, rodando = false;
    var passo = function () {
      x += (alvoX - x) * 0.08;
      y += (alvoY - y) * 0.08;
      escolha.style.setProperty('--mx', x.toFixed(4));
      escolha.style.setProperty('--my', y.toFixed(4));
      if (Math.abs(alvoX - x) > 0.002 || Math.abs(alvoY - y) > 0.002) {
        requestAnimationFrame(passo);
      } else {
        rodando = false;
      }
    };
    escolha.addEventListener('pointermove', function (ev) {
      var r = escolha.getBoundingClientRect();
      alvoX = (ev.clientX - r.left) / r.width * 2 - 1;
      alvoY = (ev.clientY - r.top) / r.height * 2 - 1;
      if (!rodando) { rodando = true; requestAnimationFrame(passo); }
    });
    escolha.addEventListener('pointerleave', function () {
      alvoX = 0; alvoY = 0;
      if (!rodando) { rodando = true; requestAnimationFrame(passo); }
    });
  }

  // "Entrar": a porta escolhida ocupa a tela e só então navegamos.
  var portas = escolha.querySelectorAll('[data-porta]');
  Array.prototype.forEach.call(portas, function (porta) {
    porta.addEventListener('click', function (ev) {
      if (!comFx || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      ev.preventDefault();
      var destino = porta.href;
      porta.classList.add('is-escolhida');
      escolha.classList.add('is-saindo');
      setTimeout(function () { window.location.href = destino; }, 560);
    });
  });

  // Voltar pelo histórico (bfcache) devolve a home ao estado inicial.
  window.addEventListener('pageshow', function () {
    escolha.classList.remove('is-saindo');
    Array.prototype.forEach.call(portas, function (p) { p.classList.remove('is-escolhida'); });
  });
})();

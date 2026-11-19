/* Transição entre páginas: a atual some em fade e a próxima entra em fade
   (a entrada é a animação CSS "pagina-entra" em base.css; aqui fica só a saída).
   Vale para links internos que levam a outra página: alternador Studio | Shop,
   marca, cartões e menu. Desligado em movimento reduzido e em ?fx=0. */
(function () {
  'use strict';

  var raiz = document.documentElement;
  if (!raiz.classList.contains('fx')) return;

  var DURACAO = 340; // ms: igual à transição de opacidade em base.css

  document.addEventListener('click', function (ev) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;

    var destino;
    try { destino = new URL(a.href, window.location.href); } catch (e) { return; }
    if (destino.origin !== window.location.origin) return;
    if (destino.pathname === window.location.pathname) return; // âncora da própria página

    ev.preventDefault();
    raiz.classList.add('pagina-saindo');
    setTimeout(function () { window.location.href = destino.href; }, DURACAO);
  });

  // Voltar pelo histórico (bfcache) não pode devolver a página apagada.
  window.addEventListener('pageshow', function () {
    raiz.classList.remove('pagina-saindo');
  });
})();

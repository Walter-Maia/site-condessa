/* Shop: catálogo, filtros, detalhe, sacola (salva no navegador) e pedido pelo WhatsApp.
   Fonte única do catálogo: a lista PRODUTOS abaixo. */
(function () {
  'use strict';

  /* =====================================================================
     CONFIGURAÇÃO
     PRECOS_ILUSTRATIVOS: os valores abaixo são de exemplo. Troque pelos
     preços reais e mude para false para sumir com os avisos do site.
     ===================================================================== */
  var PRECOS_ILUSTRATIVOS = true;
  var WHATSAPP = '5531975125527';
  var CHAVE = 'condessa-sacola-v1';

  var CATEGORIAS = [
    { id: 'todos', nome: 'Todos' },
    { id: 'rosto', nome: 'Rosto' },
    { id: 'olhos', nome: 'Olhos' },
    { id: 'labios', nome: 'Lábios' },
    { id: 'perfumes', nome: 'Perfumes' },
    { id: 'acessorios', nome: 'Acessórios' },
    { id: 'kits', nome: 'Kits' }
  ];

  var PRODUTOS = [
    {
      id: 'paleta-contorno', cat: 'rosto', selo: 'Queridinho', preco: 119.9, img: 'prod-paleta.jpg',
      nome: 'Paleta de contorno Fran', marca: 'Fran by Franciny Ehlke',
      desc: 'Se fosse para escolher um único item de maquiagem para a vida toda, a Tamires ficaria com esta paleta.',
      pontos: ['Tons para iluminar e contornar', 'Textura cremosa, fácil de esfumar']
    },
    {
      id: 'perfume-arabe', cat: 'perfumes', selo: 'Importado', preco: 189.9, img: 'prod-perfume-arabe.jpg',
      nome: 'Perfume árabe', marca: 'Perfumes árabes',
      desc: 'Fragrâncias marcantes, daquelas que não passam despercebidas. Informe a referência desejada ao finalizar.',
      pontos: ['Para começar: A017, A002 e A024', 'Masculinos: A032, 005 e 443', 'Peça ajuda para escolher pelo WhatsApp']
    },
    {
      id: 'bronzer-ruby', cat: 'rosto', preco: 49.9, img: 'prod-bronzer.jpg',
      nome: 'Bronzer Ruby Kisses', marca: 'Ruby Kisses',
      desc: 'Efeito bronzeado elegante, que realça os contornos e dá acabamento à pele.',
      pontos: ['Cor usada nos nossos vídeos: Banho de Sol']
    },
    {
      id: 'lip-oil-ruby', cat: 'labios', selo: '4 cores', preco: 29.9, img: 'prod-lip-oil.jpg',
      nome: 'Lip Oil Ruby Kisses', marca: 'Ruby Kisses',
      desc: 'Lábios macios, hidratados e com brilho para o dia a dia.',
      pontos: ['Quatro cores disponíveis', 'Diga a cor escolhida ao finalizar o pedido']
    },
    {
      id: 'mascara-panda', cat: 'olhos', preco: 44.9, img: 'prod-mascara.jpg',
      nome: 'Máscara de cílios Panda', marca: 'Dailus',
      desc: 'Volume nos cílios sem bagunça na hora de tirar: forma uma película nos fios e sai com água morna.',
      pontos: ['Sem o famoso efeito panda', 'Remoção prática com água morna']
    },
    {
      id: 'blush-liquido', cat: 'rosto', preco: 34.9, img: 'prod-blush.jpg',
      nome: 'Blush líquido Glossy rosa coral', marca: '',
      desc: 'Tom rosa coral com brilho dourado e pigmentação na medida.',
      pontos: ['Fórmula vegana com vitamina E', 'Multifuncional: rosto, lábios e olhos', 'Aplicador cushion com trava contra vazamentos']
    },
    {
      id: 'corretivo-latika', cat: 'rosto', preco: 39.9, img: 'prod-corretivo.jpg',
      nome: 'Corretivo líquido Latika', marca: 'Latika',
      desc: 'O item que a Kelly, da nossa equipe, levaria para a vida toda.',
      pontos: ['Consulte os tons disponíveis']
    },
    {
      id: 'base-liquida', cat: 'rosto', preco: 69.9, img: 'prod-base.jpg',
      nome: 'Base líquida', marca: 'Mascavo e outras marcas',
      desc: 'Bases de marcas brasileiras em vários tons de pele. Na loja, a equipe ajuda a acertar a cor.',
      pontos: ['Informe o seu tom ao finalizar']
    },
    {
      id: 'fixador-real-fix', cat: 'rosto', preco: 54.9, img: 'prod-fixador.jpg',
      nome: 'Fixador de maquiagem Real Fix', marca: 'Vizzela',
      desc: 'Para quem diz que a maquiagem não dura: a solução vai no final da make.',
      pontos: ['Bruma fixadora em spray']
    },
    {
      id: 'balance-cream', cat: 'rosto', preco: 59.9, img: 'prod-balance.jpg',
      nome: 'Balance Cream', marca: 'Make More',
      desc: 'Preparador de pele que virou queridinho do momento por aqui.',
      pontos: ['Repõe a hidratação', 'Minimiza os poros', 'Dermatologicamente testado']
    },
    {
      id: 'brand-collection', cat: 'perfumes', preco: 79.9, img: 'prod-brand.jpg',
      nome: 'Perfume Brand Collection', marca: 'Brand Collection',
      desc: 'Fragrâncias inspiradas em clássicos da perfumaria, para estar sempre cheirosa.',
      pontos: ['Informe a numeração desejada ao finalizar']
    },
    {
      id: 'batom-vermelho', cat: 'labios', preco: 32.9, img: 'prod-batom.jpg',
      nome: 'Batom vermelho', marca: '',
      desc: 'Um batom vermelho tem um impacto belíssimo. Clássico para olho neutro e boca marcada.',
      pontos: ['Consulte as marcas e acabamentos disponíveis']
    },
    {
      id: 'kit-pinceis', cat: 'acessorios', preco: 89.9, img: 'prod-pinceis.jpg',
      nome: 'Kit de pincéis para esfumado', marca: '',
      desc: 'Pincéis para os mais diversos esfumados nos olhos.',
      pontos: ['Formatos para depositar, esfumar e detalhar']
    },
    {
      id: 'esponja', cat: 'acessorios', preco: 19.9, img: 'prod-esponja.jpg',
      nome: 'Esponja de maquiagem', marca: '',
      desc: 'Esponja antiga acumula resíduos e oleosidade. Trocar faz diferença no acabamento da pele.',
      pontos: ['Para base, corretivo e produtos cremosos']
    },
    {
      id: 'kit-presente', cat: 'kits', selo: 'Presente', preco: 149.9, img: 'prod-kit.jpg',
      nome: 'Kit presente Condessa', marca: '',
      desc: 'Kits pensados para presentear em datas especiais, com beleza, carinho e perfume.',
      pontos: ['Montagem conforme a data e a disponibilidade', 'Retirada na loja ou entrega']
    }
  ];

  /* ===================================================================== */

  var raiz = document.documentElement;
  var comFx = raiz.classList.contains('fx');
  var $ = function (id) { return document.getElementById(id); };
  var moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var porId = {};
  PRODUTOS.forEach(function (p, i) { p.ordem = i; porId[p.id] = p; });
  var nomeCat = {};
  CATEGORIAS.forEach(function (c) { nomeCat[c.id] = c.nome; });

  var semAcento = function (s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  };

  var criar = function (tag, classe, texto) {
    var el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto != null) el.textContent = texto;
    return el;
  };

  /* ---------- Estado ---------- */
  var estado = { cat: 'todos', busca: '', ordem: 'destaque' };
  var sacola = {}; // { id: quantidade }

  try {
    var salvo = JSON.parse(localStorage.getItem(CHAVE) || '{}');
    Object.keys(salvo).forEach(function (id) {
      var q = parseInt(salvo[id], 10);
      if (porId[id] && q > 0) sacola[id] = Math.min(q, 99);
    });
  } catch (e) { /* storage indisponível: a sacola vale só nesta visita */ }

  var salvar = function () {
    try { localStorage.setItem(CHAVE, JSON.stringify(sacola)); } catch (e) { /* idem */ }
  };

  /* ---------- Avisos de preço ilustrativo ---------- */
  $('aviso-preco').hidden = !PRECOS_ILUSTRATIVOS;
  $('sacola-nota').hidden = !PRECOS_ILUSTRATIVOS;

  /* ---------- Chips ---------- */
  var chips = $('chips');
  CATEGORIAS.forEach(function (c) {
    var b = criar('button', 'chip', c.nome);
    b.type = 'button';
    b.setAttribute('data-cat', c.id);
    b.setAttribute('aria-pressed', c.id === estado.cat ? 'true' : 'false');
    chips.appendChild(b);
  });

  chips.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-cat]');
    if (!b) return;
    estado.cat = b.getAttribute('data-cat');
    Array.prototype.forEach.call(chips.children, function (c) {
      c.setAttribute('aria-pressed', c === b ? 'true' : 'false');
    });
    desenharGrade();
  });

  /* ---------- Grade ---------- */
  var grade = $('grade');
  var resumo = $('resumo');
  var vazio = $('vazio');

  var filtrar = function () {
    var termo = semAcento(estado.busca.trim());
    var lista = PRODUTOS.filter(function (p) {
      if (estado.cat !== 'todos' && p.cat !== estado.cat) return false;
      if (!termo) return true;
      return semAcento(p.nome + ' ' + p.marca + ' ' + nomeCat[p.cat] + ' ' + p.desc).indexOf(termo) >= 0;
    });
    lista.sort(function (a, b) {
      if (estado.ordem === 'menor') return a.preco - b.preco;
      if (estado.ordem === 'maior') return b.preco - a.preco;
      if (estado.ordem === 'az') return a.nome.localeCompare(b.nome, 'pt-BR');
      return a.ordem - b.ordem;
    });
    return lista;
  };

  var ICONE_MAIS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

  var cartao = function (p, n) {
    var art = criar('article', 'produto');
    art.style.setProperty('--n', n);

    var ver = criar('button', 'produto__ver');
    ver.type = 'button';
    ver.setAttribute('data-ver', p.id);
    ver.setAttribute('aria-label', 'Ver detalhes de ' + p.nome);
    var img = new Image();
    img.src = 'assets/img/' + p.img;
    img.alt = '';
    img.width = 1024;
    img.height = 1024;
    img.loading = 'lazy';
    img.decoding = 'async';
    ver.appendChild(img);
    if (p.selo) ver.appendChild(criar('span', 'produto__selo', p.selo));

    var txt = criar('div', 'produto__txt');
    txt.appendChild(criar('p', 'produto__cat', p.marca || nomeCat[p.cat]));
    txt.appendChild(criar('h3', 'produto__nome', p.nome));
    var linha = criar('div', 'produto__linha');
    linha.appendChild(criar('span', 'produto__preco', moeda.format(p.preco)));
    var add = criar('button', 'produto__add');
    add.type = 'button';
    add.setAttribute('data-add', p.id);
    add.setAttribute('aria-label', 'Adicionar ' + p.nome + ' à sacola');
    add.innerHTML = ICONE_MAIS;
    linha.appendChild(add);
    txt.appendChild(linha);

    art.appendChild(ver);
    art.appendChild(txt);
    return art;
  };

  var desenharGrade = function () {
    var lista = filtrar();
    grade.textContent = '';
    var frag = document.createDocumentFragment();
    lista.forEach(function (p, i) { frag.appendChild(cartao(p, i)); });
    grade.appendChild(frag);
    vazio.hidden = lista.length > 0;
    resumo.textContent = lista.length === 0 ? '' :
      lista.length + (lista.length === 1 ? ' produto' : ' produtos') +
      (estado.cat !== 'todos' ? ' em ' + nomeCat[estado.cat] : '');
  };

  grade.addEventListener('click', function (ev) {
    var add = ev.target.closest('[data-add]');
    if (add) { adicionar(add.getAttribute('data-add'), 1, true); return; }
    var ver = ev.target.closest('[data-ver]');
    if (ver) abrirDetalhe(ver.getAttribute('data-ver'));
  });

  var espera;
  $('busca').addEventListener('input', function (ev) {
    estado.busca = ev.target.value;
    clearTimeout(espera);
    espera = setTimeout(desenharGrade, 140);
  });

  $('ordem').addEventListener('change', function (ev) {
    estado.ordem = ev.target.value;
    desenharGrade();
  });

  $('limpar').addEventListener('click', function () {
    estado.cat = 'todos';
    estado.busca = '';
    $('busca').value = '';
    Array.prototype.forEach.call(chips.children, function (c) {
      c.setAttribute('aria-pressed', c.getAttribute('data-cat') === 'todos' ? 'true' : 'false');
    });
    desenharGrade();
  });

  /* ---------- Aviso (toast) ---------- */
  var aviso = $('aviso');
  var tempoAviso;
  var avisar = function (texto) {
    aviso.textContent = texto;
    aviso.classList.add('is-visivel');
    clearTimeout(tempoAviso);
    tempoAviso = setTimeout(function () { aviso.classList.remove('is-visivel'); }, 2200);
  };

  /* ---------- Sacola ---------- */
  var painel = $('sacola');
  var fundo = $('fundo');
  var listaItens = $('itens');
  var contador = $('contador');
  var botaoSacola = $('abrir-sacola');
  var focoAnterior = null;

  var totalItens = function () {
    return Object.keys(sacola).reduce(function (s, id) { return s + sacola[id]; }, 0);
  };

  var subtotal = function () {
    return Object.keys(sacola).reduce(function (s, id) { return s + sacola[id] * porId[id].preco; }, 0);
  };

  var entregaEscolhida = function () {
    var m = painel.querySelector('input[name="entrega"]:checked');
    return m ? m.value : 'Retirada na loja';
  };

  var linkPedido = function () {
    var linhas = ['Olá! Vim pelo site e quero fazer este pedido:', ''];
    Object.keys(sacola).forEach(function (id) {
      var p = porId[id];
      linhas.push('• ' + sacola[id] + 'x ' + p.nome + ' — ' + moeda.format(p.preco * sacola[id]));
    });
    linhas.push('');
    linhas.push('Subtotal: ' + moeda.format(subtotal()) + (PRECOS_ILUSTRATIVOS ? ' (valores a confirmar)' : ''));
    linhas.push('Recebimento: ' + entregaEscolhida());
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(linhas.join('\n'));
  };

  var linhaItem = function (id) {
    var p = porId[id];
    var li = criar('li', 'item');
    var img = new Image();
    img.src = 'assets/img/' + p.img;
    img.alt = '';
    img.width = 72;
    img.height = 72;
    li.appendChild(img);
    li.appendChild(criar('span', 'item__nome', p.nome));
    li.appendChild(criar('span', 'item__preco', moeda.format(p.preco * sacola[id])));

    var qtd = criar('span', 'item__qtd');
    var menos = criar('button', '', '−');
    menos.type = 'button';
    menos.setAttribute('data-menos', id);
    menos.setAttribute('aria-label', 'Diminuir quantidade de ' + p.nome);
    var saida = criar('output', '', String(sacola[id]));
    saida.setAttribute('aria-label', 'Quantidade');
    var mais = criar('button', '', '+');
    mais.type = 'button';
    mais.setAttribute('data-mais', id);
    mais.setAttribute('aria-label', 'Aumentar quantidade de ' + p.nome);
    qtd.appendChild(menos);
    qtd.appendChild(saida);
    qtd.appendChild(mais);
    li.appendChild(qtd);

    var tirar = criar('button', 'item__tirar', 'Remover');
    tirar.type = 'button';
    tirar.setAttribute('data-tirar', id);
    tirar.setAttribute('aria-label', 'Remover ' + p.nome + ' da sacola');
    li.appendChild(tirar);
    return li;
  };

  var desenharSacola = function () {
    var ids = Object.keys(sacola);
    var n = totalItens();
    listaItens.textContent = '';
    ids.forEach(function (id) { listaItens.appendChild(linhaItem(id)); });
    $('sacola-vazia').hidden = ids.length > 0;
    $('sacola-pe').hidden = ids.length === 0;
    $('subtotal').textContent = moeda.format(subtotal());
    $('finalizar').href = linkPedido();
    contador.hidden = n === 0;
    contador.textContent = n > 99 ? '99+' : String(n);
    botaoSacola.setAttribute('aria-label', n === 0 ? 'Abrir sacola (vazia)' : 'Abrir sacola (' + n + (n === 1 ? ' item)' : ' itens)'));
  };

  var adicionar = function (id, quanto, comAviso) {
    if (!porId[id]) return;
    var q = (sacola[id] || 0) + quanto;
    if (q <= 0) delete sacola[id];
    else sacola[id] = Math.min(q, 99);
    salvar();
    desenharSacola();
    if (quanto > 0) {
      contador.classList.remove('is-pulo');
      void contador.offsetWidth; // reinicia a animação do contador
      contador.classList.add('is-pulo');
    }
    if (comAviso) avisar(porId[id].nome + ' foi para a sacola');
  };

  var abrirSacola = function () {
    focoAnterior = document.activeElement;
    painel.hidden = false;
    fundo.hidden = false;
    raiz.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      painel.classList.add('is-aberto');
      fundo.classList.add('is-aberto');
    });
    painel.focus();
  };

  var fecharSacola = function () {
    if (painel.hidden) return;
    painel.classList.remove('is-aberto');
    fundo.classList.remove('is-aberto');
    raiz.style.overflow = '';
    setTimeout(function () {
      if (!painel.classList.contains('is-aberto')) { painel.hidden = true; fundo.hidden = true; }
    }, comFx ? 480 : 0);
    if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
  };

  botaoSacola.addEventListener('click', abrirSacola);
  $('fechar-sacola').addEventListener('click', fecharSacola);
  $('continuar').addEventListener('click', fecharSacola);
  fundo.addEventListener('click', fecharSacola);

  $('esvaziar').addEventListener('click', function () {
    sacola = {};
    salvar();
    desenharSacola();
  });

  listaItens.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-mais')) adicionar(b.getAttribute('data-mais'), 1);
    else if (b.hasAttribute('data-menos')) adicionar(b.getAttribute('data-menos'), -1);
    else if (b.hasAttribute('data-tirar')) adicionar(b.getAttribute('data-tirar'), -999);
  });

  painel.addEventListener('change', function (ev) {
    if (ev.target.name === 'entrega') $('finalizar').href = linkPedido();
  });

  // Mantém o foco dentro da sacola enquanto ela está aberta.
  painel.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Tab') return;
    var focaveis = Array.prototype.filter.call(
      painel.querySelectorAll('button, a[href], input'),
      function (el) { return el.offsetParent !== null; }
    );
    if (!focaveis.length) return;
    var primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
    if (ev.shiftKey && (document.activeElement === primeiro || document.activeElement === painel)) {
      ev.preventDefault(); ultimo.focus();
    } else if (!ev.shiftKey && document.activeElement === ultimo) {
      ev.preventDefault(); primeiro.focus();
    }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !painel.hidden) fecharSacola();
  });

  /* ---------- Detalhe ---------- */
  var detalhe = $('detalhe');
  var idDetalhe = null;

  var abrirDetalhe = function (id) {
    var p = porId[id];
    if (!p) return;
    idDetalhe = id;
    $('detalhe-img').src = 'assets/img/' + p.img;
    $('detalhe-img').alt = p.nome + ' (imagem ilustrativa)';
    $('detalhe-cat').textContent = (p.marca ? p.marca + ' · ' : '') + nomeCat[p.cat];
    $('detalhe-nome').textContent = p.nome;
    $('detalhe-desc').textContent = p.desc;
    $('detalhe-preco').textContent = moeda.format(p.preco);
    var pontos = $('detalhe-pontos');
    pontos.textContent = '';
    (p.pontos || []).forEach(function (t) { pontos.appendChild(criar('li', '', t)); });
    if (typeof detalhe.showModal === 'function') detalhe.showModal();
    else detalhe.setAttribute('open', '');
  };

  var fecharDetalhe = function () {
    if (typeof detalhe.close === 'function') detalhe.close();
    else detalhe.removeAttribute('open');
  };

  $('fechar-detalhe').addEventListener('click', fecharDetalhe);
  detalhe.addEventListener('click', function (ev) {
    if (ev.target === detalhe) fecharDetalhe(); // clique no fundo
  });
  $('detalhe-add').addEventListener('click', function () {
    if (!idDetalhe) return;
    adicionar(idDetalhe, 1, true);
    fecharDetalhe();
  });

  /* ---------- Revelar ao rolar ---------- */
  var itens = Array.prototype.slice.call(document.querySelectorAll('[data-revelar]'));
  if (comFx && 'IntersectionObserver' in window) {
    var alturaJanela = window.innerHeight;
    itens.forEach(function (el) {
      if (el.getBoundingClientRect().top < alturaJanela * 0.92) el.classList.add('is-visivel');
    });
    raiz.classList.add('revelar-armado');
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visivel'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    itens.forEach(function (el) { if (!el.classList.contains('is-visivel')) obs.observe(el); });
  }

  /* ---------- Início ---------- */
  desenharGrade();
  desenharSacola();
})();

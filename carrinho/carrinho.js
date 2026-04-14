/* ==============================================
   ARQUIVO: carrinho.js
   DESCRIÇÃO: Todas as funções relacionadas ao
   carrinho de compras do cliente.

   Funções deste arquivo:
   - atualizarBarraDoCarrinho()
   - verificarSeFritasEstaLiberada()
   - adicionarOuRemoverItem()
   - mostrarItensDoCarrinho()
   - abrirTelaDoCarrinho()
   - fecharTelaDoCarrinho()
================================================ */


// -----------------------------------------------
// atualizarBarraDoCarrinho()
// Atualiza a barra dourada/vermelha que aparece
// na parte inferior da tela mostrando quantos
// itens há no carrinho e o valor total.
// É chamada sempre que um item é adicionado ou removido.
// -----------------------------------------------
function atualizarBarraDoCarrinho() {
  const itens = Object.values(carrinho);

  // Soma todas as quantidades de todos os itens
  const totalQtd = itens.reduce((soma, item) => soma + item.qtd, 0);

  // Soma o valor total (preço × quantidade de cada item)
  const totalValor = itens.reduce((soma, item) => soma + item.preco * item.qtd, 0);

  const barra = document.getElementById('barra-carrinho');

  // Atualiza o texto: "1 item" ou "3 itens"
  document.getElementById('carrinho-qtd').textContent =
    totalQtd === 1 ? '1 item' : `${totalQtd} itens`;

  // Atualiza o valor em reais com vírgula (ex: R$ 25,00)
  document.getElementById('carrinho-total').textContent =
    'R$ ' + totalValor.toFixed(2).replace('.', ',');

  // Mostra a barra se tiver itens, esconde se estiver vazio
  if (totalQtd > 0) {
    barra.classList.add('visivel');
  } else {
    barra.classList.remove('visivel');
  }
}


// -----------------------------------------------
// verificarSeFritasEstaLiberada()
// O "Adicional de fritas" só pode ser adicionado
// se o cliente tiver pelo menos 1 burger no carrinho.
// Esta função verifica isso e habilita ou bloqueia o botão +.
// -----------------------------------------------
function verificarSeFritasEstaLiberada() {
  // Lista dos burgers que liberam o adicional de fritas
  const burgers = [
    'Burguer 120g',
    'Burguer Duplo 120g',
    'Burguer Duplo Especial Colarinho'
  ];

  // some() retorna true se PELO MENOS UM burger estiver no carrinho
  const temBurger = burgers.some(nome => carrinho[nome] && carrinho[nome].qtd > 0);

  // Seleciona todos os botões + das fritas na página
  const botoesMaisFritas = document.querySelectorAll(
    '.item[data-nome="Adicional de fritas"] .btn-mais'
  );

  if (!botoesMaisFritas.length) return;

  if (!temBurger) {
    // Sem burger → bloqueia o botão + das fritas
    botoesMaisFritas.forEach(btn => btn.disabled = true);

    // Se as fritas já estavam no carrinho, remove automaticamente
    if (carrinho['Adicional de fritas']) {
      delete carrinho['Adicional de fritas'];

      document.querySelectorAll('.item[data-nome="Adicional de fritas"] .item-qtd')
        .forEach(el => el.textContent = '0');
      document.querySelectorAll('.item[data-nome="Adicional de fritas"] .btn-menos')
        .forEach(btn => btn.disabled = true);

      atualizarBarraDoCarrinho();
    }
  } else {
    // Com burger → libera o botão +
    botoesMaisFritas.forEach(btn => btn.disabled = false);
  }
}


// -----------------------------------------------
// adicionarOuRemoverItem(nome, preco, delta)
// Chamada pelos botões + e − de cada produto.
//
// Parâmetros:
//   nome  → nome do produto  (ex: "Caipira Vodka")
//   preco → preço unitário   (ex: 25.00)
//   delta → +1 para adicionar, -1 para remover
// -----------------------------------------------
function adicionarOuRemoverItem(nome, preco, delta) {
  // Cria o item no carrinho se ainda não existir
  if (!carrinho[nome]) {
    carrinho[nome] = { preco: parseFloat(preco), qtd: 0 };
  }

  // Adiciona ou subtrai 1 da quantidade
  carrinho[nome].qtd += delta;

  // Se chegou a 0, remove o item do carrinho completamente
  if (carrinho[nome].qtd <= 0) {
    delete carrinho[nome];
  }

  // Atualiza o número visual em TODOS os elementos com esse nome
  // (usa querySelectorAll para funcionar mesmo quando o mesmo
  // produto aparece em mais de uma aba, ex: Orloff em Doses e Combos)
  document.querySelectorAll(`.item[data-nome="${nome}"]`).forEach(itemEl => {
    const qtdEl = itemEl.querySelector('.item-qtd');
    const btnMenos = itemEl.querySelector('.btn-menos');
    const qtd = carrinho[nome]?.qtd || 0;
    if (qtdEl) qtdEl.textContent = qtd;
    if (btnMenos) btnMenos.disabled = qtd === 0;
  });

  // Verifica se as fritas devem ser liberadas ou bloqueadas
  verificarSeFritasEstaLiberada();

  // Atualiza o total na barra inferior
  atualizarBarraDoCarrinho();

  // Se o carrinho estiver aberto, atualiza a lista em tempo real
  if (document.getElementById('modal-carrinho').classList.contains('ativo')) {
    mostrarItensDoCarrinho();
  }
}


// -----------------------------------------------
// mostrarItensDoCarrinho()
// Gera o HTML da lista de itens dentro do modal
// do carrinho. É chamada ao abrir o carrinho ou
// quando um item é alterado com o carrinho aberto.
// -----------------------------------------------
function mostrarItensDoCarrinho() {
  const lista = document.getElementById('lista-carrinho');
  const itens = Object.entries(carrinho);

  // Se não tiver nenhum item, mostra mensagem de vazio
  if (itens.length === 0) {
    lista.innerHTML = '<div class="carrinho-vazio">😶 Nenhum item no pedido ainda</div>';
    document.getElementById('total-final').textContent = 'R$ 0,00';
    return;
  }

  let total = 0;

  // Para cada item, gera uma linha com nome, preço e botões + −
  lista.innerHTML = itens.map(([nome, { preco, qtd }]) => {
    const subtotal = preco * qtd;
    total += subtotal;
    return `
      <div class="item-carrinho">
        <div class="item-carrinho-info">
          <div class="item-carrinho-nome">${nome}</div>
          <div class="item-carrinho-preco">
            R$ ${preco.toFixed(2).replace('.', ',')} × ${qtd} = R$ ${subtotal.toFixed(2).replace('.', ',')}
          </div>
        </div>
        <div class="item-carrinho-controles">
          <button class="btn-carrinho-menos" onclick="adicionarOuRemoverItem('${nome}', ${preco}, -1)">−</button>
          <span class="carrinho-item-qtd">${qtd}</span>
          <button class="btn-carrinho-mais" onclick="adicionarOuRemoverItem('${nome}', ${preco}, +1)">+</button>
        </div>
      </div>
    `;
  }).join('');

  // Atualiza o total no rodapé do carrinho
  document.getElementById('total-final').textContent =
    'R$ ' + total.toFixed(2).replace('.', ',');
}


// -----------------------------------------------
// abrirTelaDoCarrinho()
// Abre o modal do carrinho deslizando de baixo.
// Chamada pelo botão "Ver pedido" na barra inferior.
// -----------------------------------------------
function abrirTelaDoCarrinho() {
  mostrarItensDoCarrinho();
  document.getElementById('modal-carrinho').classList.add('ativo');
  document.getElementById('overlay-carrinho').classList.add('ativo');
}


// -----------------------------------------------
// fecharTelaDoCarrinho()
// Fecha o modal do carrinho.
// Chamada pelo botão × ou clicando no fundo escuro.
// -----------------------------------------------
function fecharTelaDoCarrinho() {
  document.getElementById('modal-carrinho').classList.remove('ativo');
  document.getElementById('overlay-carrinho').classList.remove('ativo');
}


// -----------------------------------------------
// criarBotoesDeQuantidade()
// Percorre todos os itens do cardápio e adiciona
// os botões + e − dinamicamente em cada um.
// Chamada uma única vez quando a página carrega.
// -----------------------------------------------
function criarBotoesDeQuantidade() {
  document.querySelectorAll('.item[data-nome]').forEach(itemEl => {
    const nome = itemEl.dataset.nome;
    const preco = itemEl.dataset.preco;

    const controles = document.createElement('div');
    controles.className = 'item-controles';
    controles.innerHTML = `
      <button class="btn-menos" onclick="adicionarOuRemoverItem('${nome}', ${preco}, -1)" disabled>−</button>
      <span class="item-qtd">0</span>
      <button class="btn-mais" onclick="adicionarOuRemoverItem('${nome}', ${preco}, +1)">+</button>
    `;

    itemEl.appendChild(controles);
  });

  // Fritas começam bloqueadas pois nenhum burger foi selecionado ainda
  document.querySelectorAll('.item[data-nome="Adicional de fritas"] .btn-mais')
    .forEach(btn => btn.disabled = true);
}

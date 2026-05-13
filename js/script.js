const carrinho = {};
const dadosCliente = { nome: '', mesa: '' };
let numeroPedido = parseInt(localStorage.getItem('numeroPedido') || '0');
let intervaloVerificacao = null;

function atualizarBarraDoCarrinho() {
  const itens = Object.values(carrinho);
  const totalQtd = itens.reduce((soma, item) => soma + item.qtd, 0);
  const totalValor = itens.reduce((soma, item) => soma + item.preco * item.qtd, 0);
  const barra = document.getElementById('barra-carrinho');

  document.getElementById('carrinho-qtd').textContent =
    totalQtd === 1 ? '1 item' : `${totalQtd} itens`;
  document.getElementById('carrinho-total').textContent =
    'R$ ' + totalValor.toFixed(2).replace('.', ',');

  if (totalQtd > 0) {
    barra.classList.add('visivel');
  } else {
    barra.classList.remove('visivel');
  }
}

function verificarSeFritasEstaLiberada() {
  const burgers = [
    'Burguer 120g',
    'Burguer Duplo 120g',
    'Burguer Duplo Especial Colarinho'
  ];

  const temBurger = burgers.some(nome => carrinho[nome] && carrinho[nome].qtd > 0);
  const botoesMais = document.querySelectorAll('.item[data-nome="Adicional de fritas"] .btn-mais');

  if (!botoesMais.length) return;

  if (!temBurger) {
    botoesMais.forEach(btn => btn.disabled = true);
    if (carrinho['Adicional de fritas']) {
      delete carrinho['Adicional de fritas'];
      document.querySelectorAll('.item[data-nome="Adicional de fritas"] .item-qtd')
        .forEach(el => el.textContent = '0');
      document.querySelectorAll('.item[data-nome="Adicional de fritas"] .btn-menos')
        .forEach(btn => btn.disabled = true);
      atualizarBarraDoCarrinho();
    }
  } else {
    botoesMais.forEach(btn => btn.disabled = false);
  }
}

// delta: +1 para adicionar, -1 para remover
function adicionarOuRemoverItem(nome, preco, delta) {
  if (!carrinho[nome]) {
    carrinho[nome] = { preco: parseFloat(preco), qtd: 0 };
  }

  carrinho[nome].qtd += delta;

  if (carrinho[nome].qtd <= 0) {
    delete carrinho[nome];
  }

  // querySelectorAll para funcionar quando o produto aparece em mais de uma aba
  document.querySelectorAll(`.item[data-nome="${nome}"]`).forEach(itemEl => {
    const qtdEl = itemEl.querySelector('.item-qtd');
    const btnMenos = itemEl.querySelector('.btn-menos');
    const qtd = carrinho[nome]?.qtd || 0;
    if (qtdEl) qtdEl.textContent = qtd;
    if (btnMenos) btnMenos.disabled = qtd === 0;
  });

  verificarSeFritasEstaLiberada();
  atualizarBarraDoCarrinho();

  if (document.getElementById('modal-carrinho').classList.contains('ativo')) {
    mostrarItensDoCarrinho();
  }
}

function mostrarItensDoCarrinho() {
  const lista = document.getElementById('lista-carrinho');
  const itens = Object.entries(carrinho);

  if (itens.length === 0) {
    lista.innerHTML = '<div class="carrinho-vazio">😶 Nenhum item no pedido ainda</div>';
    document.getElementById('total-final').textContent = 'R$ 0,00';
    return;
  }

  let total = 0;
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

  document.getElementById('total-final').textContent =
    'R$ ' + total.toFixed(2).replace('.', ',');
}

function abrirTelaDoCarrinho() {
  mostrarItensDoCarrinho();
  document.getElementById('modal-carrinho').classList.add('ativo');
  document.getElementById('overlay-carrinho').classList.add('ativo');
}

function fecharTelaDoCarrinho() {
  document.getElementById('modal-carrinho').classList.remove('ativo');
  document.getElementById('overlay-carrinho').classList.remove('ativo');
}

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

  document.querySelectorAll('.item[data-nome="Adicional de fritas"] .btn-mais')
    .forEach(btn => btn.disabled = true);
}

function trocarCategoria(categoria, botaoClicado) {
  document.querySelectorAll('.card').forEach(card => {
    card.classList.remove('show');
    setTimeout(() => {
      if (!card.classList.contains('show')) card.style.display = 'none';
    }, 400);
  });

  document.querySelectorAll('.btn-categoria').forEach(btn => btn.classList.remove('ativo'));
  botaoClicado.classList.add('ativo');
  botaoClicado.scrollIntoView({ inline: 'center', behavior: 'smooth' });

  const cardAlvo = document.querySelector(`[data-categoria="${categoria}"]`);
  if (cardAlvo) {
    cardAlvo.style.display = 'block';
    cardAlvo.getBoundingClientRect();
    cardAlvo.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

window.addEventListener('load', () => {
  criarBotoesDeQuantidade();

  document.querySelectorAll('.card').forEach(card => {
    card.style.display = 'none';
    card.classList.remove('show');
  });

  const cardDrinks = document.querySelector('[data-categoria="drinks"]');
  if (cardDrinks) {
    cardDrinks.style.display = 'block';
    cardDrinks.getBoundingClientRect();
    cardDrinks.classList.add('show');
  }
});

const popup = document.getElementById('popup');

window.addEventListener('load', () => {
  setTimeout(() => popup.classList.add('ativo'), 1000);
});

function fecharAnuncio() {
  popup.classList.remove('ativo');
}

popup.addEventListener('click', function (e) {
  if (e.target === this) fecharAnuncio();
});

function comecarPedido() {
  fecharTelaDoCarrinho();
  document.getElementById('input-nome-cliente').value = '';
  document.getElementById('input-mesa').value = '';
  document.getElementById('identificacao-erro').textContent = '';
  document.getElementById('modal-identificacao').classList.add('ativo');
  document.getElementById('overlay-identificacao').classList.add('ativo');
}

function fecharTelaDeDados() {
  document.getElementById('modal-identificacao').classList.remove('ativo');
  document.getElementById('overlay-identificacao').classList.remove('ativo');
}

function confirmarDadosEIrParaPix() {
  const nome = document.getElementById('input-nome-cliente').value.trim();
  const mesa = document.getElementById('input-mesa').value.trim();
  const erro = document.getElementById('identificacao-erro');

  if (!nome) { erro.textContent = '⚠️ Por favor, informe seu nome.'; return; }
  if (!mesa) { erro.textContent = '⚠️ Por favor, selecione o número da mesa.'; return; }

  erro.textContent = '';
  dadosCliente.nome = nome;

  // pega o texto completo da opção selecionada (ex: "CAM 1", "MESA 11", "TONEL 30")
  const selectMesa = document.getElementById('input-mesa');
  dadosCliente.mesa = selectMesa.options[selectMesa.selectedIndex].text;

  fecharTelaDeDados();
  abrirTelaDepagamentoPix();
}

async function abrirTelaDepagamentoPix() {
  const total = Object.values(carrinho).reduce((s, i) => s + i.preco * i.qtd, 0);

  document.getElementById('pix-valor').textContent =
    'R$ ' + total.toFixed(2).replace('.', ',');

  const box = document.querySelector('.pix-qrcode-box');
  box.innerHTML = '<div class="pix-loading">Gerando QR Code... ⏳</div>';

  document.getElementById('modal-pix').classList.add('ativo');
  document.getElementById('overlay-pix').classList.add('ativo');

  const listaItens = Object.entries(carrinho).map(([nome, { qtd }]) => ({ nome, qtd }));

  try {
    const resposta = await fetch('/api/criar-pagamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor: total,
        nomecliente: dadosCliente.nome,
        mesa: dadosCliente.mesa,
        itens: listaItens,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      box.innerHTML = '<div class="pix-erro">❌ Erro ao gerar QR Code. Tente novamente.</div>';
      return;
    }

    window.pagamentoAtualId = dados.id;
    box.innerHTML = `<img src="data:image/png;base64,${dados.qrcode_base64}" alt="QR Code Pix" style="width:200px;height:200px;">`;
    document.querySelector('.pix-chave-texto').textContent = dados.qrcode;
    iniciarVerificacaoDePagamento(dados.id);

  } catch (erro) {
    console.error('Erro ao gerar pagamento:', erro);
    box.innerHTML = '<div class="pix-erro">❌ Erro de conexão. Tente novamente.</div>';
  }
}

function fecharTelaDePagamentoPix() {
  document.getElementById('modal-pix').classList.remove('ativo');
  document.getElementById('overlay-pix').classList.remove('ativo');
  pararVerificacaoDePagamento();
}

function copiarChavePix() {
  const chave = document.querySelector('.pix-chave-texto').textContent;
  navigator.clipboard.writeText(chave).then(() => {
    const btn = document.querySelector('.btn-copiar');
    btn.textContent = '✅ Copiado!';
    setTimeout(() => btn.textContent = '📋 Copiar', 2000);
  });
}

function iniciarVerificacaoDePagamento(idPagamento) {
  pararVerificacaoDePagamento();

  intervaloVerificacao = setInterval(async () => {
    try {
      const resposta = await fetch(`/api/verificar-pagamento?id=${idPagamento}`);
      const dados = await resposta.json();

      if (dados.status === 'approved') {
        pararVerificacaoDePagamento();
        fecharTelaDePagamentoPix();
        mostrarComprovanteDoCliente();
      }
    } catch (erro) {
      console.error('Erro ao verificar pagamento:', erro);
    }
  }, 5000);
}

function pararVerificacaoDePagamento() {
  if (intervaloVerificacao) {
    clearInterval(intervaloVerificacao);
    intervaloVerificacao = null;
  }
}

function mostrarComprovanteDoCliente() {
  numeroPedido = (numeroPedido % 50) + 1;
  localStorage.setItem('numeroPedido', numeroPedido);
  const numeroPedidoFormatado = String(numeroPedido).padStart(3, '0');

  // fuso horário de Brasília
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const [data, hora] = agora.split(', ');

  const itens = Object.entries(carrinho);
  let total = 0;

  document.getElementById('conf-numero-pedido').textContent = `#${numeroPedidoFormatado}`;
  document.getElementById('conf-nome-cliente').textContent = dadosCliente.nome;
  document.getElementById('conf-mesa').textContent = dadosCliente.mesa;
  document.getElementById('conf-data-hora').textContent = `${data} às ${hora}`;

  document.getElementById('conf-itens').innerHTML = itens.map(([nome, { preco, qtd }]) => {
    const subtotal = preco * qtd;
    total += subtotal;
    return `
      <div class="nota-item">
        <div class="nota-item-info">
          <span class="nota-item-nome">${nome}</span>
          <span class="nota-item-qtd">x${qtd}</span>
        </div>
        <span class="nota-item-preco">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
      </div>
    `;
  }).join('');

  document.getElementById('conf-total').textContent =
    'R$ ' + total.toFixed(2).replace('.', ',');

  document.getElementById('modal-confirmacao-final').classList.add('ativo');
  document.getElementById('overlay-confirmacao-final').classList.add('ativo');
}

function fecharTelaDeConfirmacao() {
  document.getElementById('modal-confirmacao-final').classList.remove('ativo');
  document.getElementById('overlay-confirmacao-final').classList.remove('ativo');

  Object.keys(carrinho).forEach(nome => delete carrinho[nome]);
  document.querySelectorAll('.item-qtd').forEach(el => el.textContent = '0');
  document.querySelectorAll('.btn-menos').forEach(btn => btn.disabled = true);
  document.querySelectorAll('.item[data-nome="Adicional de fritas"] .btn-mais')
    .forEach(btn => btn.disabled = true);

  dadosCliente.nome = '';
  dadosCliente.mesa = '';
  atualizarBarraDoCarrinho();
}
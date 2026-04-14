/* ==============================================
   ARQUIVO: pagamento.js
   DESCRIÇÃO: Todas as funções relacionadas ao
   fluxo de pagamento: identificação do cliente,
   QR Code Pix, envio pelo WhatsApp e confirmação.

   Funções deste arquivo:
   - comecarPedido()
   - fecharTelaDeDados()
   - confirmarDadosEIrParaPix()
   - abrirTelaDepagamentoPix()
   - fecharTelaDePagamentoPix()
   - copiarChavePix()
   - gerarCodigoQrcodePix()
   - enviarPedidoNoWhatsApp()
   - mostrarComprovanteDoCliente()
   - fecharTelaDeConfirmacao()
================================================ */


// -----------------------------------------------
// comecarPedido()
// ETAPA 1 → 2
// Chamada quando o cliente clica em
// "Finalizar e Pagar no Pix" no carrinho.
// Fecha o carrinho e abre a tela de identificação.
// -----------------------------------------------
function comecarPedido() {
  fecharTelaDoCarrinho();

  // Limpa os campos antes de abrir
  document.getElementById('input-nome-cliente').value = '';
  document.getElementById('input-mesa').value = '';
  document.getElementById('identificacao-erro').textContent = '';

  document.getElementById('modal-identificacao').classList.add('ativo');
  document.getElementById('overlay-identificacao').classList.add('ativo');
}


// -----------------------------------------------
// fecharTelaDeDados()
// Fecha a tela de identificação (nome e mesa).
// -----------------------------------------------
function fecharTelaDeDados() {
  document.getElementById('modal-identificacao').classList.remove('ativo');
  document.getElementById('overlay-identificacao').classList.remove('ativo');
}


// -----------------------------------------------
// confirmarDadosEIrParaPix()
// ETAPA 2 → 3 → 4
// Valida os campos preenchidos pelo cliente,
// salva os dados e avança para a tela do Pix.
// -----------------------------------------------
function confirmarDadosEIrParaPix() {
  const nome = document.getElementById('input-nome-cliente').value.trim();
  const mesa = document.getElementById('input-mesa').value.trim();
  const erro = document.getElementById('identificacao-erro');

  // Validação: nome obrigatório
  if (!nome) {
    erro.textContent = '⚠️ Por favor, informe seu nome.';
    return;
  }

  // Validação: mesa obrigatória
  if (!mesa) {
    erro.textContent = '⚠️ Por favor, selecione o número da mesa.';
    return;
  }

  erro.textContent = '';

  // ETAPA 3 — Salva os dados do cliente
  // Esses dados são usados na mensagem do WhatsApp e no comprovante final
  dadosCliente.nome = nome;
  dadosCliente.mesa = mesa;

  fecharTelaDeDados();
  abrirTelaDepagamentoPix(); // ETAPA 4
}


// -----------------------------------------------
// abrirTelaDepagamentoPix()
// ETAPA 4
// Calcula o total do carrinho, gera o QR Code
// com o valor exato e abre a tela de pagamento.
// -----------------------------------------------
function abrirTelaDepagamentoPix() {
  const total = Object.values(carrinho).reduce((s, i) => s + i.preco * i.qtd, 0);

  // Mostra o valor na tela
  document.getElementById('pix-valor').textContent =
    'R$ ' + total.toFixed(2).replace('.', ',');

  // Limpa o QR Code anterior e cria um novo espaço para gerar
  const box = document.querySelector('.pix-qrcode-box');
  box.innerHTML = '<div id="qrcode-gerado"></div>';

  // Gera o payload (código) no formato oficial do Banco Central
  const payload = gerarCodigoQrcodePix(
    '+5551998443038',      // Chave Pix (telefone com +55)
    'Colarinho Louge Bar', // Nome do recebedor
    'Novo Hamburgo',       // Cidade
    total                  // Valor total do pedido
  );

  // Usa a biblioteca QRCode.js para desenhar o QR Code na tela
  new QRCode(document.getElementById('qrcode-gerado'), {
    text: payload,
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });

  document.getElementById('modal-pix').classList.add('ativo');
  document.getElementById('overlay-pix').classList.add('ativo');
}


// -----------------------------------------------
// fecharTelaDePagamentoPix()
// Fecha a tela do Pix.
// -----------------------------------------------
function fecharTelaDePagamentoPix() {
  document.getElementById('modal-pix').classList.remove('ativo');
  document.getElementById('overlay-pix').classList.remove('ativo');
}


// -----------------------------------------------
// copiarChavePix()
// Copia a chave Pix para a área de transferência
// do celular e muda o texto do botão por 2 segundos
// para confirmar que copiou.
// -----------------------------------------------
function copiarChavePix() {
  navigator.clipboard.writeText('+5551998443038').then(() => {
    const btn = document.querySelector('.btn-copiar');
    btn.textContent = '✅ Copiado!';
    setTimeout(() => btn.textContent = '📋 Copiar', 2000);
  });
}


// -----------------------------------------------
// gerarCodigoQrcodePix(chave, nome, cidade, valor)
// Gera a string no formato oficial do Banco Central
// (padrão EMV com CRC16) que é usada para criar o QR Code.
//
// Parâmetros:
//   chave  → chave Pix (ex: "+5551998443038")
//   nome   → nome do recebedor (max 25 caracteres)
//   cidade → cidade do recebedor (max 15 caracteres)
//   valor  → valor numérico (ex: 47.50)
// -----------------------------------------------
function gerarCodigoQrcodePix(chave, nome, cidade, valor) {

  // Função auxiliar que monta cada campo no padrão do Banco Central
  // Formato: ID (2 dígitos) + tamanho (2 dígitos) + conteúdo
  function campo(id, conteudo) {
    const tamanho = String(conteudo.length).padStart(2, '0');
    return `${id}${tamanho}${conteudo}`;
  }

  // Monta as informações do recebedor (Merchant Account Info)
  const infoRecebedor = campo('26',
    campo('00', 'br.gov.bcb.pix') + // Identificador padrão do Pix
    campo('01', chave)               // Chave Pix
  );

  // Monta o payload completo sem o código de verificação (CRC)
  const payloadSemVerificacao =
    campo('00', '01') +                              // Versão do payload
    infoRecebedor +                                  // Dados do recebedor
    campo('52', '0000') +                            // Código da categoria (0000 = genérico)
    campo('53', '986') +                             // Moeda: 986 = Real (BRL)
    campo('54', valor.toFixed(2)) +                  // Valor com 2 casas decimais
    campo('58', 'BR') +                              // País: BR = Brasil
    campo('59', nome.substring(0, 25).toUpperCase()) + // Nome (máx 25 caracteres)
    campo('60', cidade.substring(0, 15).toUpperCase()) + // Cidade (máx 15 caracteres)
    campo('62', campo('05', '***')) +                // Referência do pedido
    '6304';                                          // Início do campo CRC (sempre assim)

  // Calcula o CRC16 — código de verificação obrigatório pelo Banco Central
  // Garante que o QR Code não foi alterado e é válido
  function calcularCRC16(texto) {
    let crc = 0xFFFF;
    for (let i = 0; i < texto.length; i++) {
      crc ^= texto.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  // Retorna o payload completo com o CRC no final
  return payloadSemVerificacao + calcularCRC16(payloadSemVerificacao);
}


// -----------------------------------------------
// enviarPedidoNoWhatsApp()
// ETAPAS 6, 7 e 8
// Incrementa o número do pedido, monta a mensagem
// completa e abre o WhatsApp com tudo preenchido.
// -----------------------------------------------
function enviarPedidoNoWhatsApp() {
  // ETAPA 8 — Incrementa o número do pedido (1 a 50, depois volta ao 1)
  numeroPedido = (numeroPedido % 50) + 1;
  localStorage.setItem('numeroPedido', numeroPedido); // Salva na memória do navegador

  // Captura data e hora atual
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR');
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Formata o número do pedido com 3 dígitos (ex: 001, 012, 050)
  const numeroPedidoFormatado = String(numeroPedido).padStart(3, '0');

  // Monta a lista de itens e calcula o total
  const itens = Object.entries(carrinho);
  let total = 0;
  let listaItens = '';

  itens.forEach(([nome, { preco, qtd }]) => {
    const subtotal = preco * qtd;
    total += subtotal;
    listaItens += `• ${nome} x${qtd} = R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
  });

  // Monta a mensagem completa para o WhatsApp do atendente
  const mensagem =
    `🍺 *NOVO PEDIDO - Colarinho Lounge Bar*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Pedido Nº: #${numeroPedidoFormatado}*\n` +
    `📅 Data: ${data} às ${hora}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 Cliente: ${dadosCliente.nome}\n` +
    `🪑 Mesa: ${dadosCliente.mesa}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🛒 *Itens do Pedido:*\n${listaItens}` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ Pagamento via Pix realizado.\n` +
    `📎 *Comprovante anexado abaixo.*`;

  // ⚠️ Número do WhatsApp do atendente
  // Formato: código do país (55) + DDD + número, sem espaços
  const numeroWhatsApp = '51996830150';
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

  // Abre o WhatsApp em uma nova aba com a mensagem já escrita
  window.open(urlWhatsApp, '_blank');

  fecharTelaDePagamentoPix();

  // ETAPA 9 — Abre o comprovante final para o cliente
  mostrarComprovanteDoCliente(numeroPedidoFormatado, data, hora, total, itens);
}


// -----------------------------------------------
// mostrarComprovanteDoCliente()
// ETAPA 9
// Exibe o comprovante final com todos os dados
// do pedido e a mensagem de aguardar na mesa.
//
// Parâmetros recebidos de enviarPedidoNoWhatsApp():
//   numeroPedidoFormatado → ex: "007"
//   data                  → ex: "13/04/2026"
//   hora                  → ex: "21:30"
//   total                 → ex: 74.50
//   itens                 → array com os itens do carrinho
// -----------------------------------------------
function mostrarComprovanteDoCliente(numeroPedidoFormatado, data, hora, total, itens) {
  // Preenche cada campo do comprovante
  document.getElementById('conf-numero-pedido').textContent = `#${numeroPedidoFormatado}`;
  document.getElementById('conf-nome-cliente').textContent = dadosCliente.nome;
  document.getElementById('conf-mesa').textContent = dadosCliente.mesa;
  document.getElementById('conf-data-hora').textContent = `${data} às ${hora}`;
  document.getElementById('conf-total').textContent =
    'R$ ' + total.toFixed(2).replace('.', ',');

  // Gera a lista de itens no comprovante
  document.getElementById('conf-itens').innerHTML = itens.map(([nome, { preco, qtd }]) => {
    const subtotal = preco * qtd;
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

  document.getElementById('modal-confirmacao-final').classList.add('ativo');
  document.getElementById('overlay-confirmacao-final').classList.add('ativo');
}


// -----------------------------------------------
// fecharTelaDeConfirmacao()
// Fecha o comprovante final e zera tudo para
// que um novo pedido possa ser feito.
// -----------------------------------------------
function fecharTelaDeConfirmacao() {
  document.getElementById('modal-confirmacao-final').classList.remove('ativo');
  document.getElementById('overlay-confirmacao-final').classList.remove('ativo');

  // Limpa todos os itens do carrinho
  Object.keys(carrinho).forEach(nome => delete carrinho[nome]);

  // Reseta os contadores visuais de todos os itens para 0
  document.querySelectorAll('.item-qtd').forEach(el => el.textContent = '0');
  document.querySelectorAll('.btn-menos').forEach(btn => btn.disabled = true);

  // Bloqueia novamente o botão + das fritas
  document.querySelectorAll('.item[data-nome="Adicional de fritas"] .btn-mais')
    .forEach(btn => btn.disabled = true);

  // Limpa os dados do cliente para o próximo pedido
  dadosCliente.nome = '';
  dadosCliente.mesa = '';

  // Atualiza a barra (vai desaparecer pois o carrinho está vazio)
  atualizarBarraDoCarrinho();
}

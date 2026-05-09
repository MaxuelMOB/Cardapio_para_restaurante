// api/webhook.js
// Chamado automaticamente pelo Mercado Pago quando o pagamento é confirmado
// Envia a mensagem do pedido para o Telegram do atendente

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { type, data } = req.body;

  // só processa notificações de pagamento
  if (type !== 'payment') {
    return res.status(200).json({ ok: true });
  }

  try {
    // busca os detalhes do pagamento no Mercado Pago
    const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    const pagamento = await resposta.json();

    // só continua se o pagamento foi aprovado
    if (pagamento.status !== 'approved') {
      return res.status(200).json({ ok: true, status: pagamento.status });
    }

    // lê a descrição montada pelo criar-pagamento.js
    // formato: "CAM 1 | João Silva | Caipira Vodka x1 | Heineken x2 | Total R$ 43,00"
    const descricao = pagamento.description || '';
    const partes = descricao.split('|').map(p => p.trim());
    const mesa = partes[0] || '';
    const nomeCliente = partes[1] || '';
    const totalStr = partes[partes.length - 1] || '';
    const itens = partes.slice(2, partes.length - 1).join('\n• ');

    // captura data e hora atual
    const agora = new Date();
    const data_br = agora.toLocaleDateString('pt-BR');
    const hora_br = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // monta a mensagem completa
    const mensagem =
      `🍺 *NOVO PEDIDO - Colarinho Lounge Bar*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *Pagamento Pix Confirmado!*\n` +
      `📅 ${data_br} às ${hora_br}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 Cliente: ${nomeCliente}\n` +
      `🪑 ${mesa}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🛒 *Itens do Pedido:*\n• ${itens}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *${totalStr}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🆔 ID: ${pagamento.id}`;

    // pega as credenciais do Telegram nas variáveis de ambiente do Vercel
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const respostaTelegram = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensagem,
          parse_mode: 'Markdown',
        }),
      }
    );

    const dadosTelegram = await respostaTelegram.json();

    console.log('Pagamento aprovado!');
    console.log('Telegram resposta:', dadosTelegram);

    return res.status(200).json({ ok: true, telegram: dadosTelegram });

  } catch (erro) {
    console.error('Erro no webhook:', erro);
    return res.status(500).json({ erro: 'Erro interno' });
  }
}
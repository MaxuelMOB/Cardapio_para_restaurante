export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { type, data } = req.body;

  if (type !== 'payment' || !data?.id) {
    return res.status(200).json({ ok: true });
  }

  try {
    const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });

    const pagamento = await resposta.json();

    if (pagamento.status !== 'approved') {
      return res.status(200).json({ ok: true, status: pagamento.status });
    }

    const descricao = pagamento.description || '';
    const partes = descricao.split('|').map(p => p.trim());
    const mesa = partes[0] || '';
    const nomeCliente = partes[1] || '';
    const totalStr = partes[partes.length - 1] || '';
    const itens = partes.slice(2, partes.length - 1).join('\n• ');

    // fuso horário de Brasília
    const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const [data_br, hora_br] = agora.split(', ');

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
    console.log('Telegram:', dadosTelegram);

    return res.status(200).json({ ok: true, telegram: dadosTelegram });

  } catch (erro) {
    console.error('Erro no webhook:', erro);
    return res.status(500).json({ erro: 'Erro interno' });
  }
}
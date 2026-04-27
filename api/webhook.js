// api/webhook.js
// Chamado automaticamente pelo Mercado Pago quando o pagamento é confirmado

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

    // a descrição vem no formato definido no criar-pagamento.js:
    // "Mesa CAM 1 | João Silva | Caipira Vodka x1 | Heineken x2 | Total R$ 43.00"
    const descricao = pagamento.description || '';

    // extrai as partes da descrição separadas por |
    const partes = descricao.split('|').map(p => p.trim());
    const mesa = partes[0] || '';
    const nomeCliente = partes[1] || '';
    const totalStr = partes[partes.length - 1] || '';

    // monta a lista de itens (tudo entre o nome e o total)
    const itens = partes.slice(2, partes.length - 1).join('\n• ');

    // monta a mensagem completa para o WhatsApp do atendente
    const mensagem =
      `🍺 *NOVO PEDIDO - Colarinho Lounge Bar*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *Pagamento Pix Confirmado!*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 Cliente: ${nomeCliente}\n` +
      `🪑 ${mesa}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🛒 *Itens do Pedido:*\n• ${itens}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *${totalStr}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🆔 ID: ${pagamento.id}`;

    const numeroWhatsApp = '5551996830150';
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    console.log('Pagamento aprovado!');
    console.log('Mensagem WhatsApp:', mensagem);
    console.log('URL:', urlWhatsApp);

    return res.status(200).json({ ok: true, whatsapp: urlWhatsApp });

  } catch (erro) {
    console.error('Erro no webhook:', erro);
    return res.status(500).json({ erro: 'Erro interno' });
  }
}

// api/criar-pagamento.js
// Cria o pagamento Pix no Mercado Pago e retorna o QR Code

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { valor, nomecliente, mesa, itens } = req.body;

  if (!valor || !nomecliente || !mesa || !itens) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  // monta a descrição no formato que o webhook vai ler depois
  // formato: "Mesa CAM 1 | João Silva | Caipira Vodka x1 | Heineken x2 | Total R$ 43,00"
  const listaItens = itens.map(i => `${i.nome} x${i.qtd}`).join(' | ');
  const totalFormatado = `Total R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  const descricao = `${mesa} | ${nomecliente} | ${listaItens} | ${totalFormatado}`;

  try {
    const resposta = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `colarinho-${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: parseFloat(valor),
        description: descricao,
        payment_method_id: 'pix',
        payer: {
          email: 'cliente@colarinho.com',
          first_name: nomecliente,
        },
        // pagamento expira em 30 minutos
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        notification_url: `https://colarinho.vercel.app/api/webhook`,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error('Erro MP:', dados);
      return res.status(500).json({ erro: 'Erro ao criar pagamento', detalhe: dados });
    }

    return res.status(200).json({
      id: dados.id,
      qrcode: dados.point_of_interaction.transaction_data.qr_code,
      qrcode_base64: dados.point_of_interaction.transaction_data.qr_code_base64,
      status: dados.status,
    });

  } catch (erro) {
    console.error('Erro interno:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

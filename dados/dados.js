/* ==============================================
   ARQUIVO: dados.js
   DESCRIÇÃO: Variáveis globais que guardam as
   informações do pedido durante todo o fluxo.

   ⚠️ Este arquivo DEVE ser carregado PRIMEIRO
   no index.html, pois os outros arquivos
   dependem dessas variáveis.
================================================ */


// -----------------------------------------------
// CARRINHO
// Objeto que guarda os itens que o cliente escolheu.
// Exemplo de como fica quando preenchido:
// carrinho = {
//   "Caipira Vodka": { preco: 25.00, qtd: 2 },
//   "Heineken":      { preco: 17.00, qtd: 1 }
// }
// -----------------------------------------------
const carrinho = {};


// -----------------------------------------------
// DADOS DO CLIENTE
// Guarda o nome e a mesa preenchidos na Etapa 2.
// Usado depois na mensagem do WhatsApp e no comprovante.
// -----------------------------------------------
const dadosCliente = {
  nome: '',  // Ex: "João Silva"
  mesa: ''   // Ex: "5"
};


// -----------------------------------------------
// NÚMERO DO PEDIDO
// Começa em 0 e vai até 50, depois reinicia.
// Salvo no localStorage para não perder ao recarregar a página.
// localStorage é uma memória do navegador que persiste mesmo fechando a aba.
// -----------------------------------------------
let numeroPedido = parseInt(localStorage.getItem('numeroPedido') || '0');

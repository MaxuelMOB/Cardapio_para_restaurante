/* ==============================================
   ARQUIVO: navegacao.js
   DESCRIÇÃO: Funções de navegação entre categorias
   do cardápio e controle do popup de promoção.
   Também contém a inicialização da página.

   Funções deste arquivo:
   - trocarCategoria()
   - fecharAnuncio()
   - Inicialização da página (window load)
   - Inicialização do popup
================================================ */


// -----------------------------------------------
// trocarCategoria(categoria, botaoClicado)
// Chamada quando o cliente toca em um botão
// de categoria (Drinks, Cervejas, Burgers...).
// Esconde a categoria atual e mostra a nova.
//
// Parâmetros:
//   categoria    → string com o nome da categoria
//                  (ex: 'drinks', 'cervejas', 'burgers')
//   botaoClicado → referência ao botão que foi tocado
//                  usado para deixá-lo destacado em vermelho
// -----------------------------------------------
function trocarCategoria(categoria, botaoClicado) {
  // Esconde todos os cards com animação de saída
  document.querySelectorAll('.card').forEach(card => {
    card.classList.remove('show');

    // Após a animação terminar (400ms), esconde de verdade
    setTimeout(() => {
      if (!card.classList.contains('show')) card.style.display = 'none';
    }, 400);
  });

  // Remove o destaque vermelho de todos os botões
  document.querySelectorAll('.btn-categoria').forEach(btn => btn.classList.remove('ativo'));

  // Deixa o botão clicado destacado em vermelho
  botaoClicado.classList.add('ativo');

  // Centraliza o botão clicado na barra de scroll horizontal
  // Útil quando o botão está no começo ou fim da barra
  botaoClicado.scrollIntoView({ inline: 'center', behavior: 'smooth' });

  // Encontra o card da categoria pelo atributo data-categoria no HTML
  const cardDaCategoria = document.querySelector(`[data-categoria="${categoria}"]`);
  if (cardDaCategoria) {
    cardDaCategoria.style.display = 'block';

    // getBoundingClientRect() força o navegador a "calcular" o elemento
    // antes de iniciar a animação — sem isso a animação pode não funcionar
    cardDaCategoria.getBoundingClientRect();

    // Adiciona a classe 'show' que ativa a animação de entrada (CSS)
    cardDaCategoria.classList.add('show');

    // Rola a página de volta ao topo para o cliente ver o início da categoria
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}


// -----------------------------------------------
// INICIALIZAÇÃO DA PÁGINA
// Este bloco roda UMA ÚNICA VEZ quando a página
// termina de carregar completamente.
// -----------------------------------------------
window.addEventListener('load', () => {

  // Cria os botões + e − em todos os itens do cardápio
  criarBotoesDeQuantidade();

  // Esconde todos os cards inicialmente
  document.querySelectorAll('.card').forEach(card => {
    card.style.display = 'none';
    card.classList.remove('show');
  });

  // Mostra apenas a categoria "Drinks" por padrão ao abrir o cardápio
  const cardDrinks = document.querySelector('[data-categoria="drinks"]');
  if (cardDrinks) {
    cardDrinks.style.display = 'block';
    cardDrinks.getBoundingClientRect(); // Força reflow para animação funcionar
    cardDrinks.classList.add('show');
  }
});


// -----------------------------------------------
// POPUP DE PROMOÇÃO
// Abre automaticamente 1 segundo após a página
// carregar, mostrando a promoção do dia.
// -----------------------------------------------
const popup = document.getElementById('popup');

// Abre o popup depois de 1 segundo (1000 milissegundos)
window.addEventListener('load', () => {
  setTimeout(() => popup.classList.add('ativo'), 1000);
});


// -----------------------------------------------
// fecharAnuncio()
// Fecha o popup de promoção.
// Chamada pelo botão × do popup.
// -----------------------------------------------
function fecharAnuncio() {
  popup.classList.remove('ativo');
}

// Fecha o popup ao clicar no fundo escuro (fora da imagem)
// e.target === this verifica se o clique foi no fundo, não na imagem
popup.addEventListener('click', function (e) {
  if (e.target === this) fecharAnuncio();
});

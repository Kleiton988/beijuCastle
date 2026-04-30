const KEY = "avaliacoes";

function getAvaliacoes() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function salvarAvaliacoes(lista) {
  localStorage.setItem(KEY, JSON.stringify(lista));
}

// Salva ou atualiza a nota de um usuário para um produto
export function avaliarProduto(produto, usuario, nota) {
  if (!produto || !usuario || nota < 1 || nota > 5) return;
  const avaliacoes = getAvaliacoes();
  const index = avaliacoes.findIndex(a => a.produto === produto && a.usuario === usuario);
  if (index !== -1) {
    avaliacoes[index].nota = nota;
  } else {
    avaliacoes.push({ produto, usuario, nota });
  }
  salvarAvaliacoes(avaliacoes);
}

// Retorna a nota média de um produto (número decimal)
export function obterNotaMedia(produto) {
  const avaliacoes = getAvaliacoes().filter(a => a.produto === produto);
  if (avaliacoes.length === 0) return 0;
  const soma = avaliacoes.reduce((acc, a) => acc + a.nota, 0);
  return soma / avaliacoes.length;
}

// Retorna a nota que um usuário específico deu a um produto (0 se não avaliou)
export function obterAvaliacaoUsuario(produto, usuario) {
  const avaliacao = getAvaliacoes().find(a => a.produto === produto && a.usuario === usuario);
  return avaliacao ? avaliacao.nota : 0;
}
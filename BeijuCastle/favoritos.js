let usuarioEmail = null;

// Deve ser chamado após autenticação para definir a chave
export function setUsuarioEmail(email) {
  usuarioEmail = email;
}

function getKey() {
  return usuarioEmail ? `favoritos_${usuarioEmail}` : "favoritos_anonimo";
}

function getFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(getKey())) || [];
  } catch {
    return [];
  }
}

function salvarFavoritos(lista) {
  localStorage.setItem(getKey(), JSON.stringify(lista));
}

export function favoritarItem(item) {
  if (!item || !item.nome) return;
  const favoritos = getFavoritos();
  if (!favoritos.find(f => f.nome === item.nome)) {
    favoritos.push({ nome: item.nome, preco: item.preco });
    salvarFavoritos(favoritos);
  }
}

export function removerFavorito(nome) {
  let favoritos = getFavoritos();
  favoritos = favoritos.filter(f => f.nome !== nome);
  salvarFavoritos(favoritos);
}

export function listarFavoritos() {
  return getFavoritos();
}

export function limparTodosFavoritos() {
  salvarFavoritos([]);
}
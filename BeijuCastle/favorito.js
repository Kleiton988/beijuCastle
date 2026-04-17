const KEY = "favoritos";

// ADICIONAR
export function favoritarItem(item) {
  let favoritos = JSON.parse(localStorage.getItem(KEY)) || [];

  const existe = favoritos.find(f => f.nome === item.nome);

  if (!existe) {
    favoritos.push(item);
  }

  localStorage.setItem(KEY, JSON.stringify(favoritos));
}

// REMOVER
export function removerFavorito(nome) {
  let favoritos = JSON.parse(localStorage.getItem(KEY)) || [];

  favoritos = favoritos.filter(f => f.nome !== nome);

  localStorage.setItem(KEY, JSON.stringify(favoritos));
}

// LISTAR
export function listarFavoritos() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

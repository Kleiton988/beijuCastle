const KEY = "usuarios";

// CRIAR USUÁRIO
export function salvarUsuario(usuario) {
  const usuarios = JSON.parse(localStorage.getItem(KEY)) || [];
  usuarios.push(usuario);
  localStorage.setItem(KEY, JSON.stringify(usuarios));
}

// BUSCAR USUÁRIO
export function buscarUsuario(email) {
  const usuarios = JSON.parse(localStorage.getItem(KEY)) || [];
  return usuarios.find(u => u.email === email);
}

// DEFINIR USUÁRIO ATUAL
export function setUsuarioAtual(usuario) {
  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
}

// PEGAR USUÁRIO ATUAL
export function getUsuarioAtual() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}
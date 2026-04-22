const KEY = "usuarios";

function salvarUsuario(usuario) {
  const usuarios = JSON.parse(localStorage.getItem(KEY)) || [];
  usuarios.push(usuario);
  localStorage.setItem(KEY, JSON.stringify(usuarios));
}

function buscarUsuario(email) {
  const usuarios = JSON.parse(localStorage.getItem(KEY)) || [];
  return usuarios.find(u => u.email === email);
}

function setUsuarioAtual(usuario) {
  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
}

function getUsuarioAtual() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}

module.exports = {
  salvarUsuario,
  buscarUsuario,
  setUsuarioAtual,
  getUsuarioAtual
};
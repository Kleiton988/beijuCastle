const KEY = "usuarios";
const USER_LOGADO = "usuarioLogado";

function inicializarAdminPadrao() {
  const usuarios = getUsuarios();
  const adminEmail = "admin@gmail.com";
  if (!usuarios.find(u => u.email === adminEmail)) {
    usuarios.push({ email: adminEmail, role: "admin" });
    salvarLista(usuarios);
  }
}
inicializarAdminPadrao();

function getUsuarios() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

function salvarLista(usuarios) {
  localStorage.setItem(KEY, JSON.stringify(usuarios));
}

export function salvarUsuario(usuario) {
  if (!usuario || !usuario.email) throw new Error("Usuário inválido");
  const usuarios = getUsuarios();
  if (usuarios.find(u => u.email === usuario.email)) {
    throw new Error("Usuário já existe");
  }
  usuarios.push({ email: usuario.email, role: usuario.role || "user" });
  salvarLista(usuarios);
}

export function buscarUsuario(email) {
  if (!email) return null;
  return getUsuarios().find(u => u.email === email) || null;
}

export function listarTodosUsuarios() {
  return getUsuarios();
}

export function atualizarUsuario(email, novosDados) {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex(u => u.email === email);
  if (index === -1) return false;
  usuarios[index] = { ...usuarios[index], ...novosDados };
  salvarLista(usuarios);
  return true;
}

export function removerUsuario(email) {
  let usuarios = getUsuarios();
  usuarios = usuarios.filter(u => u.email !== email);
  salvarLista(usuarios);
}

export function promoverParaAdmin(email) {
  return atualizarUsuario(email, { role: "admin" });
}

export function rebaixarDeAdmin(email) {
  if (email === "admin@gmail.com") throw new Error("Não é possível rebaixar o admin principal");
  return atualizarUsuario(email, { role: "user" });
}

export function isAdmin(email) {
  const usuario = buscarUsuario(email);
  return usuario?.role === "admin";
}

export function setUsuarioAtual(usuario) {
  if (!usuario) return;
  localStorage.setItem(USER_LOGADO, JSON.stringify(usuario));
}

export function getUsuarioAtual() {
  try { return JSON.parse(localStorage.getItem(USER_LOGADO)); }
  catch { return null; }
}

export function logoutUsuario() {
  localStorage.removeItem(USER_LOGADO);
}
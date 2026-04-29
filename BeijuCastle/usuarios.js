const KEY = "usuarios";
const USER_LOGADO = "usuarioLogado";

// ================= ADMIN PADRÃO =================
function inicializarAdminPadrao() {
  const usuarios = getUsuarios();
  const adminEmail = "admin@gmail.com";
  if (!usuarios.find(u => u.email === adminEmail)) {
    usuarios.push({ email: adminEmail, role: "admin" });
    salvarLista(usuarios);
  }
}

// Chama ao carregar o módulo
inicializarAdminPadrao();

// ================= UTILS =================
function getUsuarios() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function salvarLista(usuarios) {
  localStorage.setItem(KEY, JSON.stringify(usuarios));
}

// ================= CRIAR USUÁRIO =================
export function salvarUsuario(usuario) {
  if (!usuario || !usuario.email) throw new Error("Usuário inválido");
  const usuarios = getUsuarios();
  if (usuarios.find(u => u.email === usuario.email)) {
    throw new Error("Usuário já existe");
  }
  usuarios.push({ email: usuario.email, role: usuario.role || "user" });
  salvarLista(usuarios);
}

// ================= BUSCAR =================
export function buscarUsuario(email) {
  if (!email) return null;
  const usuarios = getUsuarios();
  return usuarios.find(u => u.email === email) || null;
}

// ================= LISTAR TODOS (ADMIN) =================
export function listarTodosUsuarios() {
  return getUsuarios();
}

// ================= ATUALIZAR =================
export function atualizarUsuario(email, novosDados) {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex(u => u.email === email);
  if (index === -1) return false;
  usuarios[index] = { ...usuarios[index], ...novosDados };
  salvarLista(usuarios);
  return true;
}

// ================= REMOVER =================
export function removerUsuario(email) {
  let usuarios = getUsuarios();
  usuarios = usuarios.filter(u => u.email !== email);
  salvarLista(usuarios);
}

// ================= PROMOVER / REBAIXAR =================
export function promoverParaAdmin(email) {
  return atualizarUsuario(email, { role: "admin" });
}

export function rebaixarDeAdmin(email) {
  // Não permite remover o admin padrão
  if (email === "admin@gmail.com") {
    throw new Error("Não é possível rebaixar o administrador principal");
  }
  return atualizarUsuario(email, { role: "user" });
}

// ================= VERIFICAÇÃO RÁPIDA =================
export function isAdmin(email) {
  const usuario = buscarUsuario(email);
  return usuario?.role === "admin";
}

// ================= USUÁRIO ATUAL =================
export function setUsuarioAtual(usuario) {
  if (!usuario) return;
  localStorage.setItem(USER_LOGADO, JSON.stringify(usuario));
}

export function getUsuarioAtual() {
  try {
    return JSON.parse(localStorage.getItem(USER_LOGADO));
  } catch {
    return null;
  }
}

export function logoutUsuario() {
  localStorage.removeItem(USER_LOGADO);
}
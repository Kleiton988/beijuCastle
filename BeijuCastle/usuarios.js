const KEY = "usuarios";
const USER_LOGADO = "usuarioLogado";

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
  if (!usuario || !usuario.email) {
    throw new Error("Usuário inválido");
  }

  const usuarios = getUsuarios();

  const existe = usuarios.find(u => u.email === usuario.email);

  if (existe) {
    throw new Error("Usuário já existe");
  }

  usuarios.push({
    email: usuario.email,
    role: usuario.role || "user"
  });

  salvarLista(usuarios);
}

// ================= BUSCAR =================
export function buscarUsuario(email) {
  if (!email) return null;

  const usuarios = getUsuarios();
  return usuarios.find(u => u.email === email) || null;
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
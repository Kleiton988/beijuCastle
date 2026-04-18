const KEY = "usuarios";

// SALVAR / ATUALIZAR USUÁRIO
export function salvarUsuario(email, dados) {
  let usuarios = JSON.parse(localStorage.getItem(KEY)) || [];

  const index = usuarios.findIndex(u => u.email === email);

  if (index !== -1) {
    usuarios[index] = { ...usuarios[index], ...dados };
  } else {
    usuarios.push({ email, ...dados });
  }

  localStorage.setItem(KEY, JSON.stringify(usuarios));
}

// BUSCAR USUÁRIO
export function buscarUsuario(email) {
  const usuarios = JSON.parse(localStorage.getItem(KEY)) || [];
  return usuarios.find(u => u.email === email);
}
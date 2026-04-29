const KEY = "pedidos";

// ================= STORAGE =================
function getPedidos() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function salvarPedidos(lista) {
  localStorage.setItem(KEY, JSON.stringify(lista));
}

// ================= SALVAR =================
export function salvarPedido(pedido) {
  const pedidos = getPedidos();
  pedidos.push(pedido);
  salvarPedidos(pedidos);
}

// ================= LISTAR TODOS =================
export function listarPedidos() {
  return getPedidos();
}

// ================= LISTAR POR USUÁRIO =================
export function listarPedidosPorUsuario(email) {
  const pedidos = getPedidos();
  return pedidos.filter(p => p.usuario === email);
}

// ================= ATUALIZAR STATUS =================
export function atualizarStatusPedido(id, novoStatus) {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === id);
  if (index !== -1) {
    pedidos[index].status = novoStatus;
    salvarPedidos(pedidos);
  }
}

// ================= CANCELAR =================
export function cancelarPedido(id) {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === id);
  if (index !== -1 && pedidos[index].status === "pendente") {
    pedidos[index].status = "cancelado";
    salvarPedidos(pedidos);
  }
}
const KEY = "pedidos";

// ================= SALVAR =================
export function salvarPedido(pedido) {
  const pedidos = JSON.parse(localStorage.getItem(KEY)) || [];

  pedidos.push(pedido);

  localStorage.setItem(KEY, JSON.stringify(pedidos));
}

// ================= LISTAR TODOS =================
export function listarPedidos() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

// ================= LISTAR POR USUÁRIO =================
export function listarPedidosPorUsuario(email) {
  const pedidos = listarPedidos();

  return pedidos.filter(p => p.usuario === email);
}

// ================= ATUALIZAR STATUS =================
export function atualizarStatusPedido(id, novoStatus) {
  const pedidos = listarPedidos();

  const index = pedidos.findIndex(p => p.id === id);

  if (index !== -1) {
    pedidos[index].status = novoStatus;
    localStorage.setItem(KEY, JSON.stringify(pedidos));
  }
}
export function cancelarPedido(id) {
  const pedidos = listarPedidos();

  const index = pedidos.findIndex(p => p.id === id);

  if (index !== -1) {
    pedidos[index].status = "cancelado";
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
  }
}
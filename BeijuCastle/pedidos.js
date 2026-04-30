const KEY = "pedidos";

function getPedidos() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

function salvarPedidos(lista) {
  localStorage.setItem(KEY, JSON.stringify(lista));
}

export function salvarPedido(pedido) {
  const pedidos = getPedidos();
  pedidos.push(pedido);
  salvarPedidos(pedidos);
}

export function listarPedidos() {
  return getPedidos();
}

export function listarPedidosPorUsuario(email) {
  return getPedidos().filter(p => p.usuario === email);
}

export function atualizarStatusPedido(id, novoStatus) {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === id);
  if (index !== -1) {
    pedidos[index].status = novoStatus;
    salvarPedidos(pedidos);
  }
}

export function cancelarPedido(id) {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === id);
  if (index !== -1 && pedidos[index].status === "pendente") {
    pedidos[index].status = "cancelado";
    salvarPedidos(pedidos);
  }
}
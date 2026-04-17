const KEY = "pedidos";

// SALVAR
export function salvarPedido(pedido) {
  const pedidos = JSON.parse(localStorage.getItem(KEY)) || [];
  pedidos.push(pedido);
  localStorage.setItem(KEY, JSON.stringify(pedidos));
}

// LISTAR
export function listarPedidos(usuario) {
  const pedidos = JSON.parse(localStorage.getItem(KEY)) || [];
  return pedidos.filter(p => p.usuario === usuario);
}

// ATUALIZAR STATUS
export function atualizarStatusPedido(id, novoStatus) {
  const pedidos = JSON.parse(localStorage.getItem(KEY)) || [];

  const pedido = pedidos.find(p => p.id === id);
  if (pedido) {
    pedido.status = novoStatus;
  }

  localStorage.setItem(KEY, JSON.stringify(pedidos));
}

// CANCELAR
export function cancelarPedido(id) {
  let pedidos = JSON.parse(localStorage.getItem(KEY)) || [];

  pedidos = pedidos.map(p => {
    if (p.id === id && p.status === "pendente") {
      p.status = "cancelado";
    }
    return p;
  });

  localStorage.setItem(KEY, JSON.stringify(pedidos));
}
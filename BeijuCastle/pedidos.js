// pedidos.js

// Salvar pedido
export function salvarPedido(pedido) {
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos.push(pedido);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

// Buscar pedidos do usuário
export function getPedidosUsuario(email) {
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  return pedidos.filter(p => p.usuario === email);
}
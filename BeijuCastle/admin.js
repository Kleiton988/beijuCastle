import { listarPedidos, atualizarStatusPedido } from "./pedidos.js";
import { getUsuarioAtual } from "./usuarios.js";

// ================= SEGURANÇA =================
const usuario = getUsuarioAtual();

if (!usuario || usuario.role !== "admin") {
  alert("Acesso negado!");
  window.location.href = "home.html";
}

// ================= RENDER =================
function renderPedidos() {
  const container = document.getElementById("listaPedidos");

  if (!container) return;

  const pedidos = listarPedidos();

  container.innerHTML = "";

  if (pedidos.length === 0) {
    container.innerHTML = "<p>Nenhum pedido encontrado</p>";
    return;
  }

  pedidos.forEach(p => {
    const div = document.createElement("div");
    div.className = "pedido";

    div.innerHTML = `
      <p><strong>ID:</strong> ${p.id}</p>
      <p><strong>Cliente:</strong> ${p.usuario}</p>
      <p><strong>Total:</strong> R$ ${p.total}</p>
      <p><strong>Status:</strong> ${p.status}</p>

      <button onclick="mudarStatus(${p.id}, 'preparando')">Preparando</button>
      <button onclick="mudarStatus(${p.id}, 'pronto')">Pronto</button>
    `;

    container.appendChild(div);
  });
}

// ================= AÇÕES =================
window.mudarStatus = (id, status) => {
  atualizarStatusPedido(id, status);
  renderPedidos();
};

window.voltar = () => {
  window.location.href = "home.html";
};

// ================= INIT =================
document.addEventListener("DOMContentLoaded", renderPedidos);
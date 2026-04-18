import { listarPedidos } from "./pedidos.js";
import { getUsuarioAtual } from "./usuarios.js";

const usuario = getUsuarioAtual();

// 🔒 BLOQUEIO
if (!usuario || usuario.role !== "admin") {
  alert("Acesso negado!");
  window.location.href = "home.html";
}

// MOSTRAR TODOS OS PEDIDOS
const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

const container = document.getElementById("listaPedidos");

pedidos.forEach(p => {
  const div = document.createElement("div");

  div.innerHTML = `
    <strong>${p.usuario}</strong> - R$ ${p.total} - ${p.status}
  `;

  container.appendChild(div);
});

// VOLTAR
window.voltar = () => {
  window.location.href = "home.html";
};
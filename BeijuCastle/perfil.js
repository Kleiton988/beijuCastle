import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { listarPedidos, cancelarPedido } from "./pedidos.js";

let usuarioAtual = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioAtual = user;

    document.getElementById("userEmail").textContent = user.email;

    renderPedidos();
  } else {
    window.location.href = "index.html";
  }
});

// RENDER PEDIDOS
function renderPedidos() {
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "";

  const pedidos = listarPedidos(usuarioAtual.email);

  if (pedidos.length === 0) {
    lista.innerHTML = "<p>Nenhum pedido encontrado.</p>";
    return;
  }

  pedidos.forEach(p => {
    const div = document.createElement("div");

    div.innerHTML = `
      <p><b>ID:</b> ${p.id}</p>
      <p><b>Status:</b> ${p.status}</p>
      <p><b>Total:</b> R$ ${p.total}</p>
      <p><b>Data:</b> ${p.data}</p>

      ${
        p.status === "pendente"
          ? `<button onclick="cancelar(${p.id})">Cancelar</button>`
          : ""
      }

      <hr>
    `;

    lista.appendChild(div);
  });
}

// CANCELAR
window.cancelar = (id) => {
  cancelarPedido(id);
  renderPedidos();
};

// VOLTAR
window.voltar = () => {
  window.location.href = "home.html";
};
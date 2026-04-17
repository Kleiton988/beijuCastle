import { auth } from "./firebase.js";
import { getPedidosUsuario } from "./pedidos.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Verifica login
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("userEmail").textContent = user.email;

    carregarPedidos(user.email);
  } else {
    window.location.href = "index.html";
  }
});

// Voltar
window.voltar = () => {
  window.location.href = "home.html";
};

// Carregar pedidos
function carregarPedidos(email) {
  const pedidos = getPedidosUsuario(email);
  const lista = document.getElementById("listaPedidos");

  lista.innerHTML = "";

  if (pedidos.length === 0) {
    lista.innerHTML = "<p>Você ainda não fez pedidos.</p>";
    return;
  }

  pedidos.forEach(p => {
    const div = document.createElement("div");

    div.style.background = "white";
    div.style.padding = "10px";
    div.style.margin = "10px 0";
    div.style.borderRadius = "8px";

    div.innerHTML = `
      <strong>Pedido #${p.id}</strong><br>
      Data: ${p.data}<br>
      Status: ${p.status}<br>
      Total: R$ ${p.total.toFixed(2)}
      <hr>
      ${p.itens.map(i => `${i.nome} x${i.qtd}`).join("<br>")}
    `;

    lista.appendChild(div);
  });
}
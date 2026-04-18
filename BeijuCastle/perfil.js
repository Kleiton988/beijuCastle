import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { salvarUsuario, buscarUsuario } from "./usuarios.js";
import { listarPedidos } from "./pedidos.js";

let usuarioAtual = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioAtual = user;

    document.getElementById("email").textContent = "Email: " + user.email;

    carregarPerfil();
    carregarPedidos();

  } else {
    window.location.href = "index.html";
  }
});

// CARREGAR DADOS
function carregarPerfil() {
  const dados = buscarUsuario(usuarioAtual.email);

  if (!dados) return;

  document.getElementById("nome").value = dados.nome || "";
  document.getElementById("telefone").value = dados.telefone || "";
  document.getElementById("endereco").value = dados.endereco || "";
}

// SALVAR PERFIL
window.salvarPerfil = () => {
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const endereco = document.getElementById("endereco").value;

  salvarUsuario(usuarioAtual.email, {
    nome,
    telefone,
    endereco
  });

  alert("Perfil salvo!");
};

// LISTAR PEDIDOS
function carregarPedidos() {
  const lista = document.getElementById("pedidos");

  const pedidos = listarPedidos(usuarioAtual.email);

  lista.innerHTML = "";

  pedidos.forEach(p => {
    const div = document.createElement("div");

    div.innerHTML = `
      Pedido #${p.id} - ${p.status} - R$ ${p.total}
      <br>
      ${p.data}
      <hr>
    `;

    lista.appendChild(div);
  });
}
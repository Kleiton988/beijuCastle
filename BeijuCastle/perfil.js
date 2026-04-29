import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { buscarUsuario, atualizarUsuario } from "./usuarios.js";
import { listarPedidosPorUsuario, cancelarPedido } from "./pedidos.js";

let usuarioAtual = null;

// ================= INIT =================
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

// ================= PERFIL =================
function carregarPerfil() {
  const dados = buscarUsuario(usuarioAtual.email);
  if (!dados) return;

  document.getElementById("nome").value = dados.nome || "";
  document.getElementById("telefone").value = dados.telefone || "";
  document.getElementById("endereco").value = dados.endereco || "";
}

window.salvarPerfil = () => {
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const endereco = document.getElementById("endereco").value.trim();

  if (!nome) {
    return mostrarMsg("Nome obrigatório", "erro");
  }

  atualizarUsuario(usuarioAtual.email, {
    nome,
    telefone,
    endereco
  });

  mostrarMsg("Perfil atualizado!", "sucesso");
};

// ================= PEDIDOS =================
function carregarPedidos() {
  const lista = document.getElementById("pedidos");
  const pedidos = listarPedidosPorUsuario(usuarioAtual.email);

  lista.innerHTML = "";

  if (pedidos.length === 0) {
    lista.innerHTML = "<p>Nenhum pedido encontrado</p>";
    return;
  }

  pedidos.sort((a, b) => b.id - a.id);

  pedidos.forEach(p => {
    const div = document.createElement("div");

    let itens = "";
    p.itens.forEach(i => {
      itens += `${i.nome} x${i.qtd}<br>`;
    });

    const podeCancelar = p.status === "pendente";

    div.innerHTML = `
       <strong>Pedido #${p.id}</strong><br>
       ${itens}
       Total: R$ ${p.total}<br>
       Status: ${p.status}<br>
       ${p.data}<br>
       ${podeCancelar ? `<button onclick="cancelar(${p.id})">Cancelar</button>` : ""}
       <hr>
    `;

    lista.appendChild(div);
  });
}

// ================= CANCELAR =================
window.cancelar = (id) => {
  cancelarPedido(id);
  mostrarMsg("Pedido cancelado!", "sucesso");
  carregarPedidos();
};

// ================= UI =================
function mostrarMsg(texto, tipo = "normal") {
  const msg = document.getElementById("msg");
  msg.textContent = texto;
  msg.style.background =
    tipo === "erro" ? "#e74c3c" :
    tipo === "sucesso" ? "#2ecc71" :
    "#333";
  msg.style.display = "block";
  setTimeout(() => {
    msg.style.display = "none";
  }, 3000);
}

// Voltar para home (se não tiver botão no HTML)
window.voltarHome = () => {
  window.location.href = "home.html";
};
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { salvarUsuario, buscarUsuario } from "./usuarios.js";
import { listarPedidos, cancelarPedido } from "./pedidos.js";

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

  // ORDENAR (mais recente primeiro)
  pedidos.sort((a, b) => b.id - a.id);

  // SEPARAR POR STATUS
  const pendentes = pedidos.filter(p => p.status === "pendente");
  const preparando = pedidos.filter(p => p.status === "preparando");
  const prontos = pedidos.filter(p => p.status === "pronto");
  const cancelados = pedidos.filter(p => p.status === "cancelado");

  // FUNÇÃO PRA RENDER GRUPO
  function renderGrupo(titulo, listaPedidos) {
    if (listaPedidos.length === 0) return;

    const tituloEl = document.createElement("h3");
    tituloEl.textContent = titulo;
    lista.appendChild(tituloEl);

    listaPedidos.forEach(p => {
      const div = document.createElement("div");

      let itensHTML = "";
      p.itens.forEach(item => {
        itensHTML += `${item.nome} x${item.qtd} <br>`;
      });

      const status = formatarStatus(p.status);

      let botaoCancelar = "";
      if (p.status === "pendente") {
        botaoCancelar = `<button onclick="cancelar(${p.id})">Cancelar</button>`;
      }

      div.innerHTML = `
        <strong>Pedido #${p.id}</strong> <br>
        ${itensHTML}
        Total: R$ ${p.total} <br>
        Status: ${status} <br>
        ${p.data} <br>
        ${botaoCancelar}
        <hr>
      `;

      lista.appendChild(div);
    });
  }

  //  ORDEM DOS GRUPOS
  renderGrupo("🟡 Pendentes", pendentes);
  renderGrupo("🔵 Em preparo", preparando);
  renderGrupo("🟢 Prontos", prontos);
  renderGrupo("🔴 Cancelados", cancelados);
}
window.cancelar = (id) => {
  cancelarPedido(id);
  alert("Pedido cancelado!");

  carregarPedidos();
};

function formatarStatus(status) {
  switch (status) {
    case "pendente":
      return "🟡 Pendente";
    case "preparando":
      return "🔵 Preparando";
    case "pronto":
      return "🟢 Pronto";
    case "cancelado":
      return "🔴 Cancelado";
    default:
      return status;
  }
}
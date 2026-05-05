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
  if (!dados) {
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("endereco").value = "";
    return;
  }

  document.getElementById("nome").value = dados.nome || "";
  document.getElementById("telefone").value = dados.telefone || "";
  document.getElementById("endereco").value = dados.endereco || "";
}

window.salvarPerfil = () => {
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const endereco = document.getElementById("endereco").value.trim();

  // Validação de campos obrigatórios
  if (!nome || !telefone || !endereco) {
    mostrarMsg("Preencha todos os campos (nome, telefone e endereço).", "erro");
    return;
  }

  const sucesso = atualizarUsuario(usuarioAtual.email, {
    nome,
    telefone,
    endereco
  });

  if (sucesso) {
    mostrarMsg("Perfil atualizado com sucesso!", "sucesso");
  } else {
    mostrarMsg("Erro ao atualizar o perfil. Tente novamente.", "erro");
  }
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
    const nomeCliente = p.nomeCliente || "Não informado";
    const enderecoPedido = p.endereco || "Não informado";

    div.innerHTML = `
      <strong>Pedido #${p.id}</strong><br>
      Cliente: ${nomeCliente}<br>
      ${itens}
      Total: R$ ${p.total.toFixed(2)}<br>
      Frete: R$ ${p.frete ? p.frete.toFixed(2) : "0.00"}<br>
      Status: ${p.status}<br>
      ${p.data}<br>
      Endereço: ${enderecoPedido}<br>
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

window.voltarHome = () => {
  window.location.href = "home.html";
};
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { buscarUsuario, atualizarUsuario } from "./usuarios.js";
import { listarPedidosPorUsuario, cancelarPedido } from "./pedidos.js";

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

function carregarPerfil() {
  const dados = buscarUsuario(usuarioAtual.email);
  document.getElementById("nome").value = dados?.nome || "";
  document.getElementById("telefone").value = dados?.telefone || "";
  document.getElementById("endereco").value = dados?.endereco || "";
}

window.salvarPerfil = () => {
  const nome = document.getElementById("nome").value.trim();
  const telefoneBruto = document.getElementById("telefone").value.trim();
  const endereco = document.getElementById("endereco").value.trim();

  if (!nome || !telefoneBruto || !endereco) {
    mostrarMsg("Preencha todos os campos (nome, telefone e endereço).", "erro");
    return;
  }

  // Limpa telefone (deixa apenas números)
  const telefoneNumerico = telefoneBruto.replace(/\D/g, "");
  if (telefoneNumerico.length < 10) {
    mostrarMsg("Telefone inválido. Informe ao menos DDD + número (10 dígitos).", "erro");
    return;
  }

  if (endereco.length < 5) {
    mostrarMsg("Endereço muito curto. Informe um endereço completo.", "erro");
    return;
  }

  const sucesso = atualizarUsuario(usuarioAtual.email, {
    nome,
    telefone: telefoneNumerico,  // salva apenas números
    endereco
  });

  if (sucesso) {
    mostrarMsg("Perfil atualizado com sucesso!", "sucesso");
    carregarPerfil(); // recarrega para mostrar valor limpo
  } else {
    mostrarMsg("Erro ao atualizar o perfil.", "erro");
  }
};

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
      Cliente: ${p.nomeCliente || "Não informado"}<br>
      ${itens}
      Total: R$ ${p.total.toFixed(2)}<br>
      Frete: R$ ${p.frete ? p.frete.toFixed(2) : "0.00"}<br>
      Status: ${p.status}<br>
      ${p.data}<br>
      Endereço: ${p.endereco || "Não informado"}<br>
      Telefone: ${p.telefone || "Não informado"}<br>
      ${podeCancelar ? `<button onclick="cancelar(${p.id})">Cancelar</button>` : ""}
      <hr>
    `;
    lista.appendChild(div);
  });
}

window.cancelar = (id) => {
  cancelarPedido(id);
  mostrarMsg("Pedido cancelado!", "sucesso");
  carregarPedidos();
};

function mostrarMsg(texto, tipo = "normal") {
  const msg = document.getElementById("msg");
  msg.textContent = texto;
  msg.style.background = tipo === "erro" ? "#e74c3c" : tipo === "sucesso" ? "#2ecc71" : "#333";
  msg.style.display = "block";
  setTimeout(() => { msg.style.display = "none"; }, 3000);
}

window.voltarHome = () => {
  window.location.href = "home.html";
};
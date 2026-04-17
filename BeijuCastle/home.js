import { auth } from "./firebase.js";
import { salvarPedido, atualizarStatusPedido } from "./pedidos.js";
import { favoritarItem, listarFavoritos, removerFavorito } from "./favoritos.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let desconto = 0;
let usuarioAtual = null;

// ================= LOGIN =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioAtual = user;
    document.getElementById("userEmail").textContent = "Logado: " + user.email;

    renderCarrinho();
    renderFavoritos();
  } else {
    window.location.href = "index.html";
  }
});

// ================= LOGOUT =================
document.getElementById("logout").addEventListener("click", async () => {
  await signOut(auth);
  localStorage.removeItem("carrinho");
  window.location.href = "index.html";
});

// ================= CARRINHO =================
window.addCarrinho = (nome, preco) => {
  const itemExistente = carrinho.find(i => i.nome === nome);

  if (itemExistente) {
    itemExistente.qtd++;
  } else {
    carrinho.push({ nome, preco, qtd: 1 });
  }

  salvar();
  renderCarrinho();
};

// ================= FAVORITOS =================
window.toggleFavorito = (nome, preco) => {
  const favoritos = listarFavoritos();
  const existe = favoritos.find(f => f.nome === nome);

  if (existe) {
    removerFavorito(nome);
    alert("Removido dos favoritos");
  } else {
    favoritarItem({ nome, preco });
    alert("Adicionado aos favoritos ⭐");
  }

  renderFavoritos();
};

// 🔥 AGORA CORRETO (FORA DE OUTRA FUNÇÃO)
function renderFavoritos() {
  const container = document.getElementById("favoritos");

  if (!container) return;

  container.innerHTML = "";

  const favoritos = listarFavoritos();

  favoritos.forEach(item => {
    const div = document.createElement("div");

    div.innerHTML = `
      ${item.nome} - R$ ${item.preco}
      <button onclick="addCarrinho('${item.nome}', ${item.preco})">Comprar</button>
    `;

    container.appendChild(div);
  });
}

// ================= QTD =================
window.mudarQtd = (index, tipo) => {
  if (tipo === "mais") carrinho[index].qtd++;
  if (tipo === "menos") carrinho[index].qtd--;

  if (carrinho[index].qtd <= 0) {
    carrinho.splice(index, 1);
  }

  salvar();
  renderCarrinho();
};

// ================= CUPOM =================
window.aplicarCupom = () => {
  const cupom = document.getElementById("cupom").value.toUpperCase();

  if (cupom === "BEIJU10") {
    desconto = 0.1;
    alert("Cupom aplicado! 10% OFF");
  } else {
    desconto = 0;
    alert("Cupom inválido!");
  }

  renderCarrinho();
};

// ================= ENTREGA =================
function calcularEntrega(total) {
  return total >= 30 ? 0 : 5;
}

// ================= RENDER =================
function renderCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  const totalEl = document.getElementById("total");

  lista.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, i) => {
    total += item.preco * item.qtd;

    const div = document.createElement("div");
    div.innerHTML = `
      ${item.nome} (x${item.qtd}) - R$ ${item.preco * item.qtd}
      <button onclick="mudarQtd(${i}, 'mais')">+</button>
      <button onclick="mudarQtd(${i}, 'menos')">-</button>
    `;

    lista.appendChild(div);
  });

  total = total - (total * desconto);

  const entrega = calcularEntrega(total);
  total += entrega;

  totalEl.textContent = `Total: R$ ${total.toFixed(2)} (Entrega: R$ ${entrega})`;
}

// ================= FINALIZAR =================
window.finalizarPedido = () => {
  if (carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }

  const total = calcularTotalFinal();

  const pedido = {
    id: Date.now(),
    usuario: usuarioAtual.email,
    itens: carrinho,
    total: total,
    status: "pendente",
    data: new Date().toLocaleString()
  };

  salvarPedido(pedido);

  setTimeout(() => {
    atualizarStatusPedido(pedido.id, "preparando");
  }, 3000);

  setTimeout(() => {
    atualizarStatusPedido(pedido.id, "pronto");
  }, 7000);

  alert("Pedido enviado!");

  carrinho = [];
  desconto = 0;

  salvar();
  renderCarrinho();
};

// ================= TOTAL =================
function calcularTotalFinal() {
  let total = 0;

  carrinho.forEach(item => {
    total += item.preco * item.qtd;
  });

  total = total - (total * desconto);
  total += calcularEntrega(total);

  return total;
}

// ================= STORAGE =================
function salvar() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// ================= PERFIL =================
window.irPerfil = () => {
  window.location.href = "perfil.html";
};


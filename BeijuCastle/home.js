import { auth } from "./firebase.js";
import { salvarPedido } from "./pedidos.js";
import { favoritarItem, listarFavoritos, removerFavorito } from "./favoritos.js";
import { getUsuarioAtual } from "./usuarios.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ================= ESTADO =================
const state = {
  carrinho: JSON.parse(localStorage.getItem("carrinho")) || [],
  usuario: null,
  cupom: {
    codigo: null,
    desconto: 0,
    aplicado: false
  }
};

// ================= CUPONS =================
const CUPONS = {
  "BEIJU10": { desconto: 0.1, minimo: 20 },
  "PROMO20": { desconto: 0.2, minimo: 40 }
};

// ================= INIT =================
onAuthStateChanged(auth, (user) => {
  const usuario = getUsuarioAtual();

  if (usuario && usuario.role === "admin") {
    document.getElementById("btnAdmin").style.display = "inline-block";
  }

  if (user) {
    state.usuario = user;
    document.getElementById("userEmail").textContent = "Logado: " + user.email;
    renderAll();
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

// ================= HELPERS =================
function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(state.carrinho));
}

function calcularSubtotal() {
  return state.carrinho.reduce((t, i) => t + i.preco * i.qtd, 0);
}

function calcularEntrega(subtotal) {
  return subtotal >= 30 ? 0 : 5;
}

function calcularResumo() {
  const subtotal = calcularSubtotal();
  const descontoValor = subtotal * state.cupom.desconto;
  const total = subtotal - descontoValor + calcularEntrega(subtotal);

  return { subtotal, descontoValor, total };
}

// ================= CARRINHO =================
window.addCarrinho = (nome, preco) => {
  const item = state.carrinho.find(i => i.nome === nome);

  if (item) item.qtd++;
  else state.carrinho.push({ nome, preco, qtd: 1 });

  salvarCarrinho();
  renderCarrinho();
};

window.mudarQtd = (i, tipo) => {
  const item = state.carrinho[i];
  if (!item) return;

  tipo === "mais" ? item.qtd++ : item.qtd--;

  if (item.qtd <= 0) state.carrinho.splice(i, 1);

  salvarCarrinho();
  renderCarrinho();
};

// ================= CUPOM =================
window.aplicarCupom = () => {
  const input = document.getElementById("cupom");
  const codigo = input.value.trim().toUpperCase();

  if (state.carrinho.length === 0) {
    return mostrarMensagem("Adicione itens antes do cupom", "erro");
  }

  if (!CUPONS[codigo]) {
    return mostrarMensagem("Cupom inválido", "erro");
  }

  const subtotal = calcularSubtotal();

  if (subtotal < CUPONS[codigo].minimo) {
    return mostrarMensagem("Valor mínimo não atingido", "erro");
  }

  if (state.cupom.aplicado) {
    return mostrarMensagem("Cupom já aplicado", "erro");
  }

  state.cupom = {
    codigo,
    desconto: CUPONS[codigo].desconto,
    aplicado: true
  };

  mostrarMensagem("Cupom aplicado!", "sucesso");
  renderCarrinho();
};

window.removerCupom = () => {
  state.cupom = { codigo: null, desconto: 0, aplicado: false };
  mostrarMensagem("Cupom removido", "sucesso");
  renderCarrinho();
};

// ================= FINALIZAR =================
window.finalizarPedido = () => {
  if (state.carrinho.length === 0) {
    return mostrarMensagem("Carrinho vazio", "erro");
  }

  if (!state.usuario) {
    return mostrarMensagem("Usuário não autenticado", "erro");
  }

  const resumo = calcularResumo();

  const pedido = {
    id: Date.now(),
    usuario: state.usuario.email,
    itens: [...state.carrinho],
    subtotal: resumo.subtotal,
    desconto: resumo.descontoValor,
    total: resumo.total,
    cupom: state.cupom.codigo,
    status: "pendente",
    data: new Date().toLocaleString()
  };

  salvarPedido(pedido);

  mostrarMensagem("Pedido finalizado!", "sucesso");

  state.carrinho = [];
  state.cupom = { codigo: null, desconto: 0, aplicado: false };

  document.getElementById("cupom").value = "";

  salvarCarrinho();
  renderAll();
};

// ================= FAVORITOS =================
window.toggleFavorito = (nome, preco) => {
  const existe = listarFavoritos().find(f => f.nome === nome);

  if (existe) {
    removerFavorito(nome);
    mostrarMensagem("Removido dos favoritos");
  } else {
    favoritarItem({ nome, preco });
    mostrarMensagem("Adicionado aos favoritos");
  }

  renderFavoritos();
};

// ================= RENDER =================
function renderCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  const totalEl = document.getElementById("total");

  lista.innerHTML = "";

  state.carrinho.forEach((item, i) => {
    const div = document.createElement("div");

    div.innerHTML = `
      ${item.nome} (x${item.qtd}) - R$ ${(item.preco * item.qtd).toFixed(2)}
      <button onclick="mudarQtd(${i}, 'mais')">+</button>
      <button onclick="mudarQtd(${i}, 'menos')">-</button>
    `;

    lista.appendChild(div);
  });

  const r = calcularResumo();

  totalEl.textContent = `Total: R$ ${r.total.toFixed(2)}`;
}

function renderFavoritos() {
  const c = document.getElementById("favoritos");
  if (!c) return;

  c.innerHTML = "";

  listarFavoritos().forEach(i => {
    c.innerHTML += `${i.nome} - R$ ${i.preco}`;
  });
}

function renderAll() {
  renderCarrinho();
  renderFavoritos();
}

// ================= UI =================
function mostrarMensagem(texto, tipo = "normal") {
  const msg = document.getElementById("mensagemSistema");
  if (!msg) return;

  msg.textContent = texto;

  msg.style.background =
    tipo === "erro" ? "#e74c3c" :
    tipo === "sucesso" ? "#2ecc71" :
    "#333";

  msg.style.display = "block";

  setTimeout(() => msg.style.display = "none", 3000);
}
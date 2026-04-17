import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let desconto = 0;

// LOGIN CHECK
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("userEmail").textContent = "Logado: " + user.email;
    renderCarrinho();
  } else {
    window.location.href = "index.html";
  }
});

// LOGOUT
document.getElementById("logout").addEventListener("click", async () => {
  await signOut(auth);
  localStorage.removeItem("carrinho");
  window.location.href = "index.html";
});

// ADICIONAR ITEM
window.addCarrinho = (nome, preco) => {
  const itemExistente = carrinho.find(i => i.nome === nome);

  if (itemExistente) {
    itemExistente.qtd += 1;
  } else {
    carrinho.push({ nome, preco, qtd: 1 });
  }

  salvar();
  renderCarrinho();
};

// ALTERAR QUANTIDADE
window.mudarQtd = (index, tipo) => {
  if (tipo === "mais") carrinho[index].qtd++;
  if (tipo === "menos") carrinho[index].qtd--;

  if (carrinho[index].qtd <= 0) {
    carrinho.splice(index, 1);
  }

  salvar();
  renderCarrinho();
};

// CUPOM
window.aplicarCupom = () => {
  const cupom = document.getElementById("cupom").value;

  if (cupom === "BEIJU10") {
    desconto = 0.1;
    alert("Cupom aplicado! 10% OFF");
  } else {
    desconto = 0;
    alert("Cupom inválido!");
  }

  renderCarrinho();
};

// RENDER
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

  totalEl.textContent = "Total: R$ " + total.toFixed(2);
}

// FINALIZAR
window.finalizarPedido = () => {
  if (carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }

  alert("Pedido enviado!");
  carrinho = [];
  desconto = 0;
  salvar();
  renderCarrinho();
};

// SALVAR
function salvar() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}
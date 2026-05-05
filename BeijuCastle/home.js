import { auth } from "./firebase.js";
import { salvarPedido, listarPedidosPorUsuario } from "./pedidos.js";
import { favoritarItem, listarFavoritos, removerFavorito, limparTodosFavoritos } from "./favoritos.js";
import { avaliarProduto, obterNotaMedia, obterAvaliacaoUsuario, removerAvaliacao } from "./avaliacoes.js";
import { buscarUsuario } from "./usuarios.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ================= ESTADO =================
const state = {
  carrinho: JSON.parse(localStorage.getItem("carrinho")) || [],
  usuario: null,
  cupom: { codigo: null, desconto: 0, aplicado: false, freteGratis: false },
  categoriaAtiva: "todos",
  termoBusca: "",
  freteTipo: "entrega"
};

const FRETE_PADRAO = 5.00;

// ================= PRODUTOS (8) =================
const PRODUTOS = [
  { nome: "Beijú Tradicional", preco: 5, categoria: "tradicional" },
  { nome: "Beijú Queijo", preco: 7, categoria: "recheado" },
  { nome: "Beijú Doce", preco: 8, categoria: "doce" },
  { nome: "Beijú Carne Seca", preco: 10, categoria: "recheado" },
  { nome: "Beijú Frango", preco: 9, categoria: "recheado" },
  { nome: "Beijú Chocolate", preco: 8, categoria: "doce" },
  { nome: "Beijú Nutella", preco: 12, categoria: "especial" },
  { nome: "Beijú Vegano", preco: 9, categoria: "especial" }
];

// ================= CUPONS =================
const CUPONS = {
  "BEIJU10": { desconto: 0.1, minimo: 20, tipo: "desconto" },
  "PROMO20": { desconto: 0.2, minimo: 40, tipo: "desconto" },
  "FRETEGRATIS": { desconto: 0, minimo: 30, tipo: "fretegratis" }
};

// ================= INIT =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    state.usuario = user;
    document.getElementById("userEmail").textContent = "Logado: " + user.email;

    import("./usuarios.js").then(mod => {
      const usuarioLocal = mod.buscarUsuario(user.email);
      if (usuarioLocal?.role === "admin") {
        const btn = document.getElementById("btnAdmin");
        if (btn) btn.style.display = "inline-block";
      }
    }).catch(() => {});

    renderCardapio();
    renderAll();
    carregarUltimosPedidos();
    configurarCategorias();
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

window.irPerfil = () => window.location.href = "perfil.html";
window.irAdmin = () => window.location.href = "admin.html";

// ================= CATEGORIAS =================
function configurarCategorias() {
  const botoes = document.querySelectorAll(".cat-btn");
  botoes.forEach(btn => {
    btn.addEventListener("click", () => {
      botoes.forEach(b => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      state.categoriaAtiva = btn.dataset.categoria;
      aplicarFiltros();
    });
  });
}

// ================= BUSCA E FILTROS =================
window.aplicarFiltros = () => {
  const termo = document.getElementById("busca").value.toLowerCase().trim();
  state.termoBusca = termo;
  renderCardapio();
};

function obterProdutosFiltrados() {
  return PRODUTOS.filter(prod => {
    const catOk = state.categoriaAtiva === "todos" || prod.categoria === state.categoriaAtiva;
    const nomeOk = prod.nome.toLowerCase().includes(state.termoBusca);
    return catOk && nomeOk;
  });
}

// ================= RENDER CARDÁPIO (COM AVALIAÇÕES) =================
function renderCardapio() {
  const container = document.getElementById("cardapioContainer");
  if (!container) return;

  const produtosFiltrados = obterProdutosFiltrados();
  container.innerHTML = "";

  if (produtosFiltrados.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>Nenhum produto encontrado.</p>";
    return;
  }

  produtosFiltrados.forEach(prod => {
    const media = obterNotaMedia(prod.nome);
    const minhaNota = state.usuario ? obterAvaliacaoUsuario(prod.nome, state.usuario.email) : 0;

    const div = document.createElement("div");
    div.className = "item";

    const estrelasHTML = gerarEstrelasInterativas(prod.nome, minhaNota);
    const mediaHTML = media > 0 ? ` Média: ${gerarEstrelasFixas(media)} (${media.toFixed(1)})` : " Sem avaliações";

    div.innerHTML = `
      <h2>${prod.nome}</h2>
      <span class="preco">R$ ${prod.preco.toFixed(2)}</span>
      <div class="avaliacao">
        <div class="sua-nota">Sua nota: ${estrelasHTML}</div>
        <div class="media-nota">${mediaHTML}</div>
      </div>
      <button class="btn-add" data-nome="${prod.nome}" data-preco="${prod.preco}">Adicionar</button>
      <button class="btn-fav" data-nome="${prod.nome}" data-preco="${prod.preco}">⭐</button>
    `;

    div.querySelector(".btn-add").addEventListener("click", () => {
      window.addCarrinho(prod.nome, prod.preco);
    });

    div.querySelector(".btn-fav").addEventListener("click", () => {
      window.toggleFavorito(prod.nome, prod.preco);
    });

    container.appendChild(div);
  });
}

function gerarEstrelasInterativas(produtoNome, notaAtual) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    const preenchida = i <= notaAtual ? "★" : "☆";
    html += `<span class="estrela-clicavel" data-produto="${produtoNome}" data-nota="${i}" style="cursor:pointer; font-size:1.2em;">${preenchida}</span>`;
  }
  return html;
}

function gerarEstrelasFixas(media) {
  const inteira = Math.floor(media);
  const resto = media - inteira;
  let estrelas = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= inteira) estrelas += "★";
    else if (i === inteira + 1 && resto >= 0.5) estrelas += "★";
    else estrelas += "☆";
  }
  return estrelas;
}

// ================= TRATAMENTO DE CLIQUE NA AVALIAÇÃO (REMOVER) =================
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("estrela-clicavel")) {
    const produto = e.target.dataset.produto;
    const nota = parseInt(e.target.dataset.nota);
    if (!state.usuario || !produto || isNaN(nota)) return;

    const notaAnterior = obterAvaliacaoUsuario(produto, state.usuario.email);
    if (nota === notaAnterior) {
      removerAvaliacao(produto, state.usuario.email);
    } else {
      avaliarProduto(produto, state.usuario.email, nota);
    }
    renderCardapio();
  }
});

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

window.limparCarrinho = () => {
  if (state.carrinho.length === 0) return;
  if (confirm("Deseja realmente limpar o carrinho?")) {
    state.carrinho = [];
    salvarCarrinho();
    renderCarrinho();
    mostrarMensagem("Carrinho limpo", "sucesso");
  }
};

// ================= FRETE =================
window.alternarFrete = (tipo) => {
  state.freteTipo = tipo;
  renderCarrinho();
};

function calcularFrete() {
  if (state.freteTipo === "retirada") return 0;
  if (state.cupom.freteGratis && calcularSubtotal() >= CUPONS["FRETEGRATIS"].minimo) return 0;
  return FRETE_PADRAO;
}

// ================= CUPOM =================
window.aplicarCupom = () => {
  const input = document.getElementById("cupom");
  const codigo = input.value.trim().toUpperCase();

  if (state.carrinho.length === 0) return mostrarMensagem("Adicione itens antes do cupom", "erro");
  if (!CUPONS[codigo]) return mostrarMensagem("Cupom inválido", "erro");

  const subtotal = calcularSubtotal();
  if (subtotal < CUPONS[codigo].minimo) {
    return mostrarMensagem(`Valor mínimo para este cupom: R$ ${CUPONS[codigo].minimo.toFixed(2)}`, "erro");
  }

  if (state.cupom.aplicado) return mostrarMensagem("Já existe um cupom aplicado. Remova-o primeiro.", "erro");

  const cupomInfo = CUPONS[codigo];
  state.cupom = {
    codigo,
    desconto: cupomInfo.tipo === "desconto" ? cupomInfo.desconto : 0,
    aplicado: true,
    freteGratis: cupomInfo.tipo === "fretegratis"
  };

  mostrarMensagem("Cupom aplicado!", "sucesso");
  renderCarrinho();
};

window.removerCupom = () => {
  state.cupom = { codigo: null, desconto: 0, aplicado: false, freteGratis: false };
  mostrarMensagem("Cupom removido", "sucesso");
  renderCarrinho();
};

// ================= FINALIZAR PEDIDO (COM NOME E ENDEREÇO ATUAIS) =================
window.finalizarPedido = () => {
  if (state.carrinho.length === 0) return mostrarMensagem("Carrinho vazio", "erro");
  if (!state.usuario) return mostrarMensagem("Usuário não autenticado", "erro");

  if (!confirm("Deseja realmente finalizar o pedido?")) return;

  const resumo = calcularResumo();

  // 🔍 Busca sempre os dados mais recentes do perfil (resolve ID 61)
  const dadosUsuario = buscarUsuario(state.usuario.email);
  const nomeCliente = dadosUsuario?.nome || "Não informado";
  const enderecoCliente = dadosUsuario?.endereco || "Não informado";

  const pedido = {
    id: Date.now(),
    usuario: state.usuario.email,
    nomeCliente: nomeCliente,               // ✅ Adicionado (ID 28)
    itens: [...state.carrinho],
    subtotal: resumo.subtotal,
    desconto: resumo.descontoValor,
    frete: resumo.frete,
    total: resumo.total,
    cupom: state.cupom.codigo,
    tipoFrete: state.freteTipo,
    endereco: enderecoCliente,             // ✅ Endereço mais recente
    status: "pendente",
    data: new Date().toLocaleString()
  };

  salvarPedido(pedido);
  mostrarMensagem("Pedido finalizado com sucesso!", "sucesso");

  state.carrinho = [];
  state.cupom = { codigo: null, desconto: 0, aplicado: false, freteGratis: false };
  state.freteTipo = "entrega";
  document.getElementById("cupom").value = "";
  salvarCarrinho();
  renderAll();
  carregarUltimosPedidos();
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
  renderCardapio();
};

window.limparTodos = () => {
  if (confirm("Deseja realmente limpar todos os favoritos?")) {
    limparTodosFavoritos();
    renderFavoritos();
    mostrarMensagem("Favoritos limpos", "sucesso");
  }
};

// ================= RENDER =================
function renderCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  const totalEl = document.getElementById("total");
  if (!lista || !totalEl) return;

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
  let resumoHTML = `Subtotal: R$ ${r.subtotal.toFixed(2)}<br>`;
  if (state.cupom.aplicado && state.cupom.desconto > 0) {
    resumoHTML += `Desconto (${state.cupom.codigo}): -R$ ${r.descontoValor.toFixed(2)}<br>`;
  }
  resumoHTML += `Frete: R$ ${r.frete.toFixed(2)}`;
  if (state.cupom.freteGratis && r.frete === 0 && state.freteTipo === "entrega") {
    resumoHTML += ` (Frete Grátis!)`;
  }
  resumoHTML += `<br><strong>Total: R$ ${r.total.toFixed(2)}</strong>`;

  totalEl.innerHTML = resumoHTML;
}

function renderFavoritos() {
  const c = document.getElementById("favoritos");
  if (!c) return;
  c.innerHTML = "";
  listarFavoritos().forEach(i => {
    c.innerHTML += `<div>${i.nome} - R$ ${i.preco.toFixed(2)}</div>`;
  });
}

function renderAll() {
  renderCarrinho();
  renderFavoritos();
}

function carregarUltimosPedidos() {}

// ================= HELPERS =================
function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(state.carrinho));
}

function calcularSubtotal() {
  return state.carrinho.reduce((t, i) => t + i.preco * i.qtd, 0);
}

function calcularResumo() {
  const subtotal = calcularSubtotal();
  const descontoValor = subtotal * state.cupom.desconto;
  const frete = calcularFrete();
  const total = subtotal - descontoValor + frete;
  return { subtotal, descontoValor, frete, total };
}

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
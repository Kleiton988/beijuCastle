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
  freteTipo: "entrega",
  historicoBuscas: JSON.parse(localStorage.getItem("historicoBuscas")) || []
};

const FRETE_PADRAO = 5.00;

// ================= PRODUTOS (com descrição e imagem) =================
const PRODUTOS = [
  { nome: "Beijú Tradicional", preco: 5, categoria: "tradicional", img: "img/tradicional.jpg", desc: "Massa fina, recheio de coco e queijo coalho." },
  { nome: "Beijú Queijo", preco: 7, categoria: "recheado", img: "img/queijo.jpg", desc: "Queijo mussarela derretido na massa de tapioca." },
  { nome: "Beijú Doce", preco: 8, categoria: "doce", img: "img/doce.jpg", desc: "Goiabada cremosa com coco ralado." },
  { nome: "Beijú Carne Seca", preco: 10, categoria: "recheado", img: "img/carneseca.jpg", desc: "Carne seca desfiada com cebola roxa." },
  { nome: "Beijú Frango", preco: 9, categoria: "recheado", img: "img/frango.jpg", desc: "Frango desfiado temperado com catupiry." },
  { nome: "Beijú Chocolate", preco: 8, categoria: "doce", img: "img/chocolate.jpg", desc: "Chocolate ao leite com morangos." },
  { nome: "Beijú Nutella", preco: 12, categoria: "especial", img: "img/nutella.jpg", desc: "Nutella pura com banana fatiada." },
  { nome: "Beijú Vegano", preco: 9, categoria: "especial", img: "img/vegano.jpg", desc: "Tapioca com pasta de amendoim e frutas." }
];

// ================= CUPONS =================
const CUPONS = {
  "BEIJU10": { desconto: 0.1, minimo: 20, tipo: "desconto" },
  "PROMO20": { desconto: 0.2, minimo: 40, tipo: "desconto" },
  "FRETEGRATIS": { desconto: 0, minimo: 30, tipo: "fretegratis" }
};

// ================= INICIALIZAÇÃO =================
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
    atualizarContadorCarrinho();
    exibirHistoricoBuscas();
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

// ================= BUSCA (com histórico e sugestões) =================
const buscaInput = document.getElementById("busca");
window.aplicarFiltros = () => {
  const termo = buscaInput.value.toLowerCase().trim();
  state.termoBusca = termo;
  renderCardapio();
  if (termo) {
    salvarHistoricoBusca(termo);
  }
};

function salvarHistoricoBusca(termo) {
  if (!state.historicoBuscas.includes(termo)) {
    state.historicoBuscas.unshift(termo);
    if (state.historicoBuscas.length > 10) state.historicoBuscas.pop();
    localStorage.setItem("historicoBuscas", JSON.stringify(state.historicoBuscas));
  }
}

function exibirHistoricoBuscas() {
  // não precisa exibir, só armazenamos para futura referência
}

// Sugestões automáticas (dropdown)
buscaInput.addEventListener("input", () => {
  const termo = buscaInput.value.toLowerCase().trim();
  const sugestoesDiv = document.getElementById("sugestoesBusca");
  if (!sugestoesDiv) return;
  if (termo.length < 2) {
    sugestoesDiv.innerHTML = "";
    sugestoesDiv.style.display = "none";
    return;
  }
  const sugestoes = PRODUTOS.filter(p => p.nome.toLowerCase().includes(termo)).slice(0, 5);
  if (sugestoes.length === 0) {
    sugestoesDiv.innerHTML = "";
    sugestoesDiv.style.display = "none";
  } else {
    sugestoesDiv.innerHTML = sugestoes.map(p => `<div class="sugestao" data-nome="${p.nome}">${p.nome}</div>`).join("");
    sugestoesDiv.style.display = "block";
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("sugestao")) {
    buscaInput.value = e.target.dataset.nome;
    document.getElementById("sugestoesBusca").style.display = "none";
    aplicarFiltros();
  }
});

// ================= RENDER CARDÁPIO (com imagens, descrição, destaque) =================
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

    const nomeDestacado = state.termoBusca
      ? prod.nome.replace(new RegExp(`(${state.termoBusca})`, 'gi'), '<span class="destaque">$1</span>')
      : prod.nome;

    div.innerHTML = `
      <img src="${prod.img}" alt="${prod.nome}" class="produto-img" onerror="this.src='img/back.jpg'">
      <h2>${nomeDestacado}</h2>
      <p class="descricao">${prod.desc}</p>
      <span class="preco">R$ ${prod.preco.toFixed(2)}</span>
      <div class="avaliacao">
        <div class="sua-nota">Sua nota: ${gerarEstrelasInterativas(prod.nome, minhaNota)}</div>
        <div class="media-nota">${media > 0 ? `Média: ${gerarEstrelasFixas(media)} (${media.toFixed(1)})` : "Sem avaliações"}</div>
      </div>
      <button class="btn-add" data-nome="${prod.nome}" data-preco="${prod.preco}">Adicionar</button>
      <button class="btn-fav" data-nome="${prod.nome}" data-preco="${prod.preco}">⭐</button>
    `;

    div.querySelector(".btn-add").addEventListener("click", () => window.addCarrinho(prod.nome, prod.preco));
    div.querySelector(".btn-fav").addEventListener("click", () => window.toggleFavorito(prod.nome, prod.preco));

    container.appendChild(div);
  });
}

function obterProdutosFiltrados() {
  return PRODUTOS.filter(prod => {
    const catOk = state.categoriaAtiva === "todos" || prod.categoria === state.categoriaAtiva;
    const nomeOk = prod.nome.toLowerCase().includes(state.termoBusca);
    return catOk && nomeOk;
  });
}

// ================= ESTRELAS (mantido) =================
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

// ================= CARRINHO (com contador) =================
window.addCarrinho = (nome, preco) => {
  const item = state.carrinho.find(i => i.nome === nome);
  if (item) item.qtd++;
  else state.carrinho.push({ nome, preco, qtd: 1 });
  salvarCarrinho();
  renderCarrinho();
  atualizarContadorCarrinho();
};

window.mudarQtd = (i, tipo) => {
  const item = state.carrinho[i];
  if (!item) return;
  tipo === "mais" ? item.qtd++ : item.qtd--;
  if (item.qtd <= 0) state.carrinho.splice(i, 1);
  salvarCarrinho();
  renderCarrinho();
  atualizarContadorCarrinho();
};

window.limparCarrinho = () => {
  if (state.carrinho.length === 0) return;
  if (confirm("Deseja realmente limpar o carrinho?")) {
    state.carrinho = [];
    salvarCarrinho();
    renderCarrinho();
    atualizarContadorCarrinho();
    mostrarMensagem("Carrinho limpo", "sucesso");
  }
};

function atualizarContadorCarrinho() {
  const totalItens = state.carrinho.reduce((t, i) => t + i.qtd, 0);
  const badge = document.getElementById("contadorCarrinho");
  if (badge) badge.textContent = totalItens;
}

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

// ================= CUPOM (com mensagem ao remover sem cupom) =================
window.aplicarCupom = () => {
  const input = document.getElementById("cupom");
  const codigo = input.value.trim().toUpperCase();

  if (state.carrinho.length === 0) return mostrarMensagem("Adicione itens antes do cupom", "erro");
  if (!CUPONS[codigo]) return mostrarMensagem("Cupom inválido", "erro");
  if (state.cupom.aplicado) return mostrarMensagem("Já existe um cupom aplicado. Remova-o primeiro.", "erro");

  const subtotal = calcularSubtotal();
  if (subtotal < CUPONS[codigo].minimo) {
    return mostrarMensagem(`Valor mínimo para este cupom: R$ ${CUPONS[codigo].minimo.toFixed(2)}`, "erro");
  }

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
  if (!state.cupom.aplicado) {
    mostrarMensagem("Nenhum cupom aplicado para remover.", "erro");
    return;
  }
  state.cupom = { codigo: null, desconto: 0, aplicado: false, freteGratis: false };
  mostrarMensagem("Cupom removido", "sucesso");
  renderCarrinho();
};

// ================= FINALIZAR (validação de dados) =================
window.finalizarPedido = () => {
  if (state.carrinho.length === 0) return mostrarMensagem("Carrinho vazio", "erro");
  if (!state.usuario) return mostrarMensagem("Usuário não autenticado", "erro");

  const dadosUsuario = buscarUsuario(state.usuario.email);
  if (!dadosUsuario?.endereco || !dadosUsuario?.nome) {
    mostrarMensagem("Complete seu perfil (nome e endereço) antes de finalizar o pedido.", "erro");
    return;
  }

  if (!confirm("Deseja realmente finalizar o pedido?")) return;

  const resumo = calcularResumo();
  const pedido = {
    id: Date.now(),
    usuario: state.usuario.email,
    nomeCliente: dadosUsuario.nome,
    itens: [...state.carrinho],
    subtotal: resumo.subtotal,
    desconto: resumo.descontoValor,
    frete: resumo.frete,
    total: resumo.total,
    cupom: state.cupom.codigo,
    tipoFrete: state.freteTipo,
    endereco: dadosUsuario.endereco,
    status: "pendente",
    data: new Date().toLocaleString()
  };

  salvarPedido(pedido);
  abrirModalPagamento(pedido);
};

// ================= MODAL DE PAGAMENTO (simples) =================
function abrirModalPagamento(pedido) {
  const modal = document.getElementById("modalPagamento");
  if (!modal) return;
  document.getElementById("modalTotal").textContent = `Total: R$ ${pedido.total.toFixed(2)}`;
  modal.style.display = "flex";

  window.confirmarPagamento = (forma) => {
    pedido.formaPagamento = forma;
    pedido.status = "pago";
    salvarPedido(pedido); // atualiza status
    modal.style.display = "none";
    mostrarMensagem(`Pedido finalizado! Pagamento via ${forma}.`, "sucesso");

    state.carrinho = [];
    state.cupom = { codigo: null, desconto: 0, aplicado: false, freteGratis: false };
    state.freteTipo = "entrega";
    document.getElementById("cupom").value = "";
    salvarCarrinho();
    renderAll();
    atualizarContadorCarrinho();
  };

  window.cancelarPagamento = () => {
    modal.style.display = "none";
    mostrarMensagem("Pagamento cancelado. Pedido continua pendente.", "erro");
  };
}

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
  let html = `Subtotal: R$ ${r.subtotal.toFixed(2)}<br>`;
  if (state.cupom.aplicado && state.cupom.desconto > 0) html += `Desconto: -R$ ${r.descontoValor.toFixed(2)}<br>`;
  html += `Frete: R$ ${r.frete.toFixed(2)}<br><strong>Total: R$ ${r.total.toFixed(2)}</strong>`;
  totalEl.innerHTML = html;
}

function renderFavoritos() {
  const c = document.getElementById("favoritos");
  if (!c) return;
  c.innerHTML = listarFavoritos().map(i => `<div>${i.nome} - R$ ${i.preco.toFixed(2)}</div>`).join("");
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
  msg.style.background = tipo === "erro" ? "#e74c3c" : tipo === "sucesso" ? "#2ecc71" : "#333";
  msg.style.display = "block";
  setTimeout(() => msg.style.display = "none", 3000);
}
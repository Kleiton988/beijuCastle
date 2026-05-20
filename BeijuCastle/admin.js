import { listarPedidos, atualizarStatusPedido } from "./pedidos.js";
import { getUsuarioAtual } from "./usuarios.js";

const usuario = getUsuarioAtual();
if (!usuario || usuario.role !== "admin") {
  alert("Acesso negado!");
  window.location.href = "home.html";
}

let filtroAtual = "ativos"; // padrão
let intervaloAutoRefresh = null;

function calcularAtivos(pedidos) {
  return pedidos.filter(p => p.status === "pendente" || p.status === "preparando" || p.status === "pronto").length;
}

function renderPedidos() {
  const container = document.getElementById("listaPedidos");
  if (!container) return;

  let pedidos = listarPedidos();

  // Ordena por id decrescente (mais recentes primeiro)
  pedidos.sort((a, b) => b.id - a.id);

  // Aplica filtro
  if (filtroAtual === "ativos") {
    pedidos = pedidos.filter(p => p.status !== "cancelado");
  } else if (filtroAtual === "cancelados") {
    pedidos = pedidos.filter(p => p.status === "cancelado");
  }

  const totalAtivos = calcularAtivos(listarPedidos());
  document.getElementById("contadorAtivos").textContent = `Pedidos ativos: ${totalAtivos}`;

  container.innerHTML = "";
  if (pedidos.length === 0) {
    container.innerHTML = "<p>Nenhum pedido encontrado.</p>";
    return;
  }

  pedidos.forEach(p => {
    const div = document.createElement("div");
    div.className = `pedido status-${p.status}`;

    let itensHtml = p.itens.map(i => `${i.nome} x${i.qtd}`).join(", ");
    const qtdTotal = p.itens.reduce((acc, i) => acc + i.qtd, 0);

    const podeAlterar = p.status === "pendente" || p.status === "preparando";

    div.innerHTML = `
      <p><strong>ID:</strong> ${p.id}</p>
      <p><strong>Cliente:</strong> ${p.nomeCliente || p.usuario}</p>
      <p><strong>Telefone:</strong> ${p.telefone || "Não informado"}</p>
      <p><strong>Itens (${qtdTotal}):</strong> ${itensHtml}</p>
      <p><strong>Total:</strong> R$ ${p.total.toFixed(2)}</p>
      <p><strong>Status:</strong> <span class="badge-status">${p.status}</span></p>
      <p><strong>Pagamento:</strong> ${p.pagamento || "Não informado"}</p>
      ${podeAlterar ? `
        <button onclick="mudarStatus(${p.id}, 'preparando')" ${p.status === 'preparando' ? 'disabled' : ''}>Preparando</button>
        <button onclick="mudarStatus(${p.id}, 'pronto')">Pronto</button>
      ` : ''}
      ${p.status === 'pronto' ? '<button onclick="mudarStatus('+p.id+', \'entregue\')">Entregue</button>' : ''}
    `;
    container.appendChild(div);
  });
}

window.mudarStatus = (id, novoStatus) => {
  if (!confirm(`Deseja alterar o pedido #${id} para "${novoStatus}"?`)) return;

  atualizarStatusPedido(id, novoStatus);
  renderPedidos();
  mostrarMensagemAdmin(`Pedido #${id} atualizado para "${novoStatus}".`);
};

window.filtrarPedidos = (tipo) => {
  filtroAtual = tipo;
  renderPedidos();
};

window.voltar = () => {
  window.location.href = "home.html";
};

function mostrarMensagemAdmin(texto) {
  const msg = document.getElementById("mensagemAdmin");
  if (!msg) return;
  msg.textContent = texto;
  msg.style.display = "block";
  setTimeout(() => { msg.style.display = "none"; }, 3000);
}

// Inicia com filtro ativo e auto-refresh
document.addEventListener("DOMContentLoaded", () => {
  renderPedidos();
  intervaloAutoRefresh = setInterval(renderPedidos, 10000); // atualiza a cada 10s
});

// Limpa intervalo ao sair da página (opcional)
window.addEventListener("beforeunload", () => {
  if (intervaloAutoRefresh) clearInterval(intervaloAutoRefresh);
});
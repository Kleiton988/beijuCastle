const KEY = "favoritos";

// ================= STORAGE =================
function getFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function salvarFavoritos(lista) {
  localStorage.setItem(KEY, JSON.stringify(lista));
}

// ================= ADICIONAR =================
export function favoritarItem(item) {
  if (!item || !item.nome) return;

  const favoritos = getFavoritos();

  const existe = favoritos.find(f => f.nome === item.nome);

  if (!existe) {
    favoritos.push(item);
    salvarFavoritos(favoritos);
  }
}

// ================= REMOVER =================
export function removerFavorito(nome) {
  let favoritos = getFavoritos();

  favoritos = favoritos.filter(f => f.nome !== nome);

  salvarFavoritos(favoritos);
}

// ================= LISTAR =================
export function listarFavoritos() {
  return getFavoritos();
}

// ================= TOGGLE =================
export function toggleFavorito(item) {
  const favoritos = getFavoritos();

  const existe = favoritos.find(f => f.nome === item.nome);

  if (existe) {
    removerFavorito(item.nome);
    return false;
  } else {
    favoritarItem(item);
    return true;
  }
}

// ================= UI =================
function renderFavoritos() {
  const container = document.getElementById("listaFavoritos");
  const vazioMsg = document.getElementById("vazioMsg");

  if (!container) return;

  const favoritos = getFavoritos();

  container.innerHTML = "";

  if (favoritos.length === 0) {
    vazioMsg.style.display = "block";
    return;
  }

  vazioMsg.style.display = "none";

  favoritos.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <span>${item.nome} - R$ ${item.preco}</span>
      <div>
        <button onclick="comprar('${item.nome}', ${item.preco})">🛒</button>
        <button onclick="remover('${item.nome}')">❌</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// ================= AÇÕES =================
window.remover = (nome) => {
  removerFavorito(nome);
  renderFavoritos();
};

window.comprar = (nome, preco) => {
  if (window.addCarrinho) {
    window.addCarrinho(nome, preco);
    alert("Adicionado ao carrinho!");
  } else {
    alert("Carrinho não disponível aqui.");
  }
};

window.voltarHome = () => {
  window.location.href = "home.html";
};

// ================= INIT =================
document.addEventListener("DOMContentLoaded", renderFavoritos);
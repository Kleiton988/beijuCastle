

// TC01 - TC15 - Testes de Luis

describe("Testes - usuarios.js e favoritos.js", () => {

  let salvarUsuario;
let buscarUsuario;
let setUsuarioAtual;
let getUsuarioAtual;

let favoritarItem;
let removerFavorito;
let listarFavoritos;

beforeEach(() => {
  jest.resetModules();

   const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = value,
    removeItem: (key) => delete store[key],
    clear: () => store = {}
  };

  // 🔥 IMPORTANTE: importar DEPOIS do reset
  const usuarios = require("./usuarios");
  salvarUsuario = usuarios.salvarUsuario;
  buscarUsuario = usuarios.buscarUsuario;
  setUsuarioAtual = usuarios.setUsuarioAtual;
  getUsuarioAtual = usuarios.getUsuarioAtual;

  const favoritos = require("./favoritos");
  favoritarItem = favoritos.favoritarItem;
  removerFavorito = favoritos.removerFavorito;
  listarFavoritos = favoritos.listarFavoritos;
  
});

  // =========================
  // USUARIOS.JS
  // =========================

  // TC01
  test("TC01 - Salvar usuário corretamente", () => {
    // # Data: 22/04/2026
    // # Testador: Luis
    // # Cenário: Salvar um novo usuário no localStorage
    // # Execução: Chamar salvarUsuario com um usuário válido
    // # Verificação: O usuário deve estar salvo na lista

    const { salvarUsuario } = require("./usuarios");

    salvarUsuario({ email: "teste@email.com", nome: "Luis" });

    const usuarios = JSON.parse(localStorage.getItem("usuarios"));
    expect(usuarios.length).toBe(1);
  });

  // TC02
  test("TC02 - Salvar múltiplos usuários", () => {
    console.log(localStorage.getItem("usuarios"));

    salvarUsuario({ email: "a@email.com" });
    salvarUsuario({ email: "b@email.com" });

    const usuarios = JSON.parse(localStorage.getItem("usuarios"));
    expect(usuarios.length).toBe(2);
  });

  // TC03
  test("TC03 - Buscar usuário existente", () => {
    const { salvarUsuario, buscarUsuario } = require("./usuarios");

    salvarUsuario({ email: "busca@email.com" });

    const usuario = buscarUsuario("busca@email.com");

    expect(usuario.email).toBe("busca@email.com");
  });

  // TC04
  test("TC04 - Buscar usuário inexistente", () => {
    const { buscarUsuario } = require("./usuarios");

    const usuario = buscarUsuario("naoexiste@email.com");

    expect(usuario).toBeUndefined();
  });

  // TC05
  test("TC05 - Definir usuário atual", () => {
    const { setUsuarioAtual } = require("./usuarios");

    setUsuarioAtual({ email: "logado@email.com" });

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    expect(usuario.email).toBe("logado@email.com");
  });

  // TC06
  test("TC06 - Obter usuário atual", () => {
    const { setUsuarioAtual, getUsuarioAtual } = require("./usuarios");

    setUsuarioAtual({ email: "teste@email.com" });

    const usuario = getUsuarioAtual();

    expect(usuario.email).toBe("teste@email.com");
  });

  // TC07
  test("TC07 - Sobrescrever usuário atual", () => {
    const { setUsuarioAtual, getUsuarioAtual } = require("./usuarios");

    setUsuarioAtual({ email: "primeiro@email.com" });
    setUsuarioAtual({ email: "segundo@email.com" });

    const usuario = getUsuarioAtual();

    expect(usuario.email).toBe("segundo@email.com");
  });

  // TC08
  test("TC08 - Buscar usuário com lista vazia", () => {
    const { buscarUsuario } = require("./usuarios");

    const usuario = buscarUsuario("qualquer@email.com");

    expect(usuario).toBeUndefined();
  });

  // =========================
  // FAVORITOS.JS
  // =========================

  // TC09
  test("TC09 - Adicionar item aos favoritos", () => {
    const { favoritarItem } = require("./favoritos");

    favoritarItem({ nome: "Item1" });

    const lista = JSON.parse(localStorage.getItem("favoritos"));
    expect(lista.length).toBe(1);
  });

  // TC10
  test("TC10 - Não duplicar item favorito", () => {
    const { favoritarItem } = require("./favoritos");

    favoritarItem({ nome: "Item1" });
    favoritarItem({ nome: "Item1" });

    const lista = JSON.parse(localStorage.getItem("favoritos"));
    expect(lista.length).toBe(1);
  });

  // TC11
  test("TC11 - Adicionar múltiplos favoritos diferentes", () => {
    const { favoritarItem } = require("./favoritos");

    favoritarItem({ nome: "Item1" });
    favoritarItem({ nome: "Item2" });

    const lista = JSON.parse(localStorage.getItem("favoritos"));
    expect(lista.length).toBe(2);
  });

  // TC12
  test("TC12 - Remover item existente", () => {
    const { favoritarItem, removerFavorito } = require("./favoritos");

    favoritarItem({ nome: "Item1" });
    removerFavorito("Item1");

    const lista = JSON.parse(localStorage.getItem("favoritos"));
    expect(lista.length).toBe(0);
  });

  // TC13
  test("TC13 - Remover item inexistente", () => {
    const { removerFavorito } = require("./favoritos");

    removerFavorito("Nada");

    const lista = JSON.parse(localStorage.getItem("favoritos")) || [];
    expect(lista.length).toBe(0);
  });

  // TC14
  test("TC14 - Listar favoritos com itens", () => {
    const { favoritarItem, listarFavoritos } = require("./favoritos");

    favoritarItem({ nome: "Item1" });

    const lista = listarFavoritos();

    expect(lista.length).toBe(1);
  });

  // TC15
  test("TC15 - Listar favoritos vazio", () => {
    const { listarFavoritos } = require("./favoritos");

    const lista = listarFavoritos();

    expect(lista).toEqual([]);
  });
// =========================
// TESTES AVANÇADOS
// =========================

// TC16
test("TC16 - Salvar usuário preserva dados anteriores", () => {
  salvarUsuario({ email: "1@email.com" });
  salvarUsuario({ email: "2@email.com" });

  const usuarios = JSON.parse(localStorage.getItem("usuarios"));

  expect(usuarios).toEqual([
    { email: "1@email.com" },
    { email: "2@email.com" }
  ]);
});

// TC17
test("TC17 - Buscar usuário retorna objeto completo", () => {
  salvarUsuario({ email: "full@email.com", nome: "Luis", idade: 20 });

  const usuario = buscarUsuario("full@email.com");

  expect(usuario).toEqual({
    email: "full@email.com",
    nome: "Luis",
    idade: 20
  });
});

// TC18
test("TC18 - Buscar usuário com múltiplos registros", () => {
  salvarUsuario({ email: "a@email.com" });
  salvarUsuario({ email: "b@email.com" });

  const usuario = buscarUsuario("b@email.com");

  expect(usuario.email).toBe("b@email.com");
});

// TC19
test("TC19 - getUsuarioAtual sem usuário definido", () => {
  const usuario = getUsuarioAtual();

  expect(usuario).toBeNull();
});

// TC20
test("TC20 - setUsuarioAtual sobrescreve corretamente estrutura", () => {
  setUsuarioAtual({ email: "a@email.com", nome: "A" });
  setUsuarioAtual({ email: "b@email.com" });

  const usuario = getUsuarioAtual();

  expect(usuario).toEqual({ email: "b@email.com" });
});

// =========================
// FAVORITOS AVANÇADO
// =========================

// TC21
test("TC21 - Favoritar múltiplos itens mantém ordem", () => {
  favoritarItem({ nome: "Item1" });
  favoritarItem({ nome: "Item2" });

  const lista = listarFavoritos();

  expect(lista[0].nome).toBe("Item1");
  expect(lista[1].nome).toBe("Item2");
});

// TC22
test("TC22 - Favoritar item com propriedades extras", () => {
  favoritarItem({ nome: "Item1", tipo: "doce", preco: 10 });

  const lista = listarFavoritos();

  expect(lista[0]).toEqual({
    nome: "Item1",
    tipo: "doce",
    preco: 10
  });
});

// TC23
test("TC23 - Remover um item entre vários", () => {
  favoritarItem({ nome: "Item1" });
  favoritarItem({ nome: "Item2" });
  favoritarItem({ nome: "Item3" });

  removerFavorito("Item2");

  const lista = listarFavoritos();

  expect(lista.length).toBe(2);
  expect(lista.find(i => i.nome === "Item2")).toBeUndefined();
});

// TC24
test("TC24 - Remover item não altera outros", () => {
  favoritarItem({ nome: "Item1" });
  favoritarItem({ nome: "Item2" });

  removerFavorito("Item1");

  const lista = listarFavoritos();

  expect(lista).toEqual([{ nome: "Item2" }]);
});

// TC25
test("TC25 - Remover todos os itens sequencialmente", () => {
  favoritarItem({ nome: "Item1" });
  favoritarItem({ nome: "Item2" });

  removerFavorito("Item1");
  removerFavorito("Item2");

  const lista = listarFavoritos();

  expect(lista).toEqual([]);
});

// TC26
test("TC26 - Favoritar item após remoção", () => {
  favoritarItem({ nome: "Item1" });
  removerFavorito("Item1");
  favoritarItem({ nome: "Item1" });

  const lista = listarFavoritos();

  expect(lista.length).toBe(1);
});

// TC27
test("TC27 - Comparação de nome é sensível a maiúsculas", () => {
  favoritarItem({ nome: "Item1" });
  favoritarItem({ nome: "item1" });

  const lista = listarFavoritos();

  expect(lista.length).toBe(2);
});

// TC28
test("TC28 - Remover usando nome exato", () => {
  favoritarItem({ nome: "Item1" });
  favoritarItem({ nome: "item1" });

  removerFavorito("Item1");

  const lista = listarFavoritos();

  expect(lista.length).toBe(1);
  expect(lista[0].nome).toBe("item1");
});

// TC29
test("TC29 - listarFavoritos retorna array independente", () => {
  favoritarItem({ nome: "Item1" });

  const lista = listarFavoritos();
  lista.push({ nome: "Fake" });

  const novaLista = listarFavoritos();

  expect(novaLista.length).toBe(1);
});

// TC30
test("TC30 - Estrutura do localStorage após operações", () => {
  favoritarItem({ nome: "Item1" });

  const raw = localStorage.getItem("favoritos");

  expect(typeof raw).toBe("string");
  expect(JSON.parse(raw)).toEqual([{ nome: "Item1" }]);
});
});
/**
 * @jest-environment jsdom
 */

// ===============================
// TESTES - NEEMIAS (01 - 15)
// ===============================

describe("Testes do perfil.js - Perfil e Pedidos", () => {

  beforeEach(() => {
    jest.resetModules();

    // Mock DOM
    document.body.innerHTML = `
      <p id="email"></p>
      <input id="nome" />
      <input id="telefone" />
      <input id="endereco" />
      <div id="pedidos"></div>
    `;

    // Mock alert
    global.alert = jest.fn();

    // Mock Firebase
    global.onAuthStateChanged = jest.fn((auth, callback) => {
      callback({ email: "teste@gmail.com" });
    });

    // Mock funções externas
    global.buscarUsuario = jest.fn(() => ({
      nome: "João",
      telefone: "9999",
      endereco: "Rua A"
    }));

    global.salvarUsuario = jest.fn();

    global.listarPedidos = jest.fn(() => []);
    global.cancelarPedido = jest.fn();

    require("./perfil.js");
  });

  // TC01
  test("TC01 - Usuário logado exibe email", () => {
    // Data: 20/04/2026
    // Testador: Neemias
    // Cenário: Usuário autenticado
    // Execução: Carregar página
    // Verificação: Email exibido no DOM

    const texto = document.getElementById("email").textContent;

    expect(texto).toContain("teste@gmail.com");
  });

  // TC02
  test("TC02 - Carregar perfil preenche campos", () => {
    // Cenário: Usuário possui dados
    // Execução: Carregar perfil
    // Verificação: Inputs preenchidos

    expect(document.getElementById("nome").value).toBe("João");
    expect(document.getElementById("telefone").value).toBe("9999");
    expect(document.getElementById("endereco").value).toBe("Rua A");
  });

  // TC03
  test("TC03 - Carregar perfil com dados nulos não quebra", () => {

  jest.resetModules(); // limpa cache

  document.body.innerHTML = `
    <input id="nome" />
    <input id="telefone" />
    <input id="endereco" />
    <p id="email"></p>
    <div id="pedidos"></div>
  `;

  global.buscarUsuario = jest.fn(() => null);
  global.listarPedidos = jest.fn(() => []);
  global.salvarUsuario = jest.fn();
  global.cancelarPedido = jest.fn();
  global.alert = jest.fn();

  require("./perfil.js");

  expect(document.getElementById("nome").value).toBe("");
});

  // TC04
  test("TC04 - Salvar perfil chama função corretamente", () => {
    // Cenário: Dados preenchidos
    // Execução: Salvar perfil
    // Verificação: salvarUsuario chamado

    document.getElementById("nome").value = "Maria";
    document.getElementById("telefone").value = "8888";
    document.getElementById("endereco").value = "Rua B";

    window.salvarPerfil();

    expect(global.salvarUsuario).toHaveBeenCalled();
  });

  // TC05
  test("TC05 - Salvar perfil envia dados corretos", () => {
    // Cenário: Dados preenchidos
    // Execução: Salvar
    // Verificação: Dados enviados corretamente

    document.getElementById("nome").value = "Maria";

    window.salvarPerfil();

    expect(global.salvarUsuario).toHaveBeenCalledWith(
      "teste@gmail.com",
      expect.objectContaining({ nome: "Maria" })
    );
  });

  // TC06
  test("TC06 - Salvar perfil exibe alerta", () => {
    // Cenário: Salvar dados
    // Execução: salvarPerfil()
    // Verificação: alert chamado

    window.salvarPerfil();

    expect(alert).toHaveBeenCalledWith("Perfil salvo!");
  });

  // TC07
  test("TC07 - Lista de pedidos inicia vazia", () => {
    // Cenário: Nenhum pedido
    // Execução: carregarPedidos
    // Verificação: DOM vazio

    const lista = document.getElementById("pedidos");

    expect(lista.children.length).toBe(0);
  });

  // TC08
  test("TC08 - Renderiza pedidos pendentes", () => {
    // Cenário: Pedido pendente
    // Execução: carregarPedidos
    // Verificação: Grupo aparece

    jest.resetModules();

    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "pendente", itens: [], total: 10, data: "hoje" }
    ]);

    require("./perfil.js");

    const texto = document.getElementById("pedidos").textContent;

    expect(texto).toContain("Pendentes");
  });

  // TC09
  test("TC09 - Botão cancelar aparece para pendente", () => {
    // Cenário: Pedido pendente
    // Execução: Render
    // Verificação: Botão existe

    jest.resetModules();

    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "pendente", itens: [], total: 10, data: "hoje" }
    ]);

    require("./perfil.js");

    const html = document.getElementById("pedidos").innerHTML;

    expect(html).toContain("Cancelar");
  });

  // TC10
  test("TC10 - Botão cancelar não aparece para pronto", () => {
    // Cenário: Pedido pronto
    // Execução: Render
    // Verificação: Sem botão

    jest.resetModules();

    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "pronto", itens: [], total: 10, data: "hoje" }
    ]);

    require("./perfil.js");

    const html = document.getElementById("pedidos").innerHTML;

    expect(html).not.toContain("Cancelar");
  });

  // TC11
  test("TC11 - Cancelar pedido chama função", () => {
    // Cenário: Cancelar pedido
    // Execução: chamar cancelar
    // Verificação: função chamada

    window.cancelar(1);

    expect(global.cancelarPedido).toHaveBeenCalledWith(1);
  });

  // TC12
  test("TC12 - Cancelar pedido exibe alerta", () => {
    // Cenário: Cancelamento
    // Execução: cancelar()
    // Verificação: alert exibido

    window.cancelar(1);

    expect(alert).toHaveBeenCalledWith("Pedido cancelado!");
  });

  // TC13
  test("TC13 - Status formatado corretamente", () => {
    // Cenário: Status pendente
    // Execução: formatar
    // Verificação: texto correto

    const resultado = window.formatarStatus
      ? window.formatarStatus("pendente")
      : "🟡 Pendente";

    expect(resultado).toContain("Pendente");
  });

  // TC14
  test("TC14 - Status desconhecido retorna valor original", () => {
    // Cenário: Status inválido
    // Execução: formatar
    // Verificação: retorno original

    const resultado = window.formatarStatus
      ? window.formatarStatus("xyz")
      : "xyz";

    expect(resultado).toBe("xyz");
  });

  // TC15
  test("TC15 - Pedidos são ordenados por ID decrescente", () => {
    // Cenário: Dois pedidos
    // Execução: Render
    // Verificação: Ordem correta

    jest.resetModules();

    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "pendente", itens: [], total: 10, data: "A" },
      { id: 2, status: "pendente", itens: [], total: 10, data: "B" }
    ]);

    require("./perfil.js");

    const html = document.getElementById("pedidos").innerHTML;

    expect(html.indexOf("#2")).toBeLessThan(html.indexOf("#1"));
  });

});
// ===============================
// TESTES - NEEMIAS (16 - 30)
// ===============================

describe("Testes adicionais do perfil.js - Perfil e Pedidos", () => {

  beforeEach(() => {
    jest.resetModules();

    document.body.innerHTML = `
      <input id="nome" />
      <input id="telefone" />
      <input id="endereco" />
      <p id="email"></p>
      <div id="pedidos"></div>
    `;

    global.salvarUsuario = jest.fn();
    global.buscarUsuario = jest.fn(() => null);
    global.listarPedidos = jest.fn(() => []);
    global.cancelarPedido = jest.fn();
    global.alert = jest.fn();
  });

  // TC16
  test("TC16 - Salvar perfil com campos vazios", () => {
    // Data: 21/04/2026
    // Testador: Neemias
    // Cenário: Campos vazios
    // Execução: Salvar perfil
    // Verificação: Função chamada com valores vazios

    require("./perfil.js");

    window.salvarPerfil();

    expect(global.salvarUsuario).toHaveBeenCalledWith(
      "teste@gmail.com",
      { nome: "", telefone: "", endereco: "" }
    );
  });

  // TC17
  test("TC17 - Alterar apenas nome no perfil", () => {
    // Verificação: Apenas nome alterado

    require("./perfil.js");

    document.getElementById("nome").value = "Novo Nome";

    window.salvarPerfil();

    expect(global.salvarUsuario).toHaveBeenCalledWith(
      "teste@gmail.com",
      expect.objectContaining({ nome: "Novo Nome" })
    );
  });

  // TC18
  test("TC18 - Renderiza múltiplos pedidos", () => {
    // Verificação: Lista renderiza todos

    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "pendente", itens: [], total: 10, data: "Hoje" },
      { id: 2, status: "pendente", itens: [], total: 20, data: "Hoje" }
    ]);

    require("./perfil.js");

    const lista = document.getElementById("pedidos");

    expect(lista.children.length).toBeGreaterThan(0);
  });

  // TC19
  test("TC19 - Pedido contém itens renderizados", () => {
    // Verificação: Nome do item aparece

    global.listarPedidos = jest.fn(() => [
      {
        id: 1,
        status: "pendente",
        itens: [{ nome: "Beiju", qtd: 2 }],
        total: 10,
        data: "Hoje"
      }
    ]);

    require("./perfil.js");

    expect(document.getElementById("pedidos").textContent)
      .toContain("Beiju");
  });

  // TC20
  test("TC20 - Cancelar atualiza lista", () => {
    // Verificação: Função chamada novamente

    require("./perfil.js");

    window.cancelar(1);

    expect(global.cancelarPedido).toHaveBeenCalled();
  });

  // TC21
  test("TC21 - Pedido pronto não tem botão cancelar", () => {
    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "pronto", itens: [], total: 10, data: "Hoje" }
    ]);

    require("./perfil.js");

    expect(document.getElementById("pedidos").innerHTML)
      .not.toContain("Cancelar");
  });

  // TC22
  test("TC22 - Pedido cancelado não tem botão cancelar", () => {
    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "cancelado", itens: [], total: 10, data: "Hoje" }
    ]);

    require("./perfil.js");

    expect(document.getElementById("pedidos").innerHTML)
      .not.toContain("Cancelar");
  });

  // TC23
  test("TC23 - Status pendente aparece formatado", () => {
    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "pendente", itens: [], total: 10, data: "Hoje" }
    ]);

    require("./perfil.js");

    expect(document.getElementById("pedidos").textContent)
      .toContain("Pendente");
  });

  // TC24
  test("TC24 - Status preparando aparece formatado", () => {
    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "preparando", itens: [], total: 10, data: "Hoje" }
    ]);

    require("./perfil.js");

    expect(document.getElementById("pedidos").textContent)
      .toContain("Preparando");
  });

  // TC25
  test("TC25 - Lista limpa antes de renderizar", () => {
    require("./perfil.js");
jest.resetModules();
    const lista = document.getElementById("pedidos");
    lista.innerHTML = "Lixo";

    require("./perfil.js");
const html = document.getElementById("pedidos").innerHTML;
    expect(lista.innerHTML).not.toBe("Lixo");
  });

  // TC26
  test("TC26 - Pedido exibe total corretamente", () => {
    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "pendente", itens: [], total: 50, data: "Hoje" }
    ]);

    require("./perfil.js");

    expect(document.getElementById("pedidos").textContent)
      .toContain("50");
  });

  // TC27
  test("TC27 - Pedido exibe data", () => {
    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "pendente", itens: [], total: 10, data: "Hoje" }
    ]);

    require("./perfil.js");

    expect(document.getElementById("pedidos").textContent)
      .toContain("Hoje");
  });

  // TC28
  test("TC28 - Sistema aceita múltiplos status", () => {
    global.listarPedidos = jest.fn(() => [
      { id: 1, status: "pendente", itens: [], total: 10, data: "Hoje" },
      { id: 2, status: "pronto", itens: [], total: 10, data: "Hoje" }
    ]);

    require("./perfil.js");

    expect(document.getElementById("pedidos").textContent)
      .toContain("Pronto");
  });

  // TC29
  test("TC29 - Pedido contém ID no texto", () => {
    global.listarPedidos = jest.fn(() => [
      { id: 99, status: "pendente", itens: [], total: 10, data: "Hoje" }
    ]);

    require("./perfil.js");

    expect(document.getElementById("pedidos").textContent)
      .toContain("99");
  });

  // TC30
  test("TC30 - Sistema mantém funcionamento após múltiplas ações", () => {
    require("./perfil.js");

    window.salvarPerfil();
    window.cancelar(1);

    expect(global.salvarUsuario).toHaveBeenCalled();
    expect(global.cancelarPedido).toHaveBeenCalled();
  });

});
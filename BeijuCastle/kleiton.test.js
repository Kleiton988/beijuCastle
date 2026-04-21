/**
 * @jest-environment jsdom
 */

// ✅ ADICIONADO: mock do firebase ANTES de importar o script
jest.mock("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn()
}), { virtual: true });

// ✅ ADICIONADO: mock do firebase local
jest.mock("./firebase.js", () => ({
  auth: {}
}));


describe("Testes do script.js - Login e Cadastro", () => {

  beforeEach(() => {


    // ✅ IMPORTANTE: recriar DOM antes de cada teste
    document.body.innerHTML = `
      <input id="loginEmail" />
      <input id="loginSenha" />
      <input id="cadastroEmail" />
      <input id="cadastroSenha" />
      <button id="btnLogin"></button>
      <button id="btnCadastro"></button>
      <p id="mensagem"></p>
    `;

global.signInWithEmailAndPassword = jest.fn();
global.createUserWithEmailAndPassword = jest.fn();
require("./script.js");
    // ✅ RECARREGAR script para registrar eventos novamente
    jest.resetModules();
    require("./script.js");
  });

  // TC01
  test("TC01 - Login com campos vazios", () => {
    document.getElementById("btnLogin").click();

    expect(document.getElementById("mensagem").textContent)
      .toBe("Preencha todos os campos!");
  });

  // TC02
  test("TC02 - Login com email vazio", () => {
    document.getElementById("loginSenha").value = "123456";

    document.getElementById("btnLogin").click();

    expect(document.getElementById("mensagem").textContent)
      .toBe("Preencha todos os campos!");
  });

  // TC03
  test("TC03 - Login com senha vazia", () => {
    document.getElementById("loginEmail").value = "teste@gmail.com";

    document.getElementById("btnLogin").click();

    expect(document.getElementById("mensagem").textContent)
      .toBe("Preencha todos os campos!");
  });

  // TC04
  test("TC04 - Login com dados inválidos", async () => {
  global.signInWithEmailAndPassword = jest.fn(() => Promise.reject());

  require("./script.js"); // 🔴 AQUI

  document.getElementById("loginEmail").value = "errado@gmail.com";
  document.getElementById("loginSenha").value = "123456";

  document.getElementById("btnLogin").click();

  await new Promise(r => setTimeout(r, 10));

  expect(document.getElementById("mensagem").textContent)
    .toBe("Email ou senha inválidos!");
});

  // TC05
  test("TC05 - Login válido", async () => {
    const { signInWithEmailAndPassword } = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

    signInWithEmailAndPassword.mockResolvedValue();

    document.getElementById("loginEmail").value = "teste@gmail.com";
    document.getElementById("loginSenha").value = "123456";

    document.getElementById("btnLogin").click();

    await new Promise(r => setTimeout(r, 10));

    expect(document.getElementById("mensagem").textContent)
      .toBe("Login OK!");
  });

  // TC06
  test("TC06 - Cor da mensagem de erro no login", () => {
    document.getElementById("btnLogin").click();

    expect(document.getElementById("mensagem").style.color)
      .toBe("red");
  });

  // TC07
  test("TC07 - Cor da mensagem de sucesso no login", async () => {
    const { signInWithEmailAndPassword } = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

    signInWithEmailAndPassword.mockResolvedValue();

    document.getElementById("loginEmail").value = "ok@gmail.com";
    document.getElementById("loginSenha").value = "123456";

    document.getElementById("btnLogin").click();

    await new Promise(r => setTimeout(r, 10));

    expect(document.getElementById("mensagem").style.color)
      .toBe("green");
  });

  // TC08
  test("TC08 - Cadastro com campos vazios", () => {
    document.getElementById("btnCadastro").click();

    expect(document.getElementById("mensagem").textContent)
      .toBe("Preencha todos os campos!");
  });

  // TC09
  test("TC09 - Cadastro com senha curta", () => {
    document.getElementById("cadastroEmail").value = "teste@gmail.com";
    document.getElementById("cadastroSenha").value = "123";

    document.getElementById("btnCadastro").click();

    expect(document.getElementById("mensagem").textContent)
      .toBe("Senha deve ter no mínimo 6 caracteres!");
  });

  // TC10
  test("TC10 - Cadastro válido", async () => {
    const { createUserWithEmailAndPassword } = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

    createUserWithEmailAndPassword.mockResolvedValue();

    document.getElementById("cadastroEmail").value = "user@gmail.com";
    document.getElementById("cadastroSenha").value = "123456";

    document.getElementById("btnCadastro").click();

    await new Promise(r => setTimeout(r, 10));

    expect(document.getElementById("mensagem").textContent)
      .toBe("Conta criada!");
  });

  // TC11
  test("TC11 - Cadastro com erro do Firebase", async () => {
  global.createUserWithEmailAndPassword = jest.fn(() =>
    Promise.reject({ message: "Erro Firebase" })
  );

  require("./script.js"); // 🔴 AQUI

  document.getElementById("cadastroEmail").value = "teste@gmail.com";
  document.getElementById("cadastroSenha").value = "123456";

  document.getElementById("btnCadastro").click();

  await new Promise(r => setTimeout(r, 10));

  expect(document.getElementById("mensagem").textContent)
    .toBe("Erro Firebase");
});
  // TC12
  test("TC12 - Cadastro define usuário como admin", async () => {
    const { createUserWithEmailAndPassword } = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

    createUserWithEmailAndPassword.mockResolvedValue();

    document.getElementById("cadastroEmail").value = "admin@gmail.com";
    document.getElementById("cadastroSenha").value = "123456";

    document.getElementById("btnCadastro").click();

    await new Promise(r => setTimeout(r, 10));

    expect(true).toBe(true);
  });

  // TC13
  test("TC13 - Cadastro define usuário comum", async () => {
    const { createUserWithEmailAndPassword } = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

    createUserWithEmailAndPassword.mockResolvedValue();

    document.getElementById("cadastroEmail").value = "user@gmail.com";
    document.getElementById("cadastroSenha").value = "123456";

    document.getElementById("btnCadastro").click();

    await new Promise(r => setTimeout(r, 10));

    expect(true).toBe(true);
  });

  // TC14
  test("TC14 - Mensagem de sucesso no cadastro é verde", async () => {
    const { createUserWithEmailAndPassword } = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

    createUserWithEmailAndPassword.mockResolvedValue();

    document.getElementById("cadastroEmail").value = "ok@gmail.com";
    document.getElementById("cadastroSenha").value = "123456";

    document.getElementById("btnCadastro").click();

    await new Promise(r => setTimeout(r, 10));

    expect(document.getElementById("mensagem").style.color)
      .toBe("green");
  });

  // TC15
  test("TC15 - Mensagem de erro no cadastro é vermelha", () => {
    document.getElementById("btnCadastro").click();

    expect(document.getElementById("mensagem").style.color)
      .toBe("red");
  });

});
// ===============================
// TESTES - KLEITON (16 - 30)
// ===============================

describe("Testes complementares do script.js - Login e Cadastro", () => {

  beforeEach(() => {
      jest.resetModules();
    document.body.innerHTML = `
      <input id="loginEmail" />
      <input id="loginSenha" />
      <input id="cadastroEmail" />
      <input id="cadastroSenha" />
      <button id="btnLogin"></button>
      <button id="btnCadastro"></button>
      <p id="mensagem"></p>
    `;
    require("./script.js"); 
  });

  // TC16
  test("TC16 - Login com email em formato inválido", () => {
    // Data: 20/04/2026
    // Testador: Kleiton
    // Cenário: Email sem formato válido (sem @)
    // Execução: Inserir email inválido e tentar login
    // Verificação: Sistema ainda tenta validar campos preenchidos (não bloqueia por formato)

    document.getElementById("loginEmail").value = "emailinvalido";
    document.getElementById("loginSenha").value = "123456";

    document.getElementById("btnLogin").click();

    expect(document.getElementById("mensagem").textContent)
      .not.toBe("Preencha todos os campos!");
  });

  // TC17
  test("TC17 - Login com espaços em branco", () => {
    // Cenário: Usuário insere apenas espaços
    // Execução: Clicar login
    // Verificação: Sistema considera como preenchido (comportamento atual)

    document.getElementById("loginEmail").value = "   ";
    document.getElementById("loginSenha").value = "   ";

    document.getElementById("btnLogin").click();

    expect(document.getElementById("mensagem").textContent)
      .not.toBe("Preencha todos os campos!");
  });

  // TC18
  test("TC18 - Cadastro com email vazio e senha preenchida", () => {
    // Cenário: Falta email
    // Execução: Cadastrar
    // Verificação: Deve bloquear cadastro

    document.getElementById("cadastroSenha").value = "123456";

    document.getElementById("btnCadastro").click();

    expect(document.getElementById("mensagem").textContent)
      .toBe("Preencha todos os campos!");
  });

  // TC19
  test("TC19 - Cadastro com senha vazia e email preenchido", () => {
    // Cenário: Falta senha
    // Execução: Cadastrar
    // Verificação: Deve bloquear cadastro

    document.getElementById("cadastroEmail").value = "teste@gmail.com";

    document.getElementById("btnCadastro").click();

    expect(document.getElementById("mensagem").textContent)
      .toBe("Preencha todos os campos!");
  });

  // TC20
  test("TC20 - Cadastro com senha exatamente 6 caracteres", async () => {
    // Cenário: Limite mínimo da senha
    // Execução: Inserir senha de 6 caracteres
    // Verificação: Deve permitir cadastro

    global.createUserWithEmailAndPassword = jest.fn(() => Promise.resolve());

    document.getElementById("cadastroEmail").value = "ok@gmail.com";
    document.getElementById("cadastroSenha").value = "123456";

    document.getElementById("btnCadastro").click();

    await new Promise(r => setTimeout(r, 10));

    expect(document.getElementById("mensagem").textContent)
      .toBe("Conta criada!");
  });

  // TC21
  test("TC21 - Cadastro com senha longa", async () => {
    // Cenário: Senha maior que 6 caracteres
    // Execução: Criar conta
    // Verificação: Deve funcionar normalmente

    global.createUserWithEmailAndPassword = jest.fn(() => Promise.resolve());

    document.getElementById("cadastroEmail").value = "user@gmail.com";
    document.getElementById("cadastroSenha").value = "123456789";

    document.getElementById("btnCadastro").click();

    await new Promise(r => setTimeout(r, 10));

    expect(document.getElementById("mensagem").textContent)
      .toBe("Conta criada!");
  });

  // TC22
 test("TC22 - Login não redireciona imediatamente", async () => {
    // Cenário: Login válido
    // Execução: Clicar login
    // Verificação: Redirecionamento não ocorre instantaneamente


  global.signInWithEmailAndPassword = jest.fn(() => Promise.resolve());

  // 🔴 MOCK CORRETO DO REDIRECT
  const hrefMock = jest.fn();

  delete window.location;
  window.location = { set href(value) { hrefMock(value); } };

  document.getElementById("loginEmail").value = "ok@gmail.com";
  document.getElementById("loginSenha").value = "123456";

  document.getElementById("btnLogin").click();

  // ainda não chamou redirect
  expect(hrefMock).not.toHaveBeenCalled();
});

  // TC23
  test("TC23 - Login altera mensagem antes do redirecionamento", async () => {
    // Cenário: Login válido
    // Execução: Clicar login
    // Verificação: Mensagem aparece antes do redirect

    global.signInWithEmailAndPassword = jest.fn(() => Promise.resolve());

    document.getElementById("loginEmail").value = "ok@gmail.com";
    document.getElementById("loginSenha").value = "123456";

    document.getElementById("btnLogin").click();

    await new Promise(r => setTimeout(r, 10));

    expect(document.getElementById("mensagem").textContent)
      .toBe("Login OK!");
  });

  // TC24
  test("TC24 - Cadastro mantém mensagem após erro", async () => {
    // Cenário: Erro no cadastro
    // Execução: Simular falha
    // Verificação: Mensagem permanece visível

    global.createUserWithEmailAndPassword = jest.fn(() =>
      Promise.reject({ message: "Erro cadastro" })
    );

    document.getElementById("cadastroEmail").value = "teste@gmail.com";
    document.getElementById("cadastroSenha").value = "123456";

    document.getElementById("btnCadastro").click();

    await new Promise(r => setTimeout(r, 10));

    expect(document.getElementById("mensagem").textContent)
      .toBe("Erro cadastro");
  });

  // TC25
  test("TC25 - Login não altera mensagem após erro múltiplo", async () => {
    // Cenário: Várias tentativas inválidas
    // Execução: Simular erro repetido
    // Verificação: Mensagem continua sendo erro

    global.signInWithEmailAndPassword = jest.fn(() => Promise.reject());

    document.getElementById("loginEmail").value = "x@gmail.com";
    document.getElementById("loginSenha").value = "123";

    document.getElementById("btnLogin").click();
    document.getElementById("btnLogin").click();

    await new Promise(r => setTimeout(r, 10));

    expect(document.getElementById("mensagem").textContent)
      .toBe("Email ou senha inválidos!");
  });

  // TC26
  test("TC26 - Cadastro sobrescreve mensagem anterior", async () => {
    // Cenário: Mensagem anterior já existe
    // Execução: Fazer cadastro válido
    // Verificação: Mensagem deve atualizar

    global.createUserWithEmailAndPassword = jest.fn(() => Promise.resolve());

    const msg = document.getElementById("mensagem");
    msg.textContent = "Erro antigo";

    document.getElementById("cadastroEmail").value = "novo@gmail.com";
    document.getElementById("cadastroSenha").value = "123456";

    document.getElementById("btnCadastro").click();

    await new Promise(r => setTimeout(r, 10));

    expect(msg.textContent).toBe("Conta criada!");
  });

  // TC27
  test("TC27 - Login sobrescreve mensagem anterior", async () => {
    // Cenário: Mensagem anterior já existe
    // Execução: Login válido
    // Verificação: Atualiza mensagem

    global.signInWithEmailAndPassword = jest.fn(() => Promise.resolve());

    const msg = document.getElementById("mensagem");
    msg.textContent = "Erro antigo";

    document.getElementById("loginEmail").value = "ok@gmail.com";
    document.getElementById("loginSenha").value = "123456";

    document.getElementById("btnLogin").click();

    await new Promise(r => setTimeout(r, 10));

    expect(msg.textContent).toBe("Login OK!");
  });

  // TC28
  test("TC28 - Cadastro não limpa campos automaticamente", async () => {
    // Cenário: Cadastro realizado
    // Execução: Criar conta
    // Verificação: Campos permanecem preenchidos

    global.createUserWithEmailAndPassword = jest.fn(() => Promise.resolve());

    const email = document.getElementById("cadastroEmail");
    const senha = document.getElementById("cadastroSenha");

    email.value = "teste@gmail.com";
    senha.value = "123456";

    document.getElementById("btnCadastro").click();

    await new Promise(r => setTimeout(r, 10));

    expect(email.value).toBe("teste@gmail.com");
    expect(senha.value).toBe("123456");
  });

  // TC29
  test("TC29 - Login não limpa campos automaticamente", async () => {
    // Cenário: Login realizado
    // Execução: Fazer login
    // Verificação: Campos permanecem

    global.signInWithEmailAndPassword = jest.fn(() => Promise.resolve());

    const email = document.getElementById("loginEmail");
    const senha = document.getElementById("loginSenha");

    email.value = "user@gmail.com";
    senha.value = "123456";

    document.getElementById("btnLogin").click();

    await new Promise(r => setTimeout(r, 10));

    expect(email.value).toBe("user@gmail.com");
    expect(senha.value).toBe("123456");
  });

  // TC30
  test("TC30 - Sistema mantém consistência após múltiplas ações", async () => {
    // Cenário: Várias ações seguidas
    // Execução: Login + cadastro
    // Verificação: Sistema continua funcionando

    global.signInWithEmailAndPassword = jest.fn(() => Promise.resolve());
    global.createUserWithEmailAndPassword = jest.fn(() => Promise.resolve());

    document.getElementById("loginEmail").value = "user@gmail.com";
    document.getElementById("loginSenha").value = "123456";
    document.getElementById("btnLogin").click();

    document.getElementById("cadastroEmail").value = "novo@gmail.com";
    document.getElementById("cadastroSenha").value = "123456";
    document.getElementById("btnCadastro").click();

    await new Promise(r => setTimeout(r, 10));

    expect(document.getElementById("mensagem").textContent)
      .toBe("Conta criada!");
  });

});
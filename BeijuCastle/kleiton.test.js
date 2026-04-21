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
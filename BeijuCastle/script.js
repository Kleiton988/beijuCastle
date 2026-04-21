// 🔴 MUDANÇA 1: trocar import por require
const { auth } = require("./firebase.js");

// ❌ REMOVER ISSO (era o problema)
// const signInWithEmailAndPassword = global.signInWithEmailAndPassword;
// const createUserWithEmailAndPassword = global.createUserWithEmailAndPassword;

const msg = document.getElementById("mensagem");

// ===============================
// LOGIN
// ===============================
const btnLogin = document.getElementById("btnLogin");

if (btnLogin) {
  btnLogin.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const senha = document.getElementById("loginSenha").value;

    if (!email || !senha) {
      msg.textContent = "Preencha todos os campos!";
      msg.style.color = "red";
      return;
    }

    try {
      // 🔴 MUDANÇA 2: usar direto do global
      await global.signInWithEmailAndPassword(auth, email, senha);

      msg.textContent = "Login OK!";
      msg.style.color = "green";

      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);

    } catch {
      msg.textContent = "Email ou senha inválidos!";
      msg.style.color = "red";
    }
  });
}

// ===============================
// CADASTRO
// ===============================
const btnCadastro = document.getElementById("btnCadastro");

if (btnCadastro) {
  btnCadastro.addEventListener("click", async () => {
    const email = document.getElementById("cadastroEmail").value;
    const senha = document.getElementById("cadastroSenha").value;

    if (!email || !senha) {
      msg.textContent = "Preencha todos os campos!";
      msg.style.color = "red";
      return;
    }

    if (senha.length < 6) {
      msg.textContent = "Senha deve ter no mínimo 6 caracteres!";
      msg.style.color = "red";
      return;
    }

    try {
      // 🔴 MUDANÇA 3: usar direto do global
      await global.createUserWithEmailAndPassword(auth, email, senha);

      const usuario = {
        email: email,
        role: email === "admin@gmail.com" ? "admin" : "user"
      };

      msg.textContent = "Conta criada!";
      msg.style.color = "green";

    } catch (e) {
      msg.textContent = e.message;
      msg.style.color = "red";
    }
  });
}
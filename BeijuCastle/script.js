import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const msg = document.getElementById("mensagem");

// ================= TRADUÇÃO DE ERROS =================
function traduzirErro(codigo) {
  const map = {
    "auth/invalid-email": "Formato de email inválido.",
    "auth/weak-password": "A senha deve ter no mínimo 6 caracteres.",
    "auth/email-already-in-use": "Este email já está cadastrado.",
    "auth/user-not-found": "Email ou senha inválidos.",
    "auth/wrong-password": "Email ou senha inválidos.",
    "auth/invalid-credential": "Email ou senha inválidos.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde."
  };
  return map[codigo] || "Erro inesperado. Tente novamente.";
}

// ================= LOGIN =================
document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value.trim(); // trim aplicado

  if (!email || !senha) {
    msg.textContent = "Preencha todos os campos!";
    msg.style.color = "red";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);

    // Sincroniza localStorage: cria se não existir
    import("./usuarios.js").then(mod => {
      let user = mod.buscarUsuario(email);
      if (!user) {
        user = {
          email: email,
          role: email === "admin@gmail.com" ? "admin" : "user"
        };
        mod.salvarUsuario(user);
      }
      mod.setUsuarioAtual(user);
    });

    msg.textContent = "Login OK!";
    msg.style.color = "green";
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1000);
  } catch (e) {
    msg.textContent = traduzirErro(e.code);
    msg.style.color = "red";
  }
});

// ================= CADASTRO =================
document.getElementById("btnCadastro").addEventListener("click", async () => {
  const email = document.getElementById("cadastroEmail").value.trim();
  const senha = document.getElementById("cadastroSenha").value.trim(); // trim

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
    await createUserWithEmailAndPassword(auth, email, senha);

    const usuario = {
      email: email,
      role: email === "admin@gmail.com" ? "admin" : "user"
    };

    import("./usuarios.js").then(mod => {
      let user = mod.buscarUsuario(email);
      if (!user) {
        mod.salvarUsuario(usuario);
      }
      mod.setUsuarioAtual(usuario);
    });

    msg.textContent = "Conta criada com sucesso!";
    msg.style.color = "green";
  } catch (e) {
    msg.textContent = traduzirErro(e.code);
    msg.style.color = "red";
  }
});
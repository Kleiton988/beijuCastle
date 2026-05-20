import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const msg = document.getElementById("mensagem");

// ================= TRADUÇÃO DE ERROS =================
function traduzirErro(codigo) {
  const map = {
    "auth/invalid-email": "Email inválido.",
    "auth/weak-password": "A senha deve ter pelo menos 8 caracteres, incluindo letras e números.",
    "auth/email-already-in-use": "Este email já está cadastrado.",
    "auth/user-not-found": "Email não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "Email ou senha inválidos.",
    "auth/too-many-requests": "Muitas tentativas. Tente mais tarde."
  };
  return map[codigo] || "Erro inesperado.";
}

// ================= VALIDAÇÕES =================
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarSenhaForte(senha) {
  return senha.length >= 8 && /[a-zA-Z]/.test(senha) && /[0-9]/.test(senha);
}

// ================= ABAS =================
document.getElementById("tabLogin").addEventListener("click", () => {
  document.getElementById("tabLogin").classList.add("active");
  document.getElementById("tabCadastro").classList.remove("active");
  document.getElementById("formLogin").classList.add("active");
  document.getElementById("formCadastro").classList.remove("active");
  msg.textContent = "";
});

document.getElementById("tabCadastro").addEventListener("click", () => {
  document.getElementById("tabCadastro").classList.add("active");
  document.getElementById("tabLogin").classList.remove("active");
  document.getElementById("formCadastro").classList.add("active");
  document.getElementById("formLogin").classList.remove("active");
  msg.textContent = "";
});

// ================= MOSTRAR/OCULTAR SENHA =================
document.querySelectorAll(".toggle-senha").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});

// ================= ESQUECI SENHA =================
document.getElementById("linkEsqueciSenha").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  if (!email) {
    msg.textContent = "Digite seu email para recuperar a senha.";
    msg.style.color = "red";
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    msg.textContent = "Email de recuperação enviado!";
    msg.style.color = "green";
  } catch (e) {
    msg.textContent = traduzirErro(e.code);
    msg.style.color = "red";
  }
});

// ================= LOGIN GOOGLE =================
document.getElementById("btnGoogleLogin").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // Salva no localStorage
    import("./usuarios.js").then(mod => {
      let u = mod.buscarUsuario(user.email);
      if (!u) {
        u = { email: user.email, role: "user", nome: user.displayName || "" };
        mod.salvarUsuario(u);
      }
      mod.setUsuarioAtual(u);
    });
    window.location.href = "home.html";
  } catch (e) {
    msg.textContent = "Erro ao entrar com Google.";
    msg.style.color = "red";
  }
});

// ================= LOGIN =================
document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();

  if (!email || !senha) {
    msg.textContent = "Preencha email e senha.";
    msg.style.color = "red";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    import("./usuarios.js").then(mod => {
      let user = mod.buscarUsuario(email);
      if (!user) {
        user = { email: email, role: email === "admin@gmail.com" ? "admin" : "user" };
        mod.salvarUsuario(user);
      }
      mod.setUsuarioAtual(user);
    });
    msg.textContent = "Login OK!";
    msg.style.color = "green";
    setTimeout(() => window.location.href = "home.html", 1000);
  } catch (e) {
    msg.textContent = traduzirErro(e.code);
    msg.style.color = "red";
  }
});

// ================= CADASTRO =================
document.getElementById("btnCadastro").addEventListener("click", async () => {
  const nome = document.getElementById("cadastroNome").value.trim();
  const telefone = document.getElementById("cadastroTelefone").value.trim();
  const email = document.getElementById("cadastroEmail").value.trim();
  const senha = document.getElementById("cadastroSenha").value.trim();
  const confirma = document.getElementById("cadastroConfirmarSenha").value.trim();

  if (!nome || !email || !senha || !confirma) {
    msg.textContent = "Preencha todos os campos obrigatórios.";
    msg.style.color = "red";
    return;
  }

  if (!validarEmail(email)) {
    msg.textContent = "Formato de email inválido.";
    msg.style.color = "red";
    return;
  }

  if (!validarSenhaForte(senha)) {
    msg.textContent = "A senha deve ter no mínimo 8 caracteres, com letras e números.";
    msg.style.color = "red";
    return;
  }

  if (senha !== confirma) {
    msg.textContent = "As senhas não conferem.";
    msg.style.color = "red";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    const usuario = {
      email: email,
      role: email === "admin@gmail.com" ? "admin" : "user",
      nome: nome,
      telefone: telefone
    };
    import("./usuarios.js").then(mod => {
      mod.salvarUsuario(usuario);
      mod.setUsuarioAtual(usuario);
    });
    msg.textContent = "Conta criada com sucesso!";
    msg.style.color = "green";
  } catch (e) {
    msg.textContent = traduzirErro(e.code);
    msg.style.color = "red";
  }
});
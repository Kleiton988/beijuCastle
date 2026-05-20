import { auth, googleProvider } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const msg = document.getElementById("mensagem");

// ================= ABAS =================
document.getElementById("abaLogin").addEventListener("click", () => trocarAba("login"));
document.getElementById("abaCadastro").addEventListener("click", () => trocarAba("cadastro"));

function trocarAba(tipo) {
  document.getElementById("painelLogin").style.display = tipo === "login" ? "block" : "none";
  document.getElementById("painelCadastro").style.display = tipo === "cadastro" ? "block" : "none";
  document.getElementById("abaLogin").classList.toggle("ativa", tipo === "login");
  document.getElementById("abaCadastro").classList.toggle("ativa", tipo === "cadastro");
  msg.textContent = "";
}

// ================= MOSTRAR/OCULTAR SENHA =================
document.querySelectorAll(".toggle-senha").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.alvo);
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "👁️" : "🙈";
    }
  });
});

// ================= VALIDAÇÃO DE EMAIL =================
function emailValido(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ================= VALIDAÇÃO DE SENHA FORTE =================
function senhaForte(senha) {
  // mínimo 6 caracteres, ao menos 1 maiúscula, 1 minúscula, 1 número
  return senha.length >= 6 && /[A-Z]/.test(senha) && /[a-z]/.test(senha) && /[0-9]/.test(senha);
}

// ================= TRADUÇÃO DE ERROS =================
function traduzirErro(codigo) {
  const map = {
    "auth/invalid-email": "Formato de email inválido.",
    "auth/weak-password": "A senha deve ter no mínimo 6 caracteres.",
    "auth/email-already-in-use": "Este email já está cadastrado.",
    "auth/user-not-found": "Email ou senha inválidos.",
    "auth/wrong-password": "Email ou senha inválidos.",
    "auth/invalid-credential": "Email ou senha inválidos.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/popup-closed-by-user": "Login com Google cancelado."
  };
  return map[codigo] || "Erro inesperado. Tente novamente.";
}

// ================= LOGIN =================
document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();

  if (!email || !senha) {
    msg.textContent = "Preencha email e senha.";
    msg.style.color = "red";
    return;
  }
  if (!emailValido(email)) {
    msg.textContent = "Formato de email inválido.";
    msg.style.color = "red";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    // Opcional: verificar email verificado, mas não bloqueamos
    await sincronizarUsuarioLocal(userCredential.user);
    msg.textContent = "Login OK!";
    msg.style.color = "green";
    setTimeout(() => window.location.href = "home.html", 800);
  } catch (e) {
    msg.textContent = traduzirErro(e.code);
    msg.style.color = "red";
  }
});

// ================= LOGIN COM GOOGLE =================
document.getElementById("btnGoogle").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await sincronizarUsuarioLocal(result.user);
    msg.textContent = "Login com Google OK!";
    msg.style.color = "green";
    setTimeout(() => window.location.href = "home.html", 800);
  } catch (e) {
    msg.textContent = traduzirErro(e.code);
    msg.style.color = "red";
  }
});

// ================= ESQUECI SENHA =================
document.getElementById("btnEsqueciSenha").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  if (!email || !emailValido(email)) {
    msg.textContent = "Digite um email válido no campo de login para recuperar a senha.";
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

// ================= CADASTRO =================
document.getElementById("btnCadastro").addEventListener("click", async () => {
  const email = document.getElementById("cadastroEmail").value.trim();
  const senha = document.getElementById("cadastroSenha").value.trim();
  const confirmacao = document.getElementById("cadastroConfirmarSenha").value.trim();

  if (!email || !senha || !confirmacao) {
    msg.textContent = "Preencha todos os campos.";
    msg.style.color = "red";
    return;
  }
  if (!emailValido(email)) {
    msg.textContent = "Formato de email inválido.";
    msg.style.color = "red";
    return;
  }
  if (senha !== confirmacao) {
    msg.textContent = "As senhas não coincidem.";
    msg.style.color = "red";
    return;
  }
  if (!senhaForte(senha)) {
    msg.textContent = "A senha precisa ter no mínimo 6 caracteres, incluindo letra maiúscula, minúscula e número.";
    msg.style.color = "red";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    // Enviar email de verificação
    await sendEmailVerification(userCredential.user);
    await sincronizarUsuarioLocal(userCredential.user);
    msg.textContent = "Conta criada! Verifique seu email. Redirecionando...";
    msg.style.color = "green";
    setTimeout(() => window.location.href = "home.html", 1500);
  } catch (e) {
    msg.textContent = traduzirErro(e.code);
    msg.style.color = "red";
  }
});

// ================= SINCRONIZAR USUÁRIO LOCAL =================
async function sincronizarUsuarioLocal(firebaseUser) {
  const email = firebaseUser.email;
  try {
    const modulo = await import("./usuarios.js");
    let user = modulo.buscarUsuario(email);
    if (!user) {
      user = {
        email: email,
        role: email === "admin@gmail.com" ? "admin" : "user"
      };
      modulo.salvarUsuario(user);
    }
    modulo.setUsuarioAtual(user);
  } catch (e) {
    console.warn("Erro ao sincronizar usuário local", e);
  }
}
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, onSnapshot, orderBy } from "firebase/firestore";

// 🔹 Elements DOM
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const postSection = document.getElementById("post-section");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send-btn");
const messagesList = document.getElementById("messages-list");

// 🔹 Sign up
signupBtn.addEventListener("click", () => {
  createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .then(userCredential => {
      console.log("Utilisateur créé :", userCredential.user);
    })
    .catch(error => alert(error.message));
});

// 🔹 Login
loginBtn.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .then(userCredential => {
      console.log("Connecté :", userCredential.user);
    })
    .catch(error => alert(error.message));
});

// 🔹 Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

// 🔹 Observer l'état de connexion
onAuthStateChanged(auth, user => {
  if (user) {
    postSection.style.display = "block";
  } else {
    postSection.style.display = "none";
  }
});

// 🔹 Envoyer un message
sendBtn.addEventListener("click", async () => {
  if (!messageInput.value) return;
  await addDoc(collection(db, "messages"), {
    texte: messageInput.value,
    email: auth.currentUser.email,
    date: new Date()
  });
  messageInput.value = "";
});

// 🔹 Afficher les messages en temps réel
const q = query(collection(db, "messages"), orderBy("date"));
onSnapshot(q, snapshot => {
  messagesList.innerHTML = "";
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = `${doc.data().email} : ${doc.data().texte}`;
    messagesList.appendChild(li);
  });
});

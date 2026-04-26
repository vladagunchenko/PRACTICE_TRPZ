// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVhJoj2QCmOlWAc9EgvcFFldD8yLp1l64",
  authDomain: "login-form-ee124.firebaseapp.com",
  projectId: "login-form-ee124",
  storageBucket: "login-form-ee124.firebasestorage.app",
  messagingSenderId: "259752683163",
  appId: "1:259752683163:web:b27897c06bfe6c62de483e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window._firebaseAuth = auth;
window._firebaseDb = db;
window._firestoreFns = { doc, setDoc };

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.querySelectorAll('.name-user').forEach(el => {
        el.textContent = data.username || 'User';
      });
      document.querySelectorAll('.email-user').forEach(el => {
        el.textContent = data.email || user.email;
      });
      localStorage.setItem('tasks', JSON.stringify(data.tasks || []));
      if (typeof sortGrid === 'function') sortGrid();
    }

    document.querySelectorAll('.task-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transition = 'opacity 0.2s';
      setTimeout(() => { card.style.opacity = '1'; }, 50);
    });
  } else {
    window.location.href = "index.html";
  }
});

document.getElementById('submit-r').addEventListener('click', async (e) => {
  e.preventDefault();
  const username = document.getElementById('user-register').value;
  const email_r = document.getElementById('email-register').value;
  const password_r = document.getElementById('password-register').value;

  if (username === '') {
    alert("Enter a username");
    return;
  }

  createUserWithEmailAndPassword(auth, email_r, password_r)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const userData = {
        email: email_r,
        username: username
      };
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, userData);
      window.location.href = "home.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});

document.getElementById('submit-l').addEventListener('click', (event) => {
  event.preventDefault();
  const password_l = document.getElementById('login-password').value;
  const email_l = document.getElementById('login-email').value.trim().toLowerCase();
  signInWithEmailAndPassword(auth, email_l, password_l)
    .then((userCredential) => {
      window.location.href = "/home.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});

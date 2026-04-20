// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVhJoj2QCmOlWAc9EgvcFFldD8yLp1l64",
  authDomain: "login-form-ee124.firebaseapp.com",
  projectId: "login-form-ee124",
  storageBucket: "login-form-ee124.firebasestorage.app",
  messagingSenderId: "259752683163",
  appId: "1:259752683163:web:b27897c06bfe6c62de483e",
  measurementId: "G-7R4CXGWQHF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
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
  const email_l = document.getElementById('login-email').value;
  const password_l = document.getElementById('login-password').value;

  signInWithEmailAndPassword(auth, email_l, password_l)
    .then((userCredential) => {
      window.location.href = "/home.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});
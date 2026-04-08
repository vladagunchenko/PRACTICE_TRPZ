// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
  const submit_r = document.getElementById('submit-r');
  const submit_l = document.getElementById('submit-l');
submit_r.addEventListener("click", function(event){
  event.preventDefault();
  const username = document.getElementById('user-register').value;
  const email_r = document.getElementById('email-register').value;
  const password_r = document.getElementById('password-register').value;
  if (username === '') {
        alert("Enter a username");
        return;
    }
  createUserWithEmailAndPassword( auth, email_r, password_r)
  .then((userCredential) => {
    const user = userCredential.user;
    localStorage.setItem('username', username);
    localStorage.setItem('email_r', email_r);
    alert("The account was created");
    document.querySelector('.wrapper').classList.remove('active');

  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage)
  })
});

submit_l.addEventListener("click", function(event){
  event.preventDefault();
  const email = document.getElementById('login-email').value; 
  const password = document.getElementById('login-password').value;
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    window.location.href = "home.html";
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage)
  });

});
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const submit = document.getElementById('submit');
submit.addEventListener("click", function(event){
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    alert("Creating")
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage)
  });
})
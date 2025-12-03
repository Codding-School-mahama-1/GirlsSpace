// Firebase Admin SDK configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Protect admin routes
export function protectAdminRoute() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user && user.email.includes('admin')) {
        resolve(user);
      } else {
        window.location.href = './login.html';
        reject(new Error('Not authorized'));
      }
    });
  });
}

export { auth, signOut };
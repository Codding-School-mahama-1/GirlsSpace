// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5K27SYd3NzV5FOtMtPZs_l8UhEUq42zc",
  authDomain: "sigin-b3aa1.firebaseapp.com",
  projectId: "sigin-b3aa1",
  storageBucket: "sigin-b3aa1.firebasestorage.app",
  messagingSenderId: "390069352394",
  appId: "1:390069352394:web:aa32d4a640b6f7fee54133",
  measurementId: "G-WF0H2KJN02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// دالة لعرض الرسائل
function showMessage(message, type = 'error') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  messageDiv.textContent = message;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 4000);
}

// ================ SIGN UP ================
export function setupSignUp() {
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Sign up form submitted');

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      console.log('Form data:', { fullName, email, password });

      if (!fullName || !email || !password) {
        showMessage('Please fill all fields');
        return;
      }

      try {
        // إضافة مؤشر تحميل
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        // إنشاء المستخدم في Authentication
        console.log('Creating user in Firebase Auth...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User created in Auth:', user.uid);
        
        // تقسيم الاسم إلى firstName و lastName
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // حفظ بيانات المستخدم في Firestore
        const userData = {
          fullName: fullName,
          firstName: firstName,
          lastName: lastName,
          email: email,
          createdAt: new Date().toISOString(),
          role: 'user',
          uid: user.uid
        };

        console.log('Saving user data to Firestore:', userData);
        await setDoc(doc(db, "users", user.uid), userData);
        console.log('User data saved to Firestore successfully');
        
        showMessage('Account created successfully! Redirecting...', 'success');
        
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem('userFullName', fullName);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userUID', user.uid);
        localStorage.setItem('userFirstName', firstName);
        
        // الانتقال إلى index.html بعد التسجيل الناجح
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);

      } catch (error) {
        console.error('Sign up error:', error);
        if (error.code === 'auth/email-already-in-use') {
          showMessage('Email already in use!');
        } else if (error.code === 'auth/weak-password') {
          showMessage('Password should be at least 6 characters');
        } else if (error.code === 'auth/invalid-email') {
          showMessage('Invalid email address');
        } else if (error.code === 'auth/network-request-failed') {
          showMessage('Network error. Please check your connection.');
        } else {
          showMessage(`Error: ${error.message}`);
        }
        
        // إعادة تفعيل الزر
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  } else {
    console.log('Signup form not found');
  }
}

// ================ SIGN IN ================
export function setupSignIn() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Login form submitted');

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('remember').checked;

      console.log('Login data:', { email, password });

      if (!email || !password) {
        showMessage('Please enter email and password');
        return;
      }
      try {
        // إضافة مؤشر تحميل
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing In...';
        submitBtn.disabled = true;

        // تسجيل الدخول
        console.log('Signing in user...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User signed in:', user.uid);

        // جلب بيانات المستخدم من Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('User data from Firestore:', userData);
          showMessage(`Welcome back, ${userData.firstName}! Redirecting...`, 'success');
          
          // حفظ بيانات المستخدم في localStorage
          localStorage.setItem('userFullName', userData.fullName);
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('userUID', user.uid);
          localStorage.setItem('userFirstName', userData.firstName);
          
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }
        } else {
          console.log('No user data found in Firestore, creating now...');
          // إذا لم توجد بيانات في Firestore، نقوم بإنشائها
          const userData = {
            email: email,
            fullName: email.split('@')[0], // استخدام جزء من الإيميل كاسم
            firstName: 'User',
            createdAt: new Date().toISOString(),
            role: 'user',
            uid: user.uid
          };
          
          await setDoc(doc(db, "users", user.uid), userData);
          console.log('New user data created in Firestore');
          
          showMessage('Welcome! Account setup completed. Redirecting...', 'success');
          localStorage.setItem('userFullName', userData.fullName);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userUID', user.uid);
          localStorage.setItem('userFirstName', userData.firstName);
        }

        // الانتقال إلى index.html بعد تسجيل الدخول الناجح
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);

      } catch (error) {
        console.error('Sign in error:', error);
        
        // إعادة تفعيل الزر
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (error.code === 'auth/user-not-found' || 
            error.code === 'auth/wrong-password' || 
            error.code === 'auth/invalid-credential') {
          showMessage('Incorrect email or password');
        } else if (error.code === 'auth/invalid-email') {
          showMessage('Invalid email address');
        } else if (error.code === 'auth/network-request-failed') {
          showMessage('Network error. Please check your connection.');
        } else {
          showMessage(`Error: ${error.message}`);
        }
      }
    });
  } else {
    console.log('Login form not found');
  }
}

// = FORGOT PASSWORD 
export function setupForgotPassword() {
  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();

      if (!email) {
        showMessage('Please enter your email address');
        return;
      }

      try {
        const submitBtn = forgotForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        await sendPasswordResetEmail(auth, email);
        showMessage('Password reset email sent! Check your inbox.', 'success');
        
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 3000);

      } catch (error) {
        console.error('Password reset error:', error);
        if (error.code === 'auth/user-not-found') {
          showMessage('No account found with this email');
        } else if (error.code === 'auth/invalid-email') {
          showMessage('Invalid email address');
        } else if (error.code === 'auth/network-request-failed') {
          showMessage('Network error. Please check your connection.');
        } else {
          showMessage(`Error: ${error.message}`);
        }
        
        const submitBtn = forgotForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// ================ CHECK AUTH STATE ================
export function checkAuthState() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User is signed in:', user.uid);
      const userFullName = localStorage.getItem('userFullName');
      if (userFullName) {
        const welcomeElement = document.getElementById('welcomeText');
        if (welcomeElement) {
          welcomeElement.textContent = `Welcome, ${userFullName}`;
        }
      }
      
      // إخفاء أزرار Login/Register إذا كان المستخدم مسجلاً
      const loginBtn = document.querySelector('a[href="login.html"]');
      if (loginBtn) {
        loginBtn.style.display = 'none';
      }
    } else {
      console.log('User is signed out');
      // إظهار أزرار Login/Register
      const loginBtn = document.querySelector('a[href="login.html"]');
      if (loginBtn) {
        loginBtn.style.display = 'block';
      }
    }
  });
}

// ================ LOGOUT ================
export function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await auth.signOut();
        localStorage.removeItem('userFullName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userUID');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('rememberMe');
        window.location.href = 'login.html';
      } catch (error) {
        console.error('Logout error:', error);
        showMessage('Error during logout');
      }
    });
  }
}

// تهيئة التطبيق
console.log('Firebase initialized successfully');
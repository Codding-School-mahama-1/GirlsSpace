// firebase.js - Complete working version
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
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
const auth = getAuth(app);
const db = getFirestore(app);

console.log('✅ Firebase initialized successfully');

// دالة لعرض الرسائل
function showMessage(message, type = 'error') {
  console.log(`📢 ${type.toUpperCase()}: ${message}`);
  
  // Remove any existing messages
  const existingMessages = document.querySelectorAll('.custom-message');
  existingMessages.forEach(msg => msg.remove());
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `custom-message fixed top-4 left-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium text-center ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = 'z-index: 9999;';
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

// ================ SIGN UP ================
export function setupSignUp() {
  const signupForm = document.getElementById('signupForm');
  console.log('🔧 Setting up sign up...');
  
  if (signupForm) {
    console.log('✅ Sign up form found');
    
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('📝 Sign up form submitted');

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      console.log('📧 Form data:', { fullName, email, password: '***' });

      if (!fullName || !email || !password) {
        showMessage('Please fill all fields');
        return;
      }

      if (password.length < 6) {
        showMessage('Password should be at least 6 characters');
        return;
      }

      try {
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        // Create user in Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('✅ User created:', user.uid);
        
        // Split name
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Save user data to Firestore
        const userData = {
          fullName: fullName,
          firstName: firstName,
          lastName: lastName,
          email: email,
          role: 'user',
          createdAt: new Date().toISOString(),
          uid: user.uid
        };

        await setDoc(doc(db, "users", user.uid), userData);
        console.log('✅ User data saved to Firestore');
        
        showMessage('Account created successfully! Redirecting...', 'success');
        
        // Save to localStorage
        localStorage.setItem('userFullName', fullName);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userUID', user.uid);
        localStorage.setItem('userFirstName', firstName);
        localStorage.setItem('userRole', 'user');
        
        // Redirect to home page
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);

      } catch (error) {
        console.error('❌ Sign up error:', error);
        
        let errorMessage = 'Error creating account';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Email already in use!';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
        
        showMessage(errorMessage);
        
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  } else {
    console.error('❌ Sign up form not found!');
  }
}

// ================ SIGN IN ================
export function setupSignIn() {
  const loginForm = document.getElementById('loginForm');
  console.log('🔧 Setting up sign in...');
  
  if (loginForm) {
    console.log('✅ Login form found');
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('🔐 Login form submitted');

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('remember') ? document.getElementById('remember').checked : false;

      console.log('📧 Login data:', { email, password: '***', rememberMe });

      if (!email || !password) {
        showMessage('Please enter email and password');
        return;
      }

      try {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing In...';
        submitBtn.disabled = true;

        console.log('🔄 Attempting to sign in...');

        // Sign in user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('✅ User signed in:', user.uid);

        // Get user data from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('✅ User role:', userData.role);
          
          // Save to localStorage
          localStorage.setItem('userFullName', userData.fullName);
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('userUID', user.uid);
          localStorage.setItem('userFirstName', userData.firstName);
          localStorage.setItem('userRole', userData.role);
          
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }

          // Redirect based on role
          if (userData.role === 'admin') {
            showMessage(`Welcome Admin ${userData.firstName}! Redirecting to dashboard...`, 'success');
            setTimeout(() => {
              window.location.href = 'admin-dashboard.html';
            }, 2000);
          } else {
            showMessage(`Welcome back, ${userData.firstName}! Redirecting...`, 'success');
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 2000);
          }
        } else {
          showMessage('User data not found. Please contact support.', 'error');
        }

      } catch (error) {
        console.error('❌ Sign in error:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        
        let errorMessage = 'Error signing in';
        
        if (error.code === 'auth/user-not-found' || 
            error.code === 'auth/wrong-password' || 
            error.code === 'auth/invalid-credential') {
          errorMessage = 'Incorrect email or password';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection';
        } else if (error.code === 'auth/user-disabled') {
          errorMessage = 'This account has been disabled';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
        
        showMessage(errorMessage);
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  } else {
    console.error('❌ Login form not found!');
  }
}

// ================ FORGOT PASSWORD ================
export function setupForgotPassword() {
  const forgotForm = document.getElementById('forgotForm');
  console.log('🔧 Setting up forgot password...');
  
  if (forgotForm) {
    console.log('✅ Forgot password form found');
    
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('📧 Forgot password form submitted');

      const email = document.getElementById('email').value.trim();
      console.log('📨 Email:', email);

      if (!email) {
        showMessage('Please enter your email address');
        return;
      }

      // Basic email validation
      if (!email.includes('@')) {
        showMessage('Please enter a valid email address');
        return;
      }

      try {
        const submitBtn = forgotForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        console.log('🔄 Sending password reset email...');

        // Send password reset email
        await sendPasswordResetEmail(auth, email);
        
        console.log('✅ Password reset email sent successfully');
        showMessage('Password reset email sent! Check your inbox and spam folder.', 'success');
        
        // Reset form
        forgotForm.reset();
        
        // Redirect to login page after 5 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 5000);

      } catch (error) {
        console.error('❌ Password reset error:', error);
        
        let errorMessage = 'Error sending reset email';
        
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many requests. Please try again later';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
        
        showMessage(errorMessage);
        
        const submitBtn = forgotForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  } else {
    console.error('❌ Forgot password form not found!');
  }
}

// ================ CHECK AUTH STATE ================
export function checkAuthState() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ User is signed in:', user.uid);
        resolve(user);
      } else {
        console.log('❌ User is signed out');
        resolve(null);
      }
    });
  });
}

// ================ LOGOUT ================
export function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        localStorage.clear();
        window.location.href = 'login.html';
      } catch (error) {
        console.error('Logout error:', error);
        showMessage('Error during logout');
      }
    });
  }
}

// Export auth and db for other uses
export { auth, db };
// ================ ADMIN SIGN UP ================
export function setupAdminSignUp() {
  const adminSignupForm = document.getElementById('adminSignupForm');
  console.log('🔧 Setting up admin sign up...');
  
  if (adminSignupForm) {
    console.log('✅ Admin sign up form found');
    
    // Secret admin code (in production, this should be more secure)
    const ADMIN_SECRET_CODE = "GirlsSpaceAdmin2025";
    
    adminSignupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('👑 Admin sign up form submitted');

      const fullName = document.getElementById('adminFullName').value.trim();
      const email = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPassword').value;
      const secretCode = document.getElementById('adminSecretCode').value;

      console.log('📧 Admin form data:', { fullName, email, password: '***' });

      if (!fullName || !email || !password || !secretCode) {
        showMessage('Please fill all fields');
        return;
      }

      if (secretCode !== ADMIN_SECRET_CODE) {
        showMessage('Invalid admin secret code');
        return;
      }

      if (password.length < 6) {
        showMessage('Password should be at least 6 characters');
        return;
      }

      try {
        const submitBtn = adminSignupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Admin Account...';
        submitBtn.disabled = true;

        // Create admin user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('✅ Admin user created:', user.uid);
        
        // Split name
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Save admin data to Firestore
        const adminData = {
          fullName: fullName,
          firstName: firstName,
          lastName: lastName,
          email: email,
          role: 'admin',
          createdAt: new Date().toISOString(),
          uid: user.uid,
          permissions: ['manage_users', 'manage_content', 'view_reports', 'moderate']
        };

        // Save to users collection
        await setDoc(doc(db, "users", user.uid), {
          fullName: fullName,
          firstName: firstName,
          lastName: lastName,
          email: email,
          role: 'admin',
          createdAt: new Date().toISOString()
        });

        // Save to admins collection
        await setDoc(doc(db, "admins", user.uid), adminData);
        
        console.log('✅ Admin data saved to Firestore');
        
        showMessage('Admin account created successfully! Redirecting...', 'success');
        
        // Save to localStorage
        localStorage.setItem('userFullName', fullName);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userUID', user.uid);
        localStorage.setItem('userFirstName', firstName);
        localStorage.setItem('userRole', 'admin');
        
        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = 'admin-dashboard.html';
        }, 2000);

      } catch (error) {
        console.error('❌ Admin sign up error:', error);
        
        let errorMessage = 'Error creating admin account';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Email already in use!';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
        
        showMessage(errorMessage);
        
        const submitBtn = adminSignupForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  } else {
    console.error('❌ Admin sign up form not found!');
  }
}
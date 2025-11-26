// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc
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

// كود سري لإنشاء حسابات مدراء (يمكن تغييره)
const ADMIN_SECRET_CODE = "GIRLSSPACE2024";

// ================ USER SIGN UP ================
export function setupUserSignUp() {
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('User sign up form submitted');

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // تقسيم الاسم إلى firstName و lastName
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // حفظ بيانات المستخدم في Firestore مع دور "user"
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
        
        showMessage('Account created successfully! Redirecting...', 'success');
        
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem('userFullName', fullName);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userUID', user.uid);
        localStorage.setItem('userFirstName', firstName);
        localStorage.setItem('userRole', 'user');
        
        // الانتقال إلى الصفحة الرئيسية للمستخدمين
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);

      } catch (error) {
        console.error('User sign up error:', error);
        if (error.code === 'auth/email-already-in-use') {
          showMessage('Email already in use!');
        } else if (error.code === 'auth/weak-password') {
          showMessage('Password should be at least 6 characters');
        } else if (error.code === 'auth/invalid-email') {
          showMessage('Invalid email address');
        } else {
          showMessage(`Error: ${error.message}`);
        }
        
        // إعادة تفعيل الزر
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// ================ ADMIN SIGN UP ================
export function setupAdminSignUp() {
  const adminSignupForm = document.getElementById('adminSignupForm');
  if (adminSignupForm) {
    adminSignupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Admin sign up form submitted');

      const fullName = document.getElementById('adminFullName').value.trim();
      const email = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPassword').value;
      const secretCode = document.getElementById('adminSecretCode').value.trim();

      if (!fullName || !email || !password || !secretCode) {
        showMessage('Please fill all fields');
        return;
      }

      // التحقق من الكود السري
      if (secretCode !== ADMIN_SECRET_CODE) {
        showMessage('Invalid admin secret code');
        return;
      }

      try {
        // إضافة مؤشر تحميل
        const submitBtn = adminSignupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Admin Account...';
        submitBtn.disabled = true;

        // إنشاء المستخدم في Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // تقسيم الاسم إلى firstName و lastName
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // حفظ بيانات المدير في Firestore مع دور "admin"
        const adminData = {
          fullName: fullName,
          firstName: firstName,
          lastName: lastName,
          email: email,
          role: 'admin',
          createdAt: new Date().toISOString(),
          uid: user.uid,
          permissions: ['manage_users', 'view_reports', 'manage_content']
        };

        await setDoc(doc(db, "users", user.uid), adminData);
        
        showMessage('Admin account created successfully! Redirecting to dashboard...', 'success');
        
        // حفظ بيانات المدير في localStorage
        localStorage.setItem('userFullName', fullName);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userUID', user.uid);
        localStorage.setItem('userFirstName', firstName);
        localStorage.setItem('userRole', 'admin');
        
        // الانتقال إلى لوحة تحكم المدراء
        setTimeout(() => {
          window.location.href = 'admin-dashboard.html';
        }, 2000);

      } catch (error) {
        console.error('Admin sign up error:', error);
        if (error.code === 'auth/email-already-in-use') {
          showMessage('Email already in use!');
        } else if (error.code === 'auth/weak-password') {
          showMessage('Password should be at least 6 characters');
        } else if (error.code === 'auth/invalid-email') {
          showMessage('Invalid email address');
        } else {
          showMessage(`Error: ${error.message}`);
        }
        
        // إعادة تفعيل الزر
        const submitBtn = adminSignupForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// ================ SIGN IN (للمستخدمين والمدراء) ================
export function setupSignIn() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Login form submitted');

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('remember').checked;

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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // جلب بيانات المستخدم من Firestore للتحقق من الدور
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('User role:', userData.role);
          
          // حفظ بيانات المستخدم في localStorage
          localStorage.setItem('userFullName', userData.fullName);
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('userUID', user.uid);
          localStorage.setItem('userFirstName', userData.firstName);
          localStorage.setItem('userRole', userData.role);
          
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }

          // توجيه المستخدم بناءً على الدور
          if (userData.role === 'admin') {
            showMessage(`Welcome Admin ${userData.firstName}! Redirecting to dashboard...`, 'success');
            setTimeout(() => {
              window.location.href = 'admin-dashboard.html';
            },2000);
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
        } else {
          showMessage(`Error: ${error.message}`);
        }
      }
    });
  }
}

// ================ CHECK USER ROLE AND REDIRECT ================
export function checkUserRoleAndRedirect() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const currentPage = window.location.pathname.split('/').pop();
          
          // إذا كان المستخدم مديراً وهو في صفحة غير لوحة التحكم
          if (userData.role === 'admin' && !currentPage.includes('admin') && currentPage !== 'admin-dashboard.html') {
            window.location.href = 'admin-dashboard.html';
          }
          // إذا كان المستخدم عادي وهو في صفحة المدير
          else if (userData.role === 'user' && currentPage.includes('admin')) {
            window.location.href = 'index.html';
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    }
  });
}

// ================ CHECK ADMIN ACCESS ================
export function checkAdminAccess() {
  return new Promise(async (resolve, reject) => {
    const user = auth.currentUser;
    if (!user) {
      window.location.href = 'admin-dashboard.html';
      reject(new Error('No user logged in'));
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.role !== 'admin') {
          showMessage('Access denied. Admin privileges required.', 'error');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
          reject(new Error('User is not admin'));
          return;
        }
        resolve(userData);
      } else {
        reject(new Error('User data not found'));
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      reject(error);
    }
  });
}

// ================ GET ALL USERS (للمدراء فقط) ================
export async function getAllUsers() {
  try {
    await checkAdminAccess();
    
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

// ================ FORGOT PASSWORD ================
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

// ================ CHECK AUTH STATE ================
export function checkAuthState() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User is signed in:', user.uid);
      const userFullName = localStorage.getItem('userFullName');
      const userRole = localStorage.getItem('userRole');
      
      if (userFullName) {
        const welcomeElement = document.getElementById('welcomeText');
        if (welcomeElement) {
          welcomeElement.textContent = `Welcome, ${userFullName}${userRole === 'admin' ? ' (Admin)' : ''}`;
        }
      }
      
      // تحديث واجهة المستخدم بناءً على الدور
      updateUIForUserRole(userRole);
    } else {
      console.log('User is signed out');
    }
  });
}

// ================ UPDATE UI BASED ON USER ROLE ================
function updateUIForUserRole(userRole) {
  const loginBtn = document.querySelector('a[href="login.html"]');
  const adminLink = document.getElementById('adminLink');
  
  if (loginBtn) {
    loginBtn.style.display = 'none';
  }
  
  if (adminLink) {
    if (userRole === 'admin') {
      adminLink.style.display = 'block';
    } else {
      adminLink.style.display = 'none';
    }
  }
}

console.log('Firebase initialized successfully');


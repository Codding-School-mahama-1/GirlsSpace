// firebaseauth.js - UPDATED VERSION
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from "./firebase.js";

const auth = getAuth(app);

// Function to check authentication state
export function checkAuthState() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('✅ User is signed in:', user.email);
                updateUIForLoggedInUser(user);
                resolve(user);
            } else {
                console.log('❌ User is signed out');
                updateUIForLoggedOutUser();
                resolve(null);
            }
        });
    });
}

function updateUIForLoggedInUser(user) {
    // Update login button to profile button
    const loginButtons = document.querySelectorAll('a[href="./login.html"]');
    loginButtons.forEach(button => {
        button.innerHTML = '<i class="fas fa-user-circle mr-2"></i> My Profile';
        button.href = './profile.html';
        button.classList.remove('border-2', 'border-primary', 'text-primary');
        button.classList.add('bg-primary', 'text-white', 'px-4', 'py-2', 'rounded-full');
    });
    
    // Show profile link in navigation
    const profileLink = document.querySelector('a[href="./profile.html"]');
    if (profileLink) {
        profileLink.style.display = 'inline-block';
    }
    
    // Add logout button if not exists
    if (!document.getElementById('logoutBtn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'ml-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt mr-2"></i> Logout';
        logoutBtn.onclick = () => {
            signOut(auth).then(() => {
                window.location.href = './index.html';
            });
        };
        
        const nav = document.querySelector('.hidden.lg\\:flex.items-center.gap-6');
        if (nav) nav.appendChild(logoutBtn);
    }
}

function updateUIForLoggedOutUser() {
    // Update profile button to login button
    const profileButtons = document.querySelectorAll('a[href="./profile.html"]');
    profileButtons.forEach(button => {
        if (button.textContent.includes('Profile')) {
            button.innerHTML = 'Log In';
            button.href = './login.html';
            button.classList.remove('bg-primary', 'text-white', 'px-4', 'py-2');
            button.classList.add('border-2', 'border-primary', 'text-primary', 'px-3', 'py-1.5');
        }
    });
    
    // Remove logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.remove();
}

// Export logout function
export function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.href = './index.html';
            });
        });
    }
}
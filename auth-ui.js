// auth-ui.js - Simple UI updater
export function updateAuthUI(isLoggedIn, userData = null) {
    console.log('🎨 Updating auth UI:', isLoggedIn);
    
    if (isLoggedIn && userData) {
        // User is logged in
        const loginButtons = document.querySelectorAll('a[href="./login.html"]');
        loginButtons.forEach(button => {
            button.innerHTML = '<i class="fas fa-user-circle mr-2"></i> My Profile';
            button.href = './profile.html';
            button.classList.remove('border-2', 'border-primary', 'text-primary');
            button.classList.add('bg-primary', 'text-white', 'px-4', 'py-2', 'rounded-full');
        });
        
        // Show profile link in nav
        const navProfileLink = document.querySelector('.nav-link[href="./profile.html"]');
        if (navProfileLink) {
            navProfileLink.style.display = 'inline-block';
        }
    } else {
        // User is logged out
        const profileButtons = document.querySelectorAll('a[href="./profile.html"]');
        profileButtons.forEach(button => {
            if (button.textContent.includes('Profile')) {
                button.innerHTML = 'Log In';
                button.href = './login.html';
                button.classList.remove('bg-primary', 'text-white', 'px-4', 'py-2');
                button.classList.add('border-2', 'border-primary', 'text-primary', 'px-3', 'py-1.5');
            }
        });
        
        // Hide profile link in nav
        const navProfileLink = document.querySelector('.nav-link[href="./profile.html"]');
        if (navProfileLink) {
            navProfileLink.style.display = 'none';
        }
    }
}
// firebase.js - UPDATED VERSION WITH PROFILE FUNCTIONS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Firebase configuration - REPLACE WITH YOUR CONFIG
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
const storage = getStorage(app);

console.log('✅ Firebase initialized successfully');

// ================ USER PROFILE FUNCTIONS ================

// Get current user profile
export async function getCurrentUserProfile() {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ No user logged in');
    return null;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } else {
      console.log('❌ User document not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(profileData) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user logged in');
  }

  try {
    // Update in Firestore
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });

    // Update in Auth if displayName or photoURL changed
    if (profileData.displayName || profileData.photoURL) {
      await updateProfile(user, {
        displayName: profileData.displayName || user.displayName,
        photoURL: profileData.photoURL || user.photoURL
      });
    }

    console.log('✅ Profile updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    throw error;
  }
}

// Upload profile picture
export async function uploadProfilePicture(file, userId) {
  try {
    // Create storage reference
    const storageRef = ref(storage, `profile-pictures/${userId}/${Date.now()}_${file.name}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Profile picture uploaded:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading profile picture:', error);
    throw error;
  }
}

// Save user story
export async function saveUserStory(storyData) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user logged in');
  }

  try {
    const storyRef = await addDoc(collection(db, "stories"), {
      ...storyData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      status: 'published'
    });

    console.log('✅ Story saved with ID:', storyRef.id);
    return storyRef.id;
  } catch (error) {
    console.error('❌ Error saving story:', error);
    throw error;
  }
}

// Get user stories
export async function getUserStories(userId) {
  try {
    const storiesQuery = query(
      collection(db, "stories"),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(storiesQuery);
    const stories = [];
    
    querySnapshot.forEach((doc) => {
      stories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Found ${stories.length} stories for user ${userId}`);
    return stories;
  } catch (error) {
    console.error('❌ Error getting user stories:', error);
    throw error;
  }
}

// Get user achievements
export async function getUserAchievements(userId) {
  try {
    const achievementsQuery = query(
      collection(db, "achievements"),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(achievementsQuery);
    const achievements = [];
    
    querySnapshot.forEach((doc) => {
      achievements.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Found ${achievements.length} achievements for user ${userId}`);
    return achievements;
  } catch (error) {
    console.error('❌ Error getting user achievements:', error);
    throw error;
  }
}

// Get user progress
export async function getUserProgress(userId) {
  try {
    const progressRef = doc(db, "userProgress", userId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      return progressDoc.data();
    } else {
      // Create default progress if none exists
      const defaultProgress = {
        englishLanguage: 0,
        lifeSkills: 0,
        gbvPrevention: 0,
        digitalSkills: 0,
        lastUpdated: new Date().toISOString()
      };
      
      await setDoc(progressRef, defaultProgress);
      return defaultProgress;
    }
  } catch (error) {
    console.error('❌ Error getting user progress:', error);
    throw error;
  }
}

// Update user progress
export async function updateUserProgress(progressData) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user logged in');
  }

  try {
    const progressRef = doc(db, "userProgress", user.uid);
    await updateDoc(progressRef, {
      ...progressData,
      lastUpdated: new Date().toISOString()
    });

    console.log('✅ Progress updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating progress:', error);
    throw error;
  }
}

// Get user statistics
export async function getUserStatistics(userId) {
  try {
    // Get stories count
    const storiesQuery = query(
      collection(db, "stories"),
      where("userId", "==", userId)
    );
    const storiesSnapshot = await getDocs(storiesQuery);
    const storiesCount = storiesSnapshot.size;

    // Get chat messages count (you'll need to implement this based on your chat structure)
    const chatMessagesCount = 0; // Placeholder

    // Get completed programs count
    const programsQuery = query(
      collection(db, "userPrograms"),
      where("userId", "==", userId),
      where("completed", "==", true)
    );
    const programsSnapshot = await getDocs(programsQuery);
    const programsCount = programsSnapshot.size;

    // Get badges count
    const badgesQuery = query(
      collection(db, "userBadges"),
      where("userId", "==", userId)
    );
    const badgesSnapshot = await getDocs(badgesQuery);
    const badgesCount = badgesSnapshot.size;

    return {
      storiesCount,
      chatMessagesCount,
      programsCount,
      badgesCount
    };
  } catch (error) {
    console.error('❌ Error getting user statistics:', error);
    throw error;
  }
}

// ================ AUTH FUNCTIONS ================

// Sign up function
export function setupSignUp() {
  const signupForm = document.getElementById('signupForm');
  
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      if (!fullName || !email || !password) {
        showMessage('Please fill all fields');
        return;
      }
      
      try {
        // Create user in Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Split name
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Create user profile in Firestore
        const userData = {
          fullName,
          firstName,
          lastName,
          email,
          role: 'user',
          createdAt: new Date().toISOString(),
          bio: '',
          location: 'Mahama Refugee Camp',
          preferredLanguage: 'en'
        };
        
        await setDoc(doc(db, "users", user.uid), userData);
        
        // Update auth profile
        await updateProfile(user, {
          displayName: fullName
        });
        
        showMessage('Account created successfully!', 'success');
        
        // Save to localStorage
        localStorage.setItem('girlspaceUser', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: fullName,
          firstName: firstName,
          role: 'user'
        }));
        
        // Redirect to profile page
        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 1500);
        
      } catch (error) {
        console.error('Sign up error:', error);
        showMessage(error.message);
      }
    });
  }
}

// Sign in function
export function setupSignIn() {
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Save to localStorage
          localStorage.setItem('girlspaceUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: userData.fullName || user.email.split('@')[0],
            firstName: userData.firstName,
            role: userData.role,
            photoURL: userData.photoURL
          }));
          
          showMessage(`Welcome back, ${userData.firstName || user.email.split('@')[0]}!`, 'success');
          
          // Redirect based on role
          setTimeout(() => {
            if (userData.role === 'admin') {
              window.location.href = 'admin-dashboard.html';
            } else {
              window.location.href = 'profile.html';
            }
          }, 1500);
        }
        
      } catch (error) {
        console.error('Sign in error:', error);
        showMessage(error.message);
      }
    });
  }
}

// Logout function
export function logout() {
  return signOut(auth);
}

// Check auth state
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Show message function
function showMessage(message, type = 'error') {
  // Remove existing messages
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

// Export Firebase services
export { auth, db, storage };
// Add these to your existing firebase.js file

// Get user profile
export async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

// Create user profile after signup
export async function createUserProfileAfterSignup(userCredential, additionalData = {}) {
  const user = userCredential.user;
  
  const userProfile = {
    uid: user.uid,
    email: user.email,
    displayName: additionalData.fullName || user.email.split('@')[0],
    firstName: additionalData.firstName || '',
    lastName: additionalData.lastName || '',
    role: 'user',
    bio: '',
    location: 'Mahama Refugee Camp',
    photoURL: user.photoURL || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...additionalData
  };
  
  try {
    await setDoc(doc(db, "users", user.uid), userProfile);
    console.log('✅ User profile created');
    
    // Save to localStorage for quick access
    localStorage.setItem('girlspaceUser', JSON.stringify(userProfile));
    
    return userProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}
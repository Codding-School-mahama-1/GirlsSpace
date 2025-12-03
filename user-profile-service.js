// user-profile-service.js
import { 
  getAuth, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from "./firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);

// ========== GET USER PROFILE DATA ==========

// Method 1: Get current user's profile
export async function getCurrentUserProfile() {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ No user logged in');
      return null;
    }
    
    console.log('🔍 Getting profile for user:', user.uid);
    
    // Get user document from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ User profile found:', userData);
      
      return {
        uid: user.uid,
        email: user.email,
        ...userData
      };
    } else {
      console.log('⚠️ No profile document found, creating default...');
      
      // Create a default profile if doesn't exist
      const defaultProfile = {
        fullName: user.displayName || user.email.split('@')[0],
        firstName: user.displayName ? user.displayName.split(' ')[0] : 'User',
        lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
        email: user.email,
        role: 'user',
        bio: 'Welcome to GirlsSpace!',
        location: 'Mahama Refugee Camp',
        photoURL: user.photoURL || 'https://via.placeholder.com/150',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(userDocRef, defaultProfile);
      console.log('✅ Default profile created');
      
      return {
        uid: user.uid,
        email: user.email,
        ...defaultProfile
      };
    }
    
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    return null;
  }
}

// Method 2: Get user profile by UID (for admins)
export async function getUserProfileById(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } else {
      console.log('User not found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

// Method 3: Listen to real-time profile updates
export function onUserProfileChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await getCurrentUserProfile();
      callback(profile);
    } else {
      callback(null);
    }
  });
}

// ========== UPDATE USER PROFILE ==========

export async function updateUserProfile(profileData) {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user logged in');
    }
    
    console.log('📝 Updating profile for:', user.uid);
    
    const userDocRef = doc(db, "users", user.uid);
    
    await updateDoc(userDocRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Profile updated successfully');
    
    // Return the updated profile
    const updatedDoc = await getDoc(userDocRef);
    return {
      uid: user.uid,
      email: user.email,
      ...updatedDoc.data()
    };
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    throw error;
  }
}

// ========== CREATE USER PROFILE ==========

export async function createUserProfile(userId, userData) {
  try {
    const userDocRef = doc(db, "users", userId);
    
    const profileData = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: userData.role || 'user'
    };
    
    await setDoc(userDocRef, profileData);
    console.log('✅ User profile created for:', userId);
    
    return profileData;
  } catch (error) {
    console.error('❌ Error creating profile:', error);
    throw error;
  }
}

// ========== CHECK IF USER EXISTS ==========

export async function userExists(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user:', error);
    return false;
  }
}

// ========== GET USER STATISTICS ==========

export async function getUserStatistics(userId) {
  try {
    // You would need to query other collections based on your data structure
    // This is a template - modify based on your actual collections
    
    const stats = {
      storiesCount: 0,
      chatMessagesCount: 0,
      programsCompleted: 0,
      badgesEarned: 0,
      totalHours: 0
    };
    
    // Example: Get stories count
    // const storiesQuery = query(collection(db, "stories"), where("userId", "==", userId));
    // const storiesSnapshot = await getDocs(storiesQuery);
    // stats.storiesCount = storiesSnapshot.size;
    
    return stats;
  } catch (error) {
    console.error('Error getting user statistics:', error);
    return null;
  }
}

// ========== UTILITY FUNCTIONS ==========

export function getCurrentUserId() {
  const user = auth.currentUser;
  return user ? user.uid : null;
}

export function isUserLoggedIn() {
  return auth.currentUser !== null;
}
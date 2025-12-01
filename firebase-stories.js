// firebase-stories.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy, 
    serverTimestamp,
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات Firebase الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyD5K27SYd3NzV5FOtMtPZs_l8UhEUq42zc",
  authDomain: "sigin-b3aa1.firebaseapp.com",
  projectId: "sigin-b3aa1",
  storageBucket: "sigin-b3aa1.firebasestorage.app",
  messagingSenderId: "390069352394",
  appId: "1:390069352394:web:aa32d4a640b6f7fee54133",
  measurementId: "G-WF0H2KJN02"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// دالة لإضافة قصة جديدة
const addStory = async (storyData) => {
    try {
        const docRef = await addDoc(collection(db, "stories"), {
            ...storyData,
            type: "story",
            status: "approved", // غيرت لـ approved لتظهر مباشرة
            createdAt: serverTimestamp(),
            likes: 0,
            views: 0
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding story: ", error);
        return { success: false, error: error.message };
    }
};

// دالة لجلب جميع القصص
const getStories = async () => {
    try {
        const storiesQuery = query(
            collection(db, "stories"), 
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(storiesQuery);
        
        const stories = [];
        querySnapshot.forEach((doc) => {
            stories.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return { success: true, stories };
    } catch (error) {
        console.error("Error getting stories: ", error);
        return { success: false, error: error.message };
    }
};

// دالة للاستماع للتحديثات الفورية
const listenToStories = (callback) => {
    const storiesQuery = query(
        collection(db, "stories"), 
        orderBy("createdAt", "desc")
    );
    
    return onSnapshot(storiesQuery, (snapshot) => {
        const stories = [];
        snapshot.forEach((doc) => {
            stories.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(stories);
    });
};

// دالة لجلب القصص المعتمدة فقط
const getApprovedStories = async () => {
    try {
        const storiesQuery = query(
            collection(db, "stories"), 
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(storiesQuery);
        
        const stories = [];
        querySnapshot.forEach((doc) => {
            const story = doc.data();
            // عرض جميع القصص (غيرت الشرط)
            stories.push({
                id: doc.id,
                ...story
            });
        });
        
        return { success: true, stories };
    } catch (error) {
        console.error("Error getting approved stories: ", error);
        return { success: false, error: error.message };
    }
};

// تصدير الدوال للاستخدام في الصفحة الرئيسية
export { addStory, getStories, listenToStories, getApprovedStories, db };
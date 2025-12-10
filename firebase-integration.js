// في ملف مشترك (مثل firebase-integration.js)
async function syncCourseProgressToFirebase(userId, courseData) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    const courseUpdate = {
      courses: {
        english_zero: {
          ...courseData,
          lastSynced: serverTimestamp(),
          overallProgress: calculateOverallProgress(courseData.lessons)
        }
      }
    };
    
    if (userSnap.exists()) {
      await updateDoc(userRef, courseUpdate);
    } else {
      await setDoc(userRef, {
        ...courseUpdate,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        createdAt: serverTimestamp()
      });
    }
    
    console.log("✅ Course progress synced to Firebase");
  } catch (error) {
    console.error("Error syncing course progress:", error);
  }
}

// دالة لتحميل التقدم من Firebase
async function loadCourseProgressFromFirebase(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const courseProgress = userData.courses?.english_zero;
      
      if (courseProgress) {
        // تحديث localStorage
        localStorage.setItem(`course_progress_${userId}`, JSON.stringify(courseProgress));
        
        // إرجاع البيانات
        return courseProgress;
      }
    }
  } catch (error) {
    console.error("Error loading course progress:", error);
  }
  return null;
}
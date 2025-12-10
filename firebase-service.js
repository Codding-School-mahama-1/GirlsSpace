// في نهاية firebase-service.js أضف:
export class EnglishCourseManager {
  constructor(userId) {
    this.userId = userId;
    this.courseId = 'english_zero';
  }

  // تحديث تقدم المستخدم في الدورة
  async updateLessonProgress(lessonId, progressData) {
    const userRef = doc(db, "users", this.userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // إنشاء مستند المستخدم إذا لم يكن موجوداً
      await setDoc(userRef, {
        courses: {
          [this.courseId]: {
            lessons: {
              [lessonId]: progressData
            },
            overallProgress: 4, // 4% لكل درس مكتمل
            lastUpdated: Timestamp.now()
          }
        }
      });
    } else {
      // تحديث البيانات الموجودة
      const userData = userSnap.data();
      const currentLessons = userData.courses?.[this.courseId]?.lessons || {};
      
      await updateDoc(userRef, {
        [`courses.${this.courseId}.lessons.${lessonId}`]: progressData,
        [`courses.${this.courseId}.overallProgress`]: this.calculateOverallProgress({
          ...currentLessons,
          [lessonId]: progressData
        }),
        [`courses.${this.courseId}.lastUpdated`]: Timestamp.now()
      });
    }
  }

  // احتساب التقدم الكلي
  calculateOverallProgress(lessons) {
    const totalLessons = 25;
    const completedLessons = Object.values(lessons).filter(
      lesson => lesson.completed && (lesson.lessonId === 1 || lesson.quizPassed)
    ).length;
    
    return Math.round((completedLessons / totalLessons) * 100);
  }

  // الحصول على تقدم المستخدم
  async getUserProgress() {
    const userRef = doc(db, "users", this.userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data().courses?.[this.courseId] || {
        lessons: {},
        overallProgress: 0,
        lastUpdated: null
      };
    }
    
    return {
      lessons: {},
      overallProgress: 0,
      lastUpdated: null
    };
  }

  // تحديث الشهادة
  async updateCertificate(certificateData) {
    const userRef = doc(db, "users", this.userId);
    
    await updateDoc(userRef, {
      [`courses.${this.courseId}.certificate`]: {
        ...certificateData,
        issuedAt: Timestamp.now()
      },
      achievements: arrayUnion("english_course_completed")
    });
  }
}
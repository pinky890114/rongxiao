import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 您的 Firebase 設定檔
const firebaseConfig = {
  apiKey: "AIzaSyAPM9_ZU3dmXnFl05lYPC0LkjsmRNg6Kmc",
  authDomain: "rongxi-3288d.firebaseapp.com",
  projectId: "rongxi-3288d",
  storageBucket: "rongxi-3288d.firebasestorage.app",
  messagingSenderId: "783208604630",
  appId: "1:783208604630:web:dd4bb607b855380e2dfa77",
  measurementId: "G-T3KMXERH7D"
};

let app;
let db: any;

try {
    // 檢查是否有必要的設定，避免初始化失敗
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized successfully");
    } else {
        console.warn("Firebase config missing. Using local/mock data.");
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

export { db };
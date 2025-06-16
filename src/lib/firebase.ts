// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
  // apiKey: 'AIzaSyC_MR9EknQ8CbCtMVENf4v_kwbfbPvzYlY',
  // authDomain: 'u-agent-fce30.firebaseapp.com',
  // projectId: 'u-agent-fce30',
  // storageBucket: 'u-agent-fce30.firebasestorage.app',
  // messagingSenderId: '653820926347',
  // appId: '1:653820926347:web:eb73f9c0ea065ab3e2378e',
  // measurementId: 'G-4BJDS1GV92',
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Analytics (only in browser environment)
// let analytics
// if (typeof window !== 'undefined') {
//   analytics = getAnalytics(app)
// }

// 使用标准的 getFirestore
const db = getFirestore(app)

const storage = getStorage(app)

// Connect to Firestore emulator in development
// if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080)
//     // connectStorageEmulator(storage, 'localhost', 9199) // 添加这行
//   } catch (error) {
//     // Emulator already connected or other connection error
//     console.log('Firestore emulator connection:', error)
//   }
// }

const uploadFile = async (
  file: File,
  userId: string,
  recordId: string,
  timestamp: string
) => {
  const fileRef = ref(
    storage,
    `users/${userId}/records/original/${timestamp}_${recordId}_${file.name}`
  )
  const snapshot = await uploadBytes(fileRef, file)
  const downloadUrl = await getDownloadURL(snapshot.ref)

  // 构造完整的 GCS URI
  const gcsUri = `gs://${snapshot.ref.bucket}/${snapshot.ref.fullPath}`

  return { path: snapshot.ref.fullPath, downloadUrl, gcsUri }
}

export { app, firebaseConfig, db, storage, uploadFile }

import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBgnTeU_c2XvDFyifu5JG-3DxtoGBM9roU",
  authDomain: "waffer-741af.firebaseapp.com",
  projectId: "waffer-741af",
  storageBucket: "waffer-741af.firebasestorage.app",
  messagingSenderId: "468206603479",
  appId: "1:468206603479:web:00c83b7e55a9bde2503492"
};

const app = initializeApp(firebaseConfig)
export const DB = getFirestore(app)
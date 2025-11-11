import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export default firebase;

export const sendFirebaseOtp = async (mobile) => {
  try {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
        size: "invisible",
        callback: () => console.log("reCAPTCHA verified ✅"),
      });
    }

    const appVerifier = window.recaptchaVerifier;
    const phoneNumber = `+91${mobile}`;
    const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);

    console.log("OTP sent to:", phoneNumber);
    return confirmationResult;
  } catch (error) {
    console.error("Firebase OTP Error:", error.message);
    throw new Error(error.message || "Failed to send OTP");
  }
};

// 🔹 Verify OTP
export const verifyFirebaseOtp = async (confirmationResult, otp) => {
  try {
    const result = await confirmationResult.confirm(otp);
    const idToken = await result.user.getIdToken();
    console.log("✅ OTP verified for:", result.user.phoneNumber);
    return idToken;
  } catch (error) {
    console.error("OTP verification failed ❌:", error.message);
    throw new Error("Invalid or expired OTP");
  }
};
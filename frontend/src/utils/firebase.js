import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBh_i4kHaL8UDEvPUze-B-PPo4LohKgBpQ",
  authDomain: "tata1mgc.firebaseapp.com",
  projectId: "tata1mgc",
  storageBucket: "tata1mgc.firebasestorage.app",
  messagingSenderId: "526844759275",
  appId: "1:526844759275:web:8e4a7e637b8a74a62d02ae",
  measurementId: "G-D772YK36T3"
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
// src/utils/api.js
// DEV MOCK API for OTP flows — swap out for real axios calls when backend is ready.

const USE_MOCK = import.meta.env.VITE_USE_MOCK_OTP === "true" || true; // set false when connecting real backend

// simple in-memory store (or sessionStorage)
const otpStore = {}; // { [email]: otp }

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const otpLoginAPI = {
  sendOtp: async (email) => {
    if (!USE_MOCK) throw new Error("Mock disabled");
    const otp = genOtp();
    otpStore[email] = otp;
    // also store in sessionStorage for persistence if you reload
    sessionStorage.setItem(`mock_otp_${email}`, otp);
    console.log(`[MOCK OTP] sendOtp to ${email}: ${otp}`); // dev: check console
    // return otp so tests can read it (only in dev)
    return Promise.resolve({ data: { message: "OTP sent (mock)", otp } });
  },

  verifyOtp: async (email, otp) => {
    if (!USE_MOCK) throw new Error("Mock disabled");
    // check from in-memory first then sessionStorage
    const stored = otpStore[email] || sessionStorage.getItem(`mock_otp_${email}`);
    await new Promise((r) => setTimeout(r, 600));
    if (!stored) {
      const err = new Error("OTP expired or not sent");
      err.response = { data: { message: "OTP expired or not sent" } };
      throw err;
    }
    if (String(otp) === String(stored) || String(otp) === "000000") {
      // accepted: allow "000000" as a universal test bypass if you want
      const user = { email };
      const token = "mock-jwt-token";
      // clear used otp
      delete otpStore[email];
      sessionStorage.removeItem(`mock_otp_${email}`);
      return Promise.resolve({ data: { user, token } });
    } else {
      const err = new Error("Invalid OTP");
      err.response = { data: { message: "Invalid OTP" } };
      throw err;
    }
  },
};

export const otpSignupAPI = {
  sendOtp: async (email) => {
    if (!USE_MOCK) throw new Error("Mock disabled");
    const otp = genOtp();
    otpStore[email] = otp;
    sessionStorage.setItem(`mock_otp_${email}`, otp);
    console.log(`[MOCK OTP] signup sendOtp to ${email}: ${otp}`);
    return Promise.resolve({ data: { message: "OTP sent (mock)", otp } });
  },

  verifyOtp: async (email, otp) => {
    if (!USE_MOCK) throw new Error("Mock disabled");
    const stored = otpStore[email] || sessionStorage.getItem(`mock_otp_${email}`);
    await new Promise((r) => setTimeout(r, 600));
    if (String(otp) === String(stored) || otp === "000000") {
      // verified
      delete otpStore[email];
      sessionStorage.removeItem(`mock_otp_${email}`);
      return Promise.resolve({ data: { message: "OTP verified (mock)" } });
    } else {
      const err = new Error("Invalid OTP");
      err.response = { data: { message: "Invalid OTP" } };
      throw err;
    }
  },

  completeSignup: async (data) => {
    if (!USE_MOCK) throw new Error("Mock disabled");
    // pretend we create a user and return token
    await new Promise((r) => setTimeout(r, 800));
    const user = { email: data.email, name: data.name, role: data.role || "patient" };
    const token = "mock-jwt-token";
    // optionally persist to localStorage for dev
    localStorage.setItem("mock_user", JSON.stringify(user));
    console.log("[MOCK] Signup complete:", user);
    return Promise.resolve({ data: { user, token } });
  },
};

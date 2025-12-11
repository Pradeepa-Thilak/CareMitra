// src/contexts/AppointmentContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // if uuid isn't installed, use simple Date.now fallback

export const AppointmentContext = createContext();

const STORAGE_KEY = "caremitra_appointments_v1";

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // initial load from localStorage (mock DB)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setAppointments(JSON.parse(raw));
      } else {
        // seed with a couple of mock appointments (optional)
        const seed = [
          {
            id: String(Date.now() - 86400000),
            doctor: { id: "d1", name: "Dr. Asha Kumar", specialist: "General Physician" },
            date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
            time: "10:30",
            reason: "Regular checkup",
            status: "completed",
            createdAt: Date.now() - 86400000,
          },
          {
            id: String(Date.now() + 86400000),
            doctor: { id: "d2", name: "Dr. Ramesh Iyer", specialist: "Cardiologist" },
            date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            time: "15:00",
            reason: "Chest pain evaluation",
            status: "confirmed",
            createdAt: Date.now(),
          },
        ];
        setAppointments(seed);
      }
    } catch (err) {
      console.warn("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch (err) {
      console.warn("Failed to persist appointments", err);
    }
  }, [appointments]);

  // book an appointment
  const bookAppointment = (payload) => {
    // payload: { doctor, date, time, reason, optionally status }
    const id = (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID)
      ? window.crypto.randomUUID()
      : uuidv4?.() ?? String(Date.now());

    const newAppt = {
      id,
      doctor: payload.doctor,
      date: payload.date,
      time: payload.time,
      reason: payload.reason ?? "",
      status: payload.status ?? "pending", // pending | confirmed | cancelled | completed
      createdAt: Date.now(),
    };

    setAppointments((prev) => [newAppt, ...prev]);
    return newAppt;
  };

  const cancelAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
    );
  };

  const removeAppointment = (id) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const getAppointmentById = (id) => {
    return appointments.find((a) => a.id === id);
  };

  const value = {
    loading,
    appointments,
    bookAppointment,
    cancelAppointment,
    removeAppointment,
    getAppointmentById,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => useContext(AppointmentContext);

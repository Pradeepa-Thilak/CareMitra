// src/hooks/useAppointments.js
import { useContext, useMemo } from "react";
import { AppointmentContext } from "../contexts/AppointmentContext";

/**
 * useAppointments
 * Lightweight hook wrapper around AppointmentContext that provides:
 * - convenient selectors: upcoming, past, byStatus, byDoctor
 * - direct access to context methods: bookAppointment, cancelAppointment, removeAppointment, getAppointmentById
 *
 * NOTE: AppointmentContext must be mounted (AppointmentProvider).
 */
export const useAppointments = () => {
  const ctx = useContext(AppointmentContext);

  if (!ctx) {
    throw new Error(
      "useAppointments must be used within an AppointmentProvider. Wrap your app with <AppointmentProvider>."
    );
  }

  const {
    loading,
    appointments = [],
    bookAppointment,
    cancelAppointment,
    removeAppointment,
    getAppointmentById,
  } = ctx;

  // derive upcoming vs past using appointment.date + time
  const { upcoming = [], past = [], byStatus, counts } = useMemo(() => {
    const now = new Date();

    const upcomingAcc = [];
    const pastAcc = [];
    const statusMap = {}; // status -> array
    const doctorMap = {}; // doctorId -> array

    appointments.forEach((a) => {
      // normalize date/time -> Date object (best-effort)
      let apptDate = null;
      try {
        // if time given, combine; else use midnight
        const dateStr = a.date ?? null;
        const timeStr = a.time ?? "00:00";
        if (dateStr) {
          // dateStr expected in YYYY-MM-DD
          apptDate = new Date(`${dateStr}T${timeStr}`);
          if (isNaN(apptDate.getTime())) {
            // fallback: try Date(a.date)
            apptDate = new Date(a.date);
          }
        } else {
          apptDate = new Date(a.createdAt ?? Date.now());
        }
      } catch (e) {
        apptDate = new Date(a.createdAt ?? Date.now());
      }

      const isPast = apptDate.getTime() < now.getTime();
      if (isPast) pastAcc.push(a);
      else upcomingAcc.push(a);

      const st = (a.status ?? "pending").toLowerCase();
      if (!statusMap[st]) statusMap[st] = [];
      statusMap[st].push(a);

      const did = a.doctor?.id ?? a.doctor?._id ?? a.doctor?.doctorId ?? "unknown";
      if (!doctorMap[did]) doctorMap[did] = [];
      doctorMap[did].push(a);
    });

    const countsObj = {
      total: appointments.length,
      upcoming: upcomingAcc.length,
      past: pastAcc.length,
      byStatus: Object.fromEntries(Object.entries(statusMap).map(([k, v]) => [k, v.length])),
    };

    return {
      upcoming: upcomingAcc,
      past: pastAcc,
      byStatus: statusMap,
      byDoctor: doctorMap,
      counts: countsObj,
    };
  }, [appointments]);

  // helpers
  const getByDoctor = (doctorId) => {
    if (!doctorId) return [];
    return appointments.filter(
      (a) => (a.doctor?.id ?? a.doctor?._id ?? a.doctor?.doctorId) === doctorId
    );
  };

  const getByStatus = (status) => {
    if (!status) return [];
    const s = status.toLowerCase();
    return appointments.filter((a) => (a.status ?? "pending").toLowerCase() === s);
  };

  return {
    // raw
    loading,
    appointments,

    // derived lists
    upcoming,
    past,

    // counts and maps
    counts,

    // selectors
    getByDoctor,
    getByStatus,
    getAppointmentById,

    // context actions
    bookAppointment,
    cancelAppointment,
    removeAppointment,
  };
};

export default useAppointments;

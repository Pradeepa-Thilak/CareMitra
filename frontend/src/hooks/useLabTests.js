// src/hooks/useLabTests.js
import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "./useAuth";

/**
 * useLabTests - fetches lab tests assigned to the current lab staff
 * options: { autoRefreshInterval: number (ms) } — optional
 */
export default function useLabTests({ autoRefreshInterval = 0 } = {}) {
  const { user, token } = useAuth(); // adjust if your useAuth exposes differently
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTests = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // endpoint assumed: GET /labtests/assigned?labStaffId=<id>
      const res = await api.get("/labtests/assigned", {
        params: { labStaffId: user.id },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setTests(res.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
    let timer;
    if (autoRefreshInterval > 0) {
      timer = setInterval(fetchTests, autoRefreshInterval);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { tests, loading, error, refresh: fetchTests, setTests };
}

// src/components/product/ProductSearchBarNav.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

/**
 * Lightweight, independent search bar intended ONLY for Navbar usage.
 * - Keeps its own state (won't interfere with medicines page)
 * - Supports items (mock) + remote API via searchAPI prop
 *
 * Props:
 * - placeholder (string)
 * - searchAPI (function)  -> should be productAPI.getAll
 * - items (array)         -> optional mock/local data
 * - mode: "auto" | "local" | "remote"
 */
const ProductSearchBarNav = ({
  placeholder = "Search medicines, brands, symptoms...",
  searchAPI = null,
  items = null,
  mode = "auto",
  minChars = 2,
  debounceMs = 250,
  maxSuggestions = 6,
}) => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sugs, setSugs] = useState([]);
  const [focused, setFocused] = useState(-1);
  const navRef = useRef(null);
  const controllerRef = useRef(null);
  const navigate = useNavigate();

  const filterLocal = (term) => {
    if (!items || !Array.isArray(items)) return [];
    const low = term.toLowerCase();
    return items.filter(it => (it.name || "").toLowerCase().includes(low)).slice(0, maxSuggestions);
  };

  const dedupe = (local = [], remote = []) => {
    const out = [];
    const seen = new Set();
    const push = (it) => {
      const key = it.id != null ? `id:${it.id}` : `name:${(it.name||"").toLowerCase()}`;
      if (!seen.has(key)) { seen.add(key); out.push(it); }
    };
    local.forEach(push);
    remote.forEach(push);
    return out.slice(0, maxSuggestions);
  };

  useEffect(() => {
    if (q.trim().length < minChars) {
      setSugs([]);
      setLoading(false);
      return;
    }

    // abort previous
    if (controllerRef.current) {
      try { controllerRef.current.abort(); } catch(e) {}
      controllerRef.current = null;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        if (mode === "local") {
          const local = filterLocal(q);
          setSugs(local);
          setOpen(true);
          setLoading(false);
          return;
        }

        // show local immediately if auto
        const localNow = (mode === "auto" && items) ? filterLocal(q) : [];

        if (localNow.length > 0) {
          setSugs(localNow);
          setOpen(true);
        } else {
          setSugs([]);
          setOpen(true);
        }

        // remote call only if searchAPI provided and mode != local
        if (searchAPI && mode !== "local") {
          const res = await searchAPI({ search: q }, { signal: controller.signal });
          // productAPI.getAll usually returns axios response: { data: [...] }
          const arr = res?.data ?? (Array.isArray(res) ? res : []);
          const merged = mode === "auto" ? dedupe(localNow, arr) : arr.slice(0, maxSuggestions);
          setSugs(merged);
        }

        setLoading(false);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Navbar search error:", err);
        // fallback to local
        const local = filterLocal(q);
        setSugs(local);
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      try { controller.abort(); } catch (e) {}
    };
  }, [q, items, searchAPI, mode, debounceMs, minChars, maxSuggestions]);

  // outside click / escape
  useEffect(() => {
    const onDoc = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(-1);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false); setFocused(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const submitSearch = (term) => {
    const t = (term || q).trim();
    if (!t) return;
    setOpen(false);
    setQ("");
    navigate(`/search?q=${encodeURIComponent(t)}`);
  };

  const selectItem = (item) => {
    if (!item) return;
    if (item.slug) navigate(`/product/${item.slug}`);
    else if (item.id) navigate(`/product/${item.id}`);
    else navigate(`/search?q=${encodeURIComponent(item.name)}`);
    setOpen(false);
    setQ("");
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setFocused(i => Math.min(i + 1, sugs.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocused(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focused >= 0 && sugs[focused]) selectItem(sugs[focused]);
      else submitSearch();
    }
  };

  useEffect(() => {
    if (focused < 0) return;
    const el = document.getElementById(`nav-sug-${focused}`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [focused]);

  return (
    <div ref={navRef} className="relative w-full">
      <div className="flex items-center bg-white text-gray-800 rounded-full px-3 py-1 shadow-sm">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setFocused(-1); }}
          onFocus={() => { if (sugs.length > 0) setOpen(true); }}
          onKeyDown={onKeyDown}
          type="search"
          placeholder={placeholder}
          aria-label="Search products"
          className="w-full bg-transparent outline-none text-sm placeholder-gray-500"
        />
        <button onClick={() => submitSearch()} aria-label="Search" className="p-1 rounded-full hover:bg-gray-100 transition">
          <Search size={16} />
        </button>
      </div>

      <div
        role="listbox"
        aria-expanded={open}
        className={`absolute left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg overflow-auto max-h-56 transition-all ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {loading && <div className="p-2 text-sm text-gray-500">Searching...</div>}

        {!loading && sugs.length === 0 && q.trim().length >= minChars && (
          <div className="p-2 text-sm text-gray-500">No results</div>
        )}

        {!loading && sugs.map((s, idx) => (
          <button
            id={`nav-sug-${idx}`}
            key={s.id ?? `${s.name}-${idx}`}
            onMouseDown={(e) => { e.preventDefault(); selectItem(s); }}
            onMouseEnter={() => setFocused(idx)}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
              focused === idx ? "bg-gray-50" : ""
            }`}
          >
            <div className="truncate">{s.name}</div>
            {s.brand && <div className="text-xs text-gray-400 ml-2">{s.brand}</div>}
          </button>
        ))}

        {!loading && q.trim().length >= minChars && (
          <div className="border-t border-gray-100">
            <button
              onMouseDown={(e) => { e.preventDefault(); submitSearch(q); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-sky-700"
            >
              View all results for "{q}"
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearchBarNav;

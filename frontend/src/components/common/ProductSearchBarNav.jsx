// src/components/product/ProductSearchBarNav.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

/**
 * Navbar-only search bar
 * - works with mock data + remote searchAPI.basic()
 *
 * Props:
 * - placeholder
 * - mode = auto | local | remote
 * - searchAPI(queryString)  → must return axios response { data: [] }
 * - items (mock data)
 */
const ProductSearchBarNav = ({
  placeholder = "Search...",
  mode = "auto",
  searchAPI = null,
  items = null,
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
  const controller = useRef(null);
  const navigate = useNavigate();

  // ---------- Local mock filter ----------
  const filterLocal = (keyword) => {
    if (!items) return [];
    const term = keyword.toLowerCase();
    return items
      .filter((it) => it.name.toLowerCase().includes(term))
      .slice(0, maxSuggestions);
  };

  // ---------- Merge (local + remote) ----------
  const mergeDedupe = (localArr, remoteArr) => {
    const map = new Map();
    [...localArr, ...remoteArr].forEach((item) => {
      const key = item.id ?? item.name.toLowerCase();
      if (!map.has(key)) map.set(key, item);
    });
    return Array.from(map.values()).slice(0, maxSuggestions);
  };

  // ---------- SEARCH LOGIC ----------
  useEffect(() => {
    const keyword = q.trim();
    if (keyword.length < minChars) {
      setSugs([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    // abort prev request
    if (controller.current?.cancel) controller.current.cancel();

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        let local = [];

        if (mode === "auto" && items) {
          local = filterLocal(keyword);
          setSugs(local);
          setOpen(true);
        }

        if (mode === "local") {
          const onlyLocal = filterLocal(keyword);
          if (!cancelled) {
            setSugs(onlyLocal);
            setLoading(false);
            setOpen(true);
          }
          return;
        }

        // Remote API (your /search?q=)
        if (searchAPI && (mode === "auto" || mode === "remote")) {
          const res = await searchAPI(keyword); // << uses searchAPI.basic()
          
          const remoteArr = Array.isArray(res.data)
            ? res.data
            : [];

          const finalList =
            mode === "auto"
              ? mergeDedupe(local, remoteArr)
              : remoteArr.slice(0, maxSuggestions);

          if (!cancelled) {
            setSugs(finalList);
            setLoading(false);
            setOpen(true);
          }
        }
      } catch (err) {
        console.error("Navbar search error:", err);
        if (!cancelled) {
          const fallback = items ? filterLocal(keyword) : [];
          setSugs(fallback);
          setLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, mode, items, searchAPI, minChars, debounceMs, maxSuggestions]);

  // ---------- Outside click ----------
  useEffect(() => {
    const handle = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(-1);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ---------- Navigation ----------
  const selectItem = (item) => {
    if (item.slug) navigate(`/product/${item.slug}`);
    else if (item.id) navigate(`/product/${item.id}`);
    else navigate(`/search?q=${item.name}`);

    setQ("");
    setOpen(false);
  };

  const submitSearch = () => {
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    // 👇 Clear input
    setQ("");

    // 👇 Close dropdown
    setOpen(false);
    setFocused(-1);
  };

  // ---------- Keyboard navigation ----------
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setFocused((i) => Math.min(i + 1, sugs.length - 1));
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      setFocused((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (focused >= 0 && sugs[focused]) selectItem(sugs[focused]);
      else submitSearch();
    }
  };

  return (
    <div ref={navRef} className="relative w-full">
      <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
        <input
          type="text"
          value={q}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
          onChange={(e) => {
            setQ(e.target.value);
            setFocused(-1);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => sugs.length && setOpen(true)}
        />


        <button className="p-1" onClick={submitSearch}>
          <Search size={16} />
        </button>
      </div>

      {/* Suggestions */}
      {open && (
        <div className="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow-md max-h-60 overflow-auto z-50">
          {loading && (
            <div className="p-2 text-gray-500 text-sm">Searching...</div>
          )}

          {!loading &&
            sugs.map((s, i) => (
              <div
                key={s.id ?? s.name + i}
                id={`nav-item-${i}`}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                  focused === i ? "bg-gray-100" : ""
                }`}
                onMouseDown={() => selectItem(s)}
                onMouseEnter={() => setFocused(i)}
              >
                {s.name}
              </div>
            ))}

          {!loading && sugs.length === 0 && q.length >= minChars && (
            <div className="p-2 text-sm text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearchBarNav;

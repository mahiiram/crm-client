import React, { useState, useEffect, useRef } from "react";
import { Moon, Sun, User, PlusCircle, LogOut, Settings, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);

  // Toggle dark mode
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowDropdown(true);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const [contactsRes] = await Promise.all([
        axios.get(`/api/contacts/?search=${search}`, { headers }),
        // Add opportunities search here if needed
      ]);

      setResults([...contactsRes.data.map((item) => ({ ...item, type: "Contact" }))]);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    }

    setLoading(false);
  };

  return (
    <nav className="relative w-full bg-white dark:bg-gray-900 shadow-sm px-6 py-3 flex justify-between items-center z-50 ">
      {/* Search Box */}
      <div className="relative w-96">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts or opportunities..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring"
          />
          <button
            type="submit"
            className="p-2 bg-green-700 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
            disabled={loading}
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </form>

        {/* Dropdown with search results */}
        {showDropdown && results.length > 0 && (
          <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50">
            <ul className="max-h-60 overflow-auto">
              {results.map((item, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowDropdown(false);
                  }}
                >
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    <strong>{item.type}</strong>: {item.firstName} {item.lastName}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-9 h-9 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300"
        >
          <User size={20} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-50">
            <div className="px-4 py-2 text-gray-600 dark:text-gray-300 font-semibold">Account</div>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
              onClick={() => navigate("/profile")}
            >
              <User size={16} /> Profile
            </button>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
              onClick={() => navigate("/preferences")}
            >
              <Settings size={16} /> Preferences
            </button>
            <hr className="my-1 border-t dark:border-gray-700" />
            <button
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
              onClick={() => navigate("/register")}
            >
              <PlusCircle size={16} /> Create New User
            </button>
            <hr className="my-1 border-t dark:border-gray-700" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 text-sm"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Selected contact detail preview */}
      {selectedItem && selectedItem.type === "Contact" && (
        <div className="absolute left-1/2 transform -translate-x-1/2 top-24 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-lg p-4 z-40">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {selectedItem.firstName} {selectedItem.lastName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Email: {selectedItem.email || "N/A"}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Phone: {selectedItem.phone || "N/A"}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Position: {selectedItem.position || "N/A"}</p>
        </div>
      )}
    </nav>
  );
}

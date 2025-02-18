import { useState, useEffect, useRef } from "react";
import apiClient from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const EmailAutocomplete = ({ onSelect, excludeEmails = [] }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/users/search?query=${query}`);
        const filteredSuggestions = response.data.filter(
          (user) => !excludeEmails.includes(user.email)
        );
        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, excludeEmails]);

  // Handle clicking outside of the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (email) => {
    setQuery(email); // Set the input value to the selected email
    onSelect(email);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={inputRef}>
      <input
        type="email"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Enter email address"
      />

      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200"
          >
            {loading ? (
              <div className="p-2 text-gray-500 text-center">Loading...</div>
            ) : (
              suggestions.map((user) => (
                <div
                  key={user._id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(user.email)}
                >
                  <div className="font-medium text-gray-800">{user.email}</div>
                  {user.firstName && user.lastName && (
                    <div className="text-sm text-gray-500">
                      {user.firstName} {user.lastName}
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailAutocomplete;

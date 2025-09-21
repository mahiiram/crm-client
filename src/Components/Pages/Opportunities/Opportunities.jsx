// src/pages/UserProfile.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Opportunities = () => {
  const navigate = useNavigate();

  const goToContacts = () => {
    navigate("/contacts"); // route to contacts page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h2 className="text-3xl font-bold text-black mb-6 text-center">We are launching soon 🚀</h2>
      <button
        onClick={goToContacts}
        className="px-6 py-3 bg-white text-green-600 font-semibold rounded-lg shadow-md hover:bg-green-100 transition"
      >
        Go to Contacts
      </button>
    </div>
  );
};

export default Opportunities;

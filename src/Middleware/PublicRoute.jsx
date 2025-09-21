import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const { token, status } = useSelector((state) => state.auth);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ✅ If user is already logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Otherwise, render the public page (login, register, recovery, reset-password)
  return children;
};

export default PublicRoute;

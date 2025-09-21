import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const { token, loading } = useSelector((state) => state.auth);

  // Show a nice loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
        <div className="text-center">
          <div className="loader border-4 border-green-300 border-t-4 border-t-green-600 rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the children
  return children;
};

export default PrivateRoute;

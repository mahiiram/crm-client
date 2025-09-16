import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

const DashboardLayout = ({ children }) => {
  return (
    <div>
      <Sidebar />
      <div className="ml-56 min-h-screen flex flex-col bg-gray-50 ">
        <Navbar />
        <div className="p-4 overflow-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

// src/pages/UserProfile.jsx (or your routing config)
import React from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Contacts from "../Pages/Contacts/Contacts";
import Dashboard from "../layouts/Dashboard";


const UserProfile = () => {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
};

export default UserProfile;

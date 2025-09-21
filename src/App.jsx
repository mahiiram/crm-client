// App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UserLogin from "./Components/Login/Login.jsx";
import Userprofile from "./Components/profile/dashboard.jsx";
import UserRegister from "./Components/Signup/Signup.jsx";
import DashboardLayout from "./Components/layouts/DashboardLayout.jsx";
import ContactsPage from "./Components/Pages/Contacts/Contacts.jsx";
import Companies from "./Components/Pages/Companies/Companies.jsx";
import UserProfile from "./Components/profile/dashboard.jsx";
import Dashboard from "./Components/layouts/Dashboard.jsx";
import Recovery from "./Components/Login/Recovery.jsx";
import Resetpassword from "./Components/Login/ResetPassword.jsx";
import Opportunities from "./Components/Pages/Opportunities/Opportunities.jsx";
import PrivateRoute from "./Middleware/PrivateRoutes.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLogin />,
  },
  {
    path: "/register",
    element: <UserRegister />,
  },
  {
    path: "/recovery",
    element: <Recovery />,
  },
  {
    path: "/reset-password",
    element: <Resetpassword />,
  },
  {
    path: "/contacts",
    element: (
      <PrivateRoute>
        <DashboardLayout>
          <ContactsPage />
        </DashboardLayout>
      </PrivateRoute>
    ),
  },
  {
    path: "/companies",
    element: (
      <PrivateRoute>
        <DashboardLayout>
          <Companies />
        </DashboardLayout>
      </PrivateRoute>
    ),
  },
  {
    path: "/opportunities",
    element: (
      <PrivateRoute>
        <DashboardLayout>
          <Opportunities />
        </DashboardLayout>
      </PrivateRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </PrivateRoute>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
// function App() {
//   return (
//     <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
//       <RouterProvider router={router} />
//     </div>
//   );
// }

export default App;

// App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UserLogin from "./Components/Login/Login.jsx";
import Userprofile from "./Components/profile/dashboard.jsx";
import UserRegister from "./Components/Signup/Signup.jsx";
import DashboardLayout from "./Components/layouts/DashboardLayout.jsx";
import ContactsPage from "./Components/Pages/Contacts/Contacts.jsx";
import UserProfile from "./Components/profile/dashboard.jsx";
import Dashboard from "./Components/layouts/Dashboard.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLogin />,
  },
  {
    path: "/register",
    element: <UserRegister />,
  },
  // {
  //   path: "/userprofile",
  //   element: (
  //     <DashboardLayout>
  //       <UserProfile />
  //     </DashboardLayout>
  //   )
  // },
  {
    path: "/Contacts",
    element: (
      <DashboardLayout>
        <ContactsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
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

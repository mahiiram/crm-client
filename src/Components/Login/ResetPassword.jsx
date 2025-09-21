import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";

// thunk we made// your API helper
import { checkResetSession } from "../../features/auth/authSlice";
import { resetPassword } from "../../features/auth/auth";

function Resetpassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, resetSession, error, user } = useSelector((state) => state.auth);

  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const email = sessionStorage.getItem("email");
  // Check session on mount
  useEffect(() => {
    dispatch(checkResetSession());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPwd) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      // Await API call
      const result = await resetPassword({ email, password });

      // Show success toast
      toast.success("Password updated successfully!");

      // ✅ Clear session + navigate
      sessionStorage.removeItem("email"); // remove OTP/email
      sessionStorage.removeItem("authState"); // remove auth state if needed
      //  dispatch(clearResetSession()); // if using Redux
      navigate("/"); // redirect to login/home
    } catch (err) {
      // Show real backend error
      toast.error(err);
    }
  };

  // Handle session states
  if (status === "loading") return <h1 className="text-center mt-10">Checking session...</h1>;
  if (error) return <h1 className="text-center mt-10 text-red-500">{error}</h1>;
  if (!resetSession && status === "succeeded") return <Navigate to="/password" replace />;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500 px-4 py-6">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Reset</h1>
          <p className="text-gray-600">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Enter New Password"
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
            />
          </div>

          <p className="text-xs text-gray-500">We'll never share your password with anyone else.</p>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Resetpassword;

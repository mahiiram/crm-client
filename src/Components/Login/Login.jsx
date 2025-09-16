import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../features/auth/authSlice.js";
import { EyeIcon, EyeOffIcon } from "lucide-react";

function UserLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, status } = useSelector((state) => state.auth);
  console.log("token", token);
  // useEffect(() => {
  //   if (token) {
  //     navigate("/dashboard");
  //   }
  // }, [token, navigate]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const handleMouseMove = (e) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setCursorPosition({
      x: e.clientX - left,
      y: e.clientY - top,
    });
  };

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    const loginPromise = dispatch(login(form)).unwrap();

    toast
      .promise(loginPromise, {
        loading: "Logging in...",
        success: <b>Login successful</b>,
        error: (err) => <b>{err || "Registration failed"}</b>,
      })
      .then(() => {
        sessionStorage.setItem("email", form.email);
        navigate("/dashboard");
      })
      .catch((err) => {
        console.error("Login failed:", err);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 px-4 py-6 rounded-lg px-4">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <h6 className="text-3xl font-bold text-green-800">Login</h6>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter Password"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] text-gray-500"
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
            <p className="text-xs text-gray-500 mt-1">We'll never share your password with anyone else.</p>
          </div>
          {/* <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.password}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">We'll never share your password with anyone else.</p>
          </div> */}
          <div className="button-container" onMouseMove={handleMouseMove}>
            <button type="submit" className="liquid-button">
              <span className="liquid" style={{ left: cursorPosition.x, top: cursorPosition.y }} />
              {status === "loading" ? "Logging in..." : "Login"}
            </button>
          </div>
          <p className="text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="text-green-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default UserLogin;

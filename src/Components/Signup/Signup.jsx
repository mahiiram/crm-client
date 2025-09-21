import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { register } from "../../features/auth/authSlice.js";
import PhoneInput from "react-phone-input-2";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import "react-phone-input-2/lib/style.css";

function UserRegister() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone: "",
    countryCode: "+91",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ This will only update the country code — not modify phone
  const handleCountryChange = (value, country, e, formattedValue) => {
    setForm((prev) => ({
      ...prev,
      countryCode: `+${country.dialCode}`,
      // Strip country code from full value to keep raw phone number
      phone: value.replace(country.dialCode, "").replace(/^0+/, ""),
    }));
  };

  // ✅ Validation
  //   const validateForm = (fields) => {
  //     for (const [key, value] of Object.entries(fields)) {
  //       if (!value || value.trim() === "") {
  //         return `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
  //       }
  //     }
  //     return null;
  //   };
  const validateForm = (fields) => {
    const missingFields = [];

    for (const [key, value] of Object.entries(fields)) {
      if (!value || value.trim() === "") {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      return `${missingFields.join(", ")} ${missingFields.length === 1 ? "is" : "are"} required`;
    }

    return null;
  };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();

  //     const { firstname, lastname, email, password, phone } = form;
  //     const error = validateForm({ firstname, lastname, email, password, phone });

  //     if (error) {
  //       toast.error(error);
  //       return;
  //     }

  //     const registerPromise = dispatch(register(form)).unwrap();

  //     toast
  //       .promise(registerPromise, {
  //         loading: "Registering...",
  //         success: <b>User registered successfully</b>,
  //         error: (err) => <b>{err || "Registration failed"}</b>,
  //       })
  //       .then(() => {
  //         sessionStorage.setItem("email", form.email); // use form.email instead of undefined variable
  //         navigate("/userprofile");
  //       })
  //       .catch((err) => {
  //         console.error("Registration error:", err); // Optional: log error for debugging
  //       });
  //   };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstname, lastname, email, password, phone } = form;
    const error = validateForm({ firstname, lastname, email, password, phone });

    if (error) {
      toast.error(error);
      return;
    }

    const registerPromise = dispatch(register(form)); // don't unwrap yet

    toast
      .promise(
        registerPromise.unwrap(), // ✅ unwrap *here* so toast handles the result
        {
          loading: "Registering...",
          success: <b>User registered successfully</b>,
          error: (err) => <b>{err || "Registration failed"}</b>,
        }
      )
      .then(() => {
        sessionStorage.setItem("email", form.email);
        navigate("/dashboard");
      })
      .catch((err) => {
        console.error("Registration error:", err);
        //  Do not reset form here; user input stays preserved
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 px-4 py-6 rounded-lg px-4">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <h6 className="text-3xl font-bold text-green-800">Register</h6>
          <p className="text-gray-500">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              placeholder="Enter First Name"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              placeholder="Enter Last Name"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter Email"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <PhoneInput
              country={"in"}
              onlyCountries={["in", "us", "ae", "gb"]}
              value={form.countryCode + form.phone}
              onChange={handleCountryChange}
              inputProps={{
                name: "phone",
              }}
              inputStyle={{ width: "100%" }}
              containerStyle={{ width: "100%" }}
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
          <div className="button-container" onMouseMove={handleMouseMove}>
            <button type="submit" className="liquid-button">
              <span className="liquid" style={{ left: cursorPosition.x, top: cursorPosition.y }} />
              Signup
            </button>
          </div>
          <p className="text-sm text-center text-gray-600">
            Already registered?{" "}
            <Link to="/" className="text-green-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default UserRegister;

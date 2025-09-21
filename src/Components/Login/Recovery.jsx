import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { generateOTP, verifyOTP } from "../../features/auth/auth";

function Recovery() {
  const navigate = useNavigate();

  // Initialize form without sessionStorage for email input
  const [form, setForm] = useState({
    email: "",
    otp: "",
  });

  const [step, setStep] = useState(1); // Step 1 = email, Step 2 = OTP
  const [loading, setLoading] = useState(false);
  // Optional: pre-fill email if coming back from page refresh during OTP step
  useEffect(() => {
    if (step === 2) {
      const savedEmail = sessionStorage.getItem("email") || "";
      setForm((prev) => ({ ...prev, email: savedEmail }));
    }
  }, [step]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerateOTP = async (e) => {
    e.preventDefault();
    if (!form.email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const OTP = await generateOTP(form.email);
      setLoading(false);
      if (OTP) {
        toast.success("OTP has been sent to your email!");
        sessionStorage.setItem("email", form.email); // save for OTP verification
        setForm((prev) => ({ ...prev, email: "" })); // clear input
        setStep(2); // move to OTP step
      } else {
        setLoading(false);
        toast.error("Problem while generating OTP!");
      }
    } catch (err) {
      setForm((prev) => ({ ...prev, email: "" }));
      toast.error(err);
    }
  };

  const handleSubmitOTP = async (e) => {
    e.preventDefault();
    if (!form.otp) {
      toast.error("Please enter the OTP");
      return;
    }
    try {
      const email = sessionStorage.getItem("email");
      let { status } = await verifyOTP({ email, code: form.otp });
      if (status === 201) {
        toast.success("OTP verified successfully");
        sessionStorage.removeItem("email"); // clear stored email after success
        navigate("/reset-password");
      }
    } catch (error) {
      toast.error("Wrong OTP, enter the correct OTP!");
    }
  };

  const resendOTP = () => {
    const email = sessionStorage.getItem("email"); // read stored email
    if (!email) {
      toast.error("No email found in session!");
      return;
    }
    const sendPromise = generateOTP(email);
    toast.promise(sendPromise, {
      loading: "Sending...",
      success: <b>OTP sent to your email</b>,
      error: <b>Could not send it</b>,
    });

    sendPromise.then((OTP) => {
      console.log("Resent OTP:", OTP);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 px-4 py-6">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <h6 className="text-3xl font-bold text-green-800">Password Recovery</h6>
          {step === 1 ? (
            <p className="text-gray-600 mt-2">Enter your email to get OTP</p>
          ) : (
            <p className="text-gray-600 mt-2">Enter the OTP sent to your email</p>
          )}
        </div>

        {step === 1 && (
          <form onSubmit={handleGenerateOTP} className="space-y-5">
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
            <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Generate OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitOTP} className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                One Time Password
              </label>
              <input
                type="text"
                name="otp"
                placeholder="Enter 6 digit OTP"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.otp}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">Check your email for the OTP code</p>
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Verify OTP
            </button>
            <p className="text-sm text-center text-gray-600">
              Didn’t receive the OTP?{" "}
              <button type="button" onClick={resendOTP} className="text-green-600 hover:underline ml-1">
                Resend
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Recovery;

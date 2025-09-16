import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { store } from "./store"; 
import "./index.css";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <StrictMode>
      <Toaster position="top-right" />
      <App />
    </StrictMode>
  </Provider>
);

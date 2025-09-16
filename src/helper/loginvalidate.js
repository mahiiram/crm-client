import { toast } from "react-hot-toast";

// Validate password only
export function validatePassword(values) {
  const errors = {};

  const specialChar = /[!@#$%^&*(),.?":{}|<>0-9]/;

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.includes(" ")) {
    errors.password = "Password should not contain spaces";
  } else if (values.password.length < 6) {
    errors.password = "Password must be more than 6 characters";
  } else if (!specialChar.test(values.password)) {
    errors.password = "Password must include a number or special character";
  }

  return errors;
}

// Validate name (username)
function validateUsername(values) {
  const errors = {};

  if (!values.username) {
    errors.username = "Username is required";
  } else if (values.username.includes(" ")) {
    errors.username = "Username should not contain spaces";
  }

  return errors;
}

// Validate email
function validateEmail(values) {
  const errors = {};

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  if (!values.email) {
    errors.email = "Email is required";
  } else if (values.email.includes(" ")) {
    errors.email = "Email should not contain spaces";
  } else if (!emailRegex.test(values.email)) {
    errors.email = "Invalid email address";
  }

  return errors;
}

// Validate either username or email (login)
function validateEmailOrUsername(values) {
  const errors = {};

  if (!values.EmailOrName) {
    errors.EmailOrName = "Email or Username is required";
  } else if (values.EmailOrName.includes(" ")) {
    errors.EmailOrName = "Should not contain spaces";
  }

  return errors;
}

// Wrapper functions

export function registerValidation(values) {
  const errors = {
    ...validateUsername(values),
    ...validateEmail(values),
    ...validatePassword(values),
  };

  showErrorsAsToast(errors);
  return errors;
}

export function profileValidation(values) {
  const errors = {
    ...validateEmail(values),
    ...validatePassword(values),
  };

  showErrorsAsToast(errors);
  return errors;
}

export function loginValidation(values) {
  const errors = {
    ...validateEmailOrUsername(values),
    ...validatePassword(values),
  };

  showErrorsAsToast(errors);
  return errors;
}

export function passwordValidation(values) {
  const errors = validatePassword(values);
  showErrorsAsToast(errors);
  return errors;
}

// Utility to show toast for errors
function showErrorsAsToast(errors) {
  Object.values(errors).forEach((msg) => toast.error(msg));
}

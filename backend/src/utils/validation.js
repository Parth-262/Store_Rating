// Input validation helper based on fullstack challenge requirements

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Email must follow standard email validation rules (e.g. user@example.com).';
  }
  return null;
}

export function validateName(name) {
  if (!name || typeof name !== 'string') return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length < 20) {
    return 'Name must be at least 20 characters long.';
  }
  if (trimmed.length > 60) {
    return 'Name must not exceed 60 characters.';
  }
  return null;
}

export function validateAddress(address) {
  if (!address || typeof address !== 'string') return 'Address is required.';
  const trimmed = address.trim();
  if (trimmed.length === 0) return 'Address is required.';
  if (trimmed.length > 400) {
    return 'Address must not exceed 400 characters.';
  }
  return null;
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters long.';
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUppercase) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!hasSpecial) {
    return 'Password must include at least one special character (e.g. !@#$%^&*).';
  }
  return null;
}

export function validateUserRegistration({ name, email, address, password }) {
  const errors = {};
  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const addrErr = validateAddress(address);
  if (addrErr) errors.address = addrErr;

  const passErr = validatePassword(password);
  if (passErr) errors.password = passErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

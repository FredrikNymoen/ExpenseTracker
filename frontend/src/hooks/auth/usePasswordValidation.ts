import { useState, useMemo } from "react";

export interface PasswordValidationOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
}

const defaultOptions: PasswordValidationOptions = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
};

export function usePasswordValidation(options: PasswordValidationOptions = {}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const config = { ...defaultOptions, ...options };

  const validationErrors = useMemo(() => {
    if (password.length === 0) return [];

    const errors: string[] = [];

    if (config.minLength && password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long`);
    }

    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (config.requireNumbers && !/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return errors;
  }, [password, config]);

  const isPasswordValid = validationErrors.length === 0 && password.length > 0;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = isPasswordValid && doPasswordsMatch;

  const reset = () => {
    setPassword("");
    setConfirmPassword("");
  };

  return {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    validationErrors,
    isPasswordValid,
    doPasswordsMatch,
    isFormValid,
    reset,
  };
}
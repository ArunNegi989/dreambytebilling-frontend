// src/pages/auth/Register.tsx
import React, { useState } from "react";
import styles from "../../assets/styles/auth/Register.module.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface RegisterResponseUser {
  id: string;
  name: string;
  email: string;
  role?: "admin" | "user";
}

interface RegisterResponse {
  token?: string;
  user?: RegisterResponseUser;
  message?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    if (!name || !email || !password || !confirm) {
      toast.error("Please fill all fields");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = { name, email, password };

      // endpoint assumed: /api/auth/register (adjust if your backend uses another route)
      const res = await axios.post<RegisterResponse>(
        `${API_BASE_URL}/api/auth/register`,
        payload
      );

      // If backend returns a token and user, you can store them.
      if (res.data?.token && res.data?.user) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Account created & logged in");
        // redirect to admin/dashboard depending on role
        const role = res.data.user.role || "user";
        if (role === "admin") navigate("/admin");
        else navigate("/admin"); // change to user dashboard if you add it later
        return;
      }

      // else success without token
      toast.success(res.data?.message || "Account created. Please login.");
      navigate("/auth/login");
    } catch (err: any) {
      console.error("Register error:", err);
      const message =
        err?.response?.data?.message || "Registration failed. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.leftPanel}>
          <div className={styles.brandBadge}>Billing Software</div>
          <h1 className={styles.leftTitle}>Create your account</h1>
          <p className={styles.leftText}>
            Create an admin account to manage invoices, customers & payments.
          </p>

          <ul className={styles.features}>
            <li>⚡ Quick setup</li>
            <li>📊 Easy invoice management</li>
            <li>🔐 Role-based access</li>
          </ul>
        </div>

        <div className={styles.rightPanel}>
          <h2 className={styles.title}>Register</h2>
          <p className={styles.subtitle}>Create a new admin account</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Full name</label>
              <input
                type="text"
                placeholder="Your name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                placeholder="admin@example.com"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                className={styles.input}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className={styles.switch}>
            Already have an account?{" "}
            <Link to="/auth/login" className={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

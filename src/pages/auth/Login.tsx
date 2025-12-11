// src/pages/auth/Login.tsx
import React, { useState } from "react";
import styles from "../../assets/styles/auth/Login.module.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface LoginResponseUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface LoginResponse {
  token: string;
  user: LoginResponseUser;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      const { token, user } = res.data;

      // ✅ Save in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful");

      // Agar sirf admin ka dashboard hai:
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        // future me agar user panel banaoge to yaha redirect change kar lena
        navigate("/admin");
      }
    } catch (error: any) {
      console.error(error);
      const message =
        error?.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* LEFT PANEL */}
        <div className={styles.leftPanel}>
          <div className={styles.brandBadge}>Billing Software</div>
          <h1 className={styles.leftTitle}>Smart billing, simplified.</h1>
          <p className={styles.leftText}>
            Manage invoices, customers, and payments from one clean dashboard.
          </p>

          <ul className={styles.features}>
            <li>⚡ Quick invoice generation</li>
            <li>📊 Download & share bills</li>
            <li>🔐 Secure & role-based access</li>
          </ul>
        </div>

        {/* RIGHT PANEL - LOGIN FORM */}
        <div className={styles.rightPanel}>
          <h2 className={styles.title}>Welcome back 👋</h2>
          <p className={styles.subtitle}>Login to your admin account</p>

          <form onSubmit={handleSubmit} className={styles.form}>
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
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* future: forgot password, etc. */}
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useEffect, useState } from "react";
import styles from "../../assets/styles/auth/Login.module.css";
import api from "../../api/axios";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { isTokenValid } from "../../utils/auth";

interface LoginResponseUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface LoginResponse {
  message?: string;
  token: string;
  user: LoginResponseUser;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= LOGIN HANDLER ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // ✅ SINGLE axios instance (env based)
      const res = await api.post<LoginResponse>(
        "/api/auth/login",
        { email, password },
        { timeout: 10000 }
      );

      const { token, user } = res.data;

      if (!token || !user) {
        toast.error("Unexpected server response. Please try again.");
        return;
      }

      // Save token + user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(res.data.message || "Login successful");

      navigate("/admin");
    } catch (err: unknown) {
      const error = err as AxiosError<any>;
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message;

      if (!error.response) {
        toast.error("Network error — unable to reach server");
      } else if (status === 401) {
        toast.error(serverMsg || "Invalid credentials");
      } else if (status === 400) {
        toast.error(serverMsg || "Bad request");
      } else {
        toast.error(serverMsg || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTO REDIRECT ================= */
  useEffect(() => {
    if (isTokenValid()) {
      navigate("/admin");
    }
  }, [navigate]);

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

        {/* RIGHT PANEL */}
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
                disabled={loading}
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
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword((p) => !p)}
                  disabled={loading}
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

          <p className={styles.switch}>
            Don't have an account?{" "}
            <Link to="/auth/register" className={styles.link}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

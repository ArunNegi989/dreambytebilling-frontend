// src/pages/auth/Register.tsx
import React, { useState } from "react";
import styles from "../../assets/styles/auth/Register.module.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      toast.success("Account created successfully");
      navigate("/auth/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* LEFT */}
        <div className={styles.leftPanel}>
          <h1 className={styles.brand}>BillingPro</h1>
          <p className={styles.tagline}>
            Smart billing & invoice management platform
          </p>

          <ul className={styles.benefits}>
            <li>✔ Create invoices in seconds</li>
            <li>✔ Track payments easily</li>
            <li>✔ Secure admin dashboard</li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className={styles.rightPanel}>
          <h2 className={styles.title}>Create Account</h2>
          <p className={styles.subtitle}>
            Register to access admin dashboard
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              className={styles.input}
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className={styles.input}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className={styles.passwordBox}>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className={styles.eye}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            <input
              className={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <button
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className={styles.switch}>
            Already have an account?
            <Link to="/auth/login"> Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

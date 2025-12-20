// src/layouts/AdminLayout.tsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import styles from "../assets/styles/admin/AdminDashboard.module.css";

interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: string;
}

const AdminLayout: React.FC = () => {
  const rawUser = localStorage.getItem("user");
  const user: AuthUser | null = rawUser ? JSON.parse(rawUser) : null;

  const userInitial =
    user?.name && user.name.length > 0
      ? user.name.charAt(0).toUpperCase()
      : "U";

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }

      // Close sidebar when clicking outside on mobile
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(`.${styles.hamburger}`)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const handleEditProfile = () => {
    navigate("/admin/profile");
    setMenuOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className={styles.layout}>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ---------- SIDEBAR ---------- */}
      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.logoSection}>
          <div className={styles.logoCircle}>DB</div>
          <div>
            <h2 className={styles.logoTitle}>DreamByte</h2>
            <p className={styles.logoSubtitle}>Billing Admin</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className={styles.navIcon}>📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/invoices"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className={styles.navIcon}>🧾</span>
            <span>Invoices</span>
          </NavLink>

          <NavLink
            to="bill"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className={styles.navIcon}>🧾</span>
            <span>Invoices Without GST</span>
          </NavLink>

          <NavLink
            to="quotation"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className={styles.navIcon}>📈</span>
            <span>Quotations</span>
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          {user && (
            <div className={styles.sidebarUser}>
              <div className={styles.sidebarUserAvatar}>{userInitial}</div>
              <div>
                <p className={styles.sidebarUserName}>{user.name}</p>
                <p className={styles.sidebarUserRole}>{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ---------- MAIN AREA ---------- */}
      <div className={styles.main}>
        {/* TOPBAR */}
        <header className={styles.topbar}>
          {/* Hamburger Menu */}
          <button
            className={`${styles.hamburger} ${
              sidebarOpen ? styles.hamburgerActive : ""
            }`}
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>
              Welcome back, {user?.name || "Admin"} 👋
            </p>
          </div>

          {user && (
            <div className={styles.topbarUserWrapper} ref={userMenuRef}>
              <button
                type="button"
                className={styles.topbarUser}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <div className={styles.topbarUserInfo}>
                  <span className={styles.topbarUserName}>{user.name}</span>
                  <span className={styles.topbarUserEmail}>{user.email}</span>
                </div>
                <div className={styles.topbarAvatar}>{userInitial}</div>
              </button>

              {menuOpen && (
                <div className={styles.userMenu}>
                  <button
                    type="button"
                    className={styles.userMenuItem}
                    onClick={handleEditProfile}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    type="button"
                    className={styles.userMenuItem}
                    onClick={handleLogout}
                  >
                    ⏻ Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {/* CONTENT */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
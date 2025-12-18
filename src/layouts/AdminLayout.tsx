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
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
  // 1) Local storage clean
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // 2) Dropdown band karo (optional UX)
  setMenuOpen(false);

  // 3) Soft redirect via React Router
  navigate("/login", { replace: true });

  // 4) Extra safety: agar kabhi routing ka issue ho to hard reload
  // (agar upar wali line se kaam ho raha ho to isko comment bhi rakh sakte ho)
  // window.location.href = "/login";
};


  const handleEditProfile = () => {
    navigate("/admin/profile");
    setMenuOpen(false);
  };

  return (
    <div className={styles.layout}>
      {/* ---------- SIDEBAR ---------- */}
      <aside className={styles.sidebar}>
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
          >
            <span className={styles.navIcon}>🧾</span>
            <span>Invoices</span>
          </NavLink>

          

          
           <NavLink
            to="quotation"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
          >
            <span className={styles.navIcon}>📈</span>
            <span>Quatations</span>
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
          <div>
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

        {/* YAHAN PE SAB PAGES LOAD HONGE */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

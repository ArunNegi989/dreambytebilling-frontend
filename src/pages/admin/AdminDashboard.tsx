// src/pages/admin/AdminDashboard.tsx
import React from "react";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";

const AdminDashboard: React.FC = () => {
  return (
    <>
      {/* Dashboard cards + sections */}
      <div className={styles.cardsRow}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Today&apos;s Invoices</p>
          <h3 className={styles.cardValue}>12</h3>
          <p className={styles.cardHint}>+3 vs yesterday</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Total Revenue</p>
          <h3 className={styles.cardValue}>₹ 48,250</h3>
          <p className={styles.cardHint}>Last 7 days</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Active Customers</p>
          <h3 className={styles.cardValue}>89</h3>
          <p className={styles.cardHint}>Updated just now</p>
        </div>
      </div>

      <div className={styles.gridRow}>
        <div className={styles.gridCol}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionList}>
            <button className={styles.primaryBtn}>➕ Create new invoice</button>
            <button className={styles.secondaryBtn}>👥 Add new customer</button>
            <button className={styles.secondaryBtn}>
              📦 Add product/service
            </button>
          </div>
        </div>

        <div className={styles.gridCol}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <ul className={styles.activityList}>
            <li>
              🧾 Invoice <strong>#INV-1024</strong> created for{" "}
              <strong>Infigo Travels</strong>.
            </li>
            <li>
              ✅ Payment received from <strong>ABC Enterprises</strong>.
            </li>
            <li>
              👤 New customer <strong>Rohan Sharma</strong> added.
            </li>
            <li>
              ✏️ Invoice <strong>#INV-1019</strong> updated.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from "react";
import axios from "axios";

const TenantDashboard = ({ token, user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Doctor",
  });
  const [status, setStatus] = useState({ message: "", error: false });

  // Display ID logic
  const [displayTenantId, setDisplayTenantId] = useState("");
  const [tenantData, setTenantData] = useState(null);

  // 1. Setup UI Data
  useEffect(() => {
    // Extract Tenant ID from the Access Token Claims we passed down
    if (user && user.claims) {
      // Priority 1: Clean 'TenantId'
      let tid = user.claims.TenantId;

      // Priority 2: Extension Attribute
      if (!tid) {
        const key = Object.keys(user.claims).find(
          (k) => k.startsWith("extension_") && k.endsWith("_TenantId")
        );
        if (key) tid = user.claims[key];
      }
      setDisplayTenantId(tid);
    }
  }, [user]);

  // 2. Fetch Users & Tenant Details
  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel requests for speed
      const [usersRes, tenantRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/tenant/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/tenant/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(usersRes.data);
      setTenantData(tenantRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // 3. Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setStatus({ message: "Creating user...", error: false });

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tenant/users`,
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus({ message: "User added successfully!", error: false });
      setNewUser({ name: "", email: "", role: "Doctor" });
      setIsAdding(false);
      fetchData(); // Refresh list
    } catch (err) {
      setStatus({
        message: err.response?.data?.error || "Failed",
        error: true,
      });
    }
  };

  if (!tenantData)
    return <div style={{ padding: "20px" }}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          borderBottom: "1px solid #ddd",
          paddingBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {tenantData.LogoUrl && (
            <img
              src={tenantData.LogoUrl}
              alt="Logo"
              style={{ height: "50px", marginRight: "15px" }}
            />
          )}
          <div>
            <h2 style={{ margin: 0, color: "#333" }}>
              {tenantData.DisplayName} Portal
            </h2>
            <p style={{ margin: "5px 0 0", color: "#666", fontSize: "14px" }}>
              Tenant ID: <strong>{displayTenantId}</strong>
            </p>
          </div>
        </div>
        <div>
          <button
            style={{
              marginRight: "10px",
              padding: "10px 20px",
              background: "#0078d4",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Open Radiology Viewer
          </button>
        </div>
      </div>

      {/* STAFF SECTION */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h3>Staff Management</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={secondaryBtnStyle}
        >
          {isAdding ? "Cancel" : "+ Add New Staff"}
        </button>
      </div>

      {/* ADD USER FORM */}
      {isAdding && (
        <div style={formCardStyle}>
          <h4 style={{ marginTop: 0 }}>Invite New Member</h4>
          <form
            onSubmit={handleCreateUser}
            style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}
          >
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Full Name</label>
              <input
                required
                placeholder="e.g. Dr. Sarah Jones"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Email Address</label>
              <input
                required
                type="email"
                placeholder="sarah@hospital.com"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div style={{ width: "150px" }}>
              <label style={labelStyle}>Role</label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                style={inputStyle}
              >
                <option>Doctor</option>
                <option>Nurse</option>
                <option>Staff</option>
              </select>
            </div>
            <button type="submit" style={saveBtnStyle}>
              Invite
            </button>
          </form>
          {status.message && (
            <p
              style={{
                color: status.error ? "red" : "green",
                fontSize: "13px",
                marginTop: "10px",
              }}
            >
              {status.message}
            </p>
          )}
        </div>
      )}

      {/* USER LIST */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <th style={thStyle}>Name / Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Joined</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  Loading staff...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  No staff found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.UserId} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: "bold" }}>{u.Email}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={roleBadgeStyle}>{u.Role}</span>
                  </td>
                  <td style={tdStyle}>
                    {new Date(u.CreatedAt).toLocaleDateString()}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "green" }}>Active</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles
const secondaryBtnStyle = {
  padding: "8px 16px",
  background: "white",
  border: "1px solid #0078d4",
  color: "#0078d4",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
};
const saveBtnStyle = {
  padding: "10px 20px",
  background: "#107c10",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  height: "40px",
};
const formCardStyle = {
  background: "#f3f2f1",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
  border: "1px solid #e1dfdd",
};
const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "bold",
  marginBottom: "5px",
  color: "#666",
};
const thStyle = {
  textAlign: "left",
  padding: "12px 20px",
  fontSize: "13px",
  color: "#666",
  borderBottom: "1px solid #eee",
};
const tdStyle = { padding: "12px 20px", fontSize: "14px", color: "#333" };
const roleBadgeStyle = {
  background: "#e1dfdd",
  padding: "4px 8px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#333",
};

export default TenantDashboard;

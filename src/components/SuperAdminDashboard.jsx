import React, { useState } from "react";
import axios from "axios";
import TenantList from "./TenantList";

const SuperAdminDashboard = ({ token }) => {
  const [formData, setFormData] = useState({
    tenantId: "",
    tenantName: "",
    adminName: "",
    adminEmail: "",
    logoUrl: "",
    maxUsers: 10, // Default
    maxCases: 100, // Default
  });

  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: false,
  });
  const [refreshList, setRefreshList] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "Creating Tenant...", error: false });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/create-tenant`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus({
        loading: false,
        message: `Success! Created Tenant '${response.data.tenantId}'.`,
        error: false,
      });

      // Reset form to defaults
      setFormData({
        tenantId: "",
        tenantName: "",
        adminName: "",
        adminEmail: "",
        logoUrl: "",
        maxUsers: 10,
        maxCases: 100,
      });

      setRefreshList((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setStatus({
        loading: false,
        message: err.response?.data?.error || "Failed to create tenant",
        error: true,
      });
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1
        style={{
          color: "#0078d4",
          marginBottom: "30px",
          borderBottom: "1px solid #ddd",
          paddingBottom: "10px",
        }}
      >
        Super Admin Portal
      </h1>

      {/* 1. CREATION CARD */}
      <div style={cardStyle}>
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 5px 0", color: "#333" }}>
            Onboard New Tenant
          </h3>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Create a dedicated environment for a Hospital or Clinic.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={gridStyle}>
            {/* Row 1: ID and Name */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Subdomain (Tenant ID)</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "0 10px",
                  background: "#f9f9f9",
                }}
              >
                <input
                  name="tenantId"
                  placeholder="e.g. tula"
                  value={formData.tenantId}
                  onChange={(e) => {
                    const val = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "");
                    setFormData({ ...formData, tenantId: val });
                  }}
                  required
                  style={{
                    ...inputStyle,
                    border: "none",
                    background: "transparent",
                    padding: "10px 0",
                  }}
                />
                <span
                  style={{
                    color: "#888",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  .mazmed.com
                </span>
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Display Name</label>
              <input
                name="tenantName"
                placeholder="e.g. Tula Health Systems"
                value={formData.tenantName}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            {/* Row 2: Admin Details */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Admin Name</label>
              <input
                name="adminName"
                placeholder="e.g. Dr. John Smith"
                value={formData.adminName}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Admin Email</label>
              <input
                type="email"
                name="adminEmail"
                placeholder="e.g. admin@tula.com"
                value={formData.adminEmail}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            {/* Row 3: Limits (Defaults) */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Max Users</label>
              <input
                type="number"
                name="maxUsers"
                value={formData.maxUsers}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Max Cases</label>
              <input
                type="number"
                name="maxCases"
                value={formData.maxCases}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* Row 4: Logo (Full Width) */}
            <div style={{ ...inputGroupStyle, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Logo URL (Optional)</label>
              <input
                name="logoUrl"
                placeholder="https://..."
                value={formData.logoUrl}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <button type="submit" disabled={status.loading} style={buttonStyle}>
              {status.loading ? "Provisioning..." : "Create Tenant"}
            </button>

            {status.message && (
              <span
                style={{
                  color: status.error ? "#a80000" : "#107c10",
                  background: status.error ? "#fde7e9" : "#dff6dd",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {status.message}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 2. LIST SECTION */}
      <TenantList token={token} refreshTrigger={refreshList} />
    </div>
  );
};

// CSS Styles
const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  marginBottom: "40px",
  border: "1px solid #e1dfdd",
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};
const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
};
const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "6px",
  color: "#444",
};
const inputStyle = {
  padding: "10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "14px",
};
const buttonStyle = {
  padding: "10px 24px",
  background: "#0078d4",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
};

export default SuperAdminDashboard;

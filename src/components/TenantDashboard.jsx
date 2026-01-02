import React, { useEffect, useState } from "react";
import axios from "axios";

const TenantDashboard = ({ token, user }) => {
  const [tenantData, setTenantData] = useState(null);

  useEffect(() => {
    const fetchMyTenant = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tenant/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTenantData(response.data);
      } catch (error) {
        console.error("Failed to load tenant data", error);
      }
    };

    if (token) fetchMyTenant();
  }, [token]);

  if (!tenantData) return <div>Loading your portal...</div>;

  return (
    <div className="tenant-portal">
      {/* Dynamic Branding */}
      <div
        className="brand-header"
        style={{ borderBottom: "1px solid #ccc", paddingBottom: "10px" }}
      >
        {tenantData.LogoUrl && (
          <img
            src={tenantData.LogoUrl}
            alt="Logo"
            style={{ height: "50px", marginRight: "15px" }}
          />
        )}
        <h1 style={{ display: "inline-block" }}>
          {tenantData.DisplayName} Portal
        </h1>
      </div>

      <div className="dashboard-content" style={{ marginTop: "20px" }}>
        <h3>Welcome, {user.name}</h3>
        <p>
          Tenant ID: <strong>{user.idTokenClaims?.extension_TenantId}</strong>
        </p>

        <div className="stats-card">
          <h4>Subscription Limits</h4>
          <ul>
            <li>Max Cases Allowed: {tenantData.MaxCases}</li>
            <li>
              Account Created:{" "}
              {new Date(tenantData.CreatedAt).toLocaleDateString()}
            </li>
          </ul>
        </div>

        {/* This is where the OHIF Viewer button will go later */}
        <button style={{ marginTop: "20px", padding: "10px 20px" }}>
          Open Radiology Viewer
        </button>
      </div>
    </div>
  );
};

export default TenantDashboard;

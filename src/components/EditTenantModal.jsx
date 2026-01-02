import React, { useState, useEffect } from "react";

const EditTenantModal = ({ isOpen, onClose, tenant, onSave }) => {
  const [formData, setFormData] = useState({
    DisplayName: "",
    LogoUrl: "",
    MaxUsers: 10,
    MaxCases: 100,
    IsActive: true,
  });

  // Populate form when tenant data arrives
  useEffect(() => {
    if (tenant) {
      setFormData({
        DisplayName: tenant.DisplayName || "",
        LogoUrl: tenant.LogoUrl || "",
        MaxUsers: tenant.MaxUsers || 0,
        MaxCases: tenant.MaxCases || 0,
        IsActive: tenant.IsActive ?? true,
      });
    }
  }, [tenant]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Edit Tenant: {tenant?.TenantId}</h3>

        <label style={labelStyle}>Display Name</label>
        <input
          name="DisplayName"
          value={formData.DisplayName}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Logo URL</label>
        <input
          name="LogoUrl"
          value={formData.LogoUrl}
          onChange={handleChange}
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Max Users</label>
            <input
              type="number"
              name="MaxUsers"
              value={formData.MaxUsers}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Max Cases</label>
            <input
              type="number"
              name="MaxCases"
              value={formData.MaxCases}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: "15px" }}>
          <label>
            <input
              type="checkbox"
              name="IsActive"
              checked={formData.IsActive}
              onChange={handleChange}
            />{" "}
            Active Tenant (Can log in)
          </label>
        </div>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button onClick={onClose} style={cancelBtnStyle}>
            Cancel
          </button>
          <button
            onClick={() => onSave(tenant.TenantId, formData)}
            style={saveBtnStyle}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};
const modalStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
};
const labelStyle = {
  display: "block",
  marginTop: "10px",
  fontSize: "14px",
  fontWeight: "bold",
};
const inputStyle = {
  width: "100%",
  padding: "8px",
  marginTop: "5px",
  boxSizing: "border-box",
};
const saveBtnStyle = {
  padding: "8px 16px",
  background: "#0078d4",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const cancelBtnStyle = {
  padding: "8px 16px",
  background: "#ccc",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default EditTenantModal;

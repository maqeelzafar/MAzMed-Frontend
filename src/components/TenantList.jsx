import React, { useEffect, useState } from "react";
import axios from "axios";
import EditTenantModal from "./EditTenantModal"; // Import the new modal

const TenantList = ({ token, refreshTrigger }) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  // NEW: State for editing
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  const fetchTenants = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/tenants`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data);
      setTenants(response.data);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Open Modal
  const handleEditClick = (tenant) => {
    setEditingTenant(tenant);
    setIsEditOpen(true);
  };

  // NEW: Save Changes
  const handleSaveEdit = async (tenantId, updatedData) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/tenants/${tenantId}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditOpen(false);
      setEditingTenant(null);
      fetchTenants(); // Refresh list to show changes
    } catch (error) {
      alert("Failed to update: " + error.message);
    }
  };

  const handleDelete = async (tenantId) => {
    if (!window.confirm(`Are you sure you want to DELETE '${tenantId}'?`))
      return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/tenants/${tenantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTenants();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  useEffect(() => {
    if (token) fetchTenants();
  }, [token, refreshTrigger]);

  if (!token && !loading) return <p>Authenticating...</p>;
  if (loading) return <p>Loading tenants...</p>;

  return (
    <div className="tenant-list-container" style={{ marginTop: "30px" }}>
      <h3>Current Tenants ({tenants.length})</h3>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}
      >
        <thead>
          <tr style={{ background: "#f3f2f1", textAlign: "left" }}>
            <th style={thStyle}>Tenant ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Max Users</th>
            <th style={thStyle}>Max Cases</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr
              key={tenant.TenantId}
              style={{ borderBottom: "1px solid #e1dfdd" }}
            >
              <td style={tdStyle}>
                <strong>{tenant.TenantId}</strong>
              </td>
              <td style={tdStyle}>{tenant.DisplayName}</td>
              <td style={tdStyle}>{tenant.MaxUsers}</td>
              <td style={tdStyle}>{tenant.MaxCases}</td>
              <td style={tdStyle}>
                {tenant.IsActive ? "✅ Active" : "❌ Inactive"}
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => handleEditClick(tenant)}
                  style={editBtnStyle}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tenant.TenantId)}
                  style={deleteBtnStyle}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* NEW: Render the Modal */}
      <EditTenantModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        tenant={editingTenant}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

const thStyle = { padding: "10px", borderBottom: "2px solid #ddd" };
const tdStyle = { padding: "10px" };
const editBtnStyle = {
  padding: "5px 10px",
  cursor: "pointer",
  background: "white",
  border: "1px solid #0078d4",
  color: "#0078d4",
  borderRadius: "4px",
  marginRight: "5px",
};
const deleteBtnStyle = {
  padding: "5px 10px",
  cursor: "pointer",
  background: "white",
  border: "1px solid red",
  color: "red",
  borderRadius: "4px",
};

export default TenantList;

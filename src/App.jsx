import { useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import axios from "axios";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import TenantDashboard from "./components/TenantDashboard";
import "./App.css";

function App() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // TENANT STATE
  const [subdomain, setSubdomain] = useState(null);
  const [tenantConfig, setTenantConfig] = useState(null);
  const [configError, setConfigError] = useState("");

  // 1. DETECT SUBDOMAIN
  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    let currentSub = null;

    if (hostname.includes("localhost")) {
      if (parts.length > 1) currentSub = parts[0];
    } else {
      if (parts.length > 2) currentSub = parts[0];
    }

    if (!currentSub || currentSub === "www" || currentSub === "localhost") {
      setSubdomain(null);
      setLoading(false);
      return;
    }

    setSubdomain(currentSub);

    const fetchConfig = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/public/config/${currentSub}`
        );
        setTenantConfig(res.data);
      } catch (err) {
        console.error(err);
        setConfigError("Hospital Portal Not Found");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // 2. TOKEN ACQUISITION
  useEffect(() => {
    const getToken = async () => {
      if (accounts.length > 0) {
        try {
          const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
          setToken(response.idToken);
        } catch (error) {
          if (error.name === "InteractionRequiredAuthError") {
            instance.loginPopup(loginRequest).catch(console.error);
          }
        }
      }
    };
    if (isAuthenticated) getToken();
  }, [isAuthenticated, accounts, instance]);

  const handleLogin = () => {
    instance
      .loginPopup({ ...loginRequest, prompt: "login" })
      .catch(console.error);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    const activeAccount = instance.getActiveAccount() || accounts[0];
    instance.logoutRedirect({
      account: activeAccount,
      logoutHint: activeAccount?.idTokenClaims?.login_hint,
      postLogoutRedirectUri: window.location.origin,
    });
  };

  // 4. SECURITY CHECK (The "Bouncer")
  if (isAuthenticated && subdomain && tenantConfig) {
    const claims = accounts[0]?.idTokenClaims || {};

    // STRICT FIX: Find the extension attribute only.
    // We look for any key that looks like "extension_<GUID>_TenantId"
    const tenantKey = Object.keys(claims).find(
      (key) => key.startsWith("extension_") && key.endsWith("_TenantId")
    );
    const userTenantId = claims[tenantKey];

    const isSuperAdmin = accounts[0]?.username?.startsWith("superadmin");

    if (!isSuperAdmin && userTenantId !== subdomain) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2 style={{ color: "red" }}>Access Denied</h2>
          <p>
            You are logged in as <strong>{accounts[0].username}</strong>.
          </p>
          <p>
            This account belongs to{" "}
            <strong>{userTenantId || "Unknown Tenant"}</strong>.
          </p>
          <p>
            You are trying to access <strong>{subdomain}</strong>.
          </p>
          <button
            onClick={handleLogout}
            style={{ padding: "10px", marginTop: "20px", cursor: "pointer" }}
          >
            Sign Out
          </button>
        </div>
      );
    }
  }

  if (loading) return <div style={{ padding: "50px" }}>Loading Portal...</div>;
  if (configError)
    return (
      <div style={{ padding: "50px", color: "red" }}>
        <h1>404</h1>
        <p>{configError}</p>
      </div>
    );

  return (
    <div className="card">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #eee",
          paddingBottom: "15px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {subdomain && tenantConfig ? (
            <>
              {tenantConfig.LogoUrl && (
                <img
                  src={tenantConfig.LogoUrl}
                  alt="Logo"
                  style={{ height: "40px", marginRight: "15px" }}
                />
              )}
              <h1 style={{ margin: 0, fontSize: "24px" }}>
                {tenantConfig.DisplayName}
              </h1>
            </>
          ) : (
            <h1 style={{ margin: 0 }}>Maz-Med Platform</h1>
          )}
        </div>
        {isAuthenticated && (
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: "12px",
                marginRight: "10px",
                display: "block",
              }}
            >
              {accounts[0]?.name}
            </span>
            <button
              onClick={handleLogout}
              className="logout-btn"
              style={{ padding: "5px 10px", fontSize: "12px" }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {!isAuthenticated ? (
        <div
          className="login-container"
          style={{ textAlign: "center", padding: "40px" }}
        >
          {subdomain ? (
            <div>
              <h2>Welcome to {tenantConfig?.DisplayName}</h2>
              <p>Authorized Staff Access Only</p>
              <button
                onClick={handleLogin}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  fontSize: "16px",
                }}
              >
                Sign In to {tenantConfig?.DisplayName}
              </button>
            </div>
          ) : (
            <div>
              <h2>Platform Administration</h2>
              <button onClick={handleLogin}>Sign In</button>
            </div>
          )}
        </div>
      ) : (
        <div className="main-content">
          {token &&
            (subdomain ? (
              <TenantDashboard token={token} user={accounts[0]} />
            ) : accounts[0]?.username?.startsWith("superadmin") ? (
              <SuperAdminDashboard token={token} />
            ) : (
              <div>
                <h3>Redirecting...</h3>
                <p>Please go to your hospital's specific URL.</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default App;

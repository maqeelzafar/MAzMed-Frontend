import { useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import TenantDashboard from "./components/TenantDashboard";
import "./App.css";

function App() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [token, setToken] = useState(null);
  const [loadingToken, setLoadingToken] = useState(false);

  // 1. ROBUST TOKEN FETCHING (Fixes "Authenticating..." freeze)
  useEffect(() => {
    const getToken = async () => {
      if (accounts.length > 0) {
        setLoadingToken(true);
        try {
          // Silent Request: Checks cache first, then asks Microsoft
          const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
          setToken(response.idToken); // Use idToken for simple Auth, or accessToken for API
        } catch (error) {
          console.error("Silent Token Acquisition Failed", error);
          // Fallback: If silent fails (session expired), user must sign in again
          if (error.name === "InteractionRequiredAuthError") {
            instance.loginPopup(loginRequest).catch(console.error);
          }
        } finally {
          setLoadingToken(false);
        }
      }
    };

    if (isAuthenticated) {
      getToken();
    }
  }, [isAuthenticated, accounts, instance]);

  // 2. CHECK ROLE
  // Note: We check specifically for the Super Admin email pattern
  const isSuperAdmin = accounts[0]?.username?.startsWith("superadmin");

  const handleLogin = () => {
    instance
      .loginPopup({
        ...loginRequest,
        prompt: "login", // <--- This forces a fresh login every time
      })
      .catch((e) => console.error(e));
  };

  const handleLogout = () => {
    // 1. Clear Local Storage to kill the app's memory of the user
    localStorage.clear();
    sessionStorage.clear();

    // 2. Determine exactly who we want to log out
    const activeAccount = instance.getActiveAccount() || accounts[0];

    // 3. Force Azure to target THIS account
    instance.logoutRedirect({
      account: activeAccount,
      // passing logoutHint is the key fix for sticky sessions
      logoutHint:
        activeAccount?.idTokenClaims?.login_hint || activeAccount?.username,
      postLogoutRedirectUri: window.location.origin,
    });
  };

  // 4. RENDER LOGIC
  return (
    <div className="card">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0 }}>Maz-Med Portal</h1>
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
        <div className="login-container">
          <p>Welcome to Maz-Med. Please sign in to access your portal.</p>
          <button onClick={handleLogin}>Sign In</button>
        </div>
      ) : (
        <div className="main-content">
          {/* Show loading state only while fetching the token */}
          {loadingToken ? (
            <p>Loading secure session...</p>
          ) : token ? (
            // Render the correct Dashboard based on Role
            isSuperAdmin ? (
              <SuperAdminDashboard token={token} />
            ) : (
              <TenantDashboard token={token} user={accounts[0]} />
            )
          ) : (
            <p>Authentication failed. Please refresh.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

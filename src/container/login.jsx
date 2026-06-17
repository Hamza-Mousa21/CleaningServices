import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ============================================
// API CONFIGURATION - Fix the port
// ============================================
const API_CONFIG = {
  // Your backend is on port 5000, NOT 3000
  baseURL: "http://localhost:5000",  // ← Changed from 3000 to 5000
  prefix: "/api",  // ← Add back the /api prefix
  get apiUrl() {
    return `${this.baseURL}${this.prefix}`;
  },
  endpoints: {
    login: "/users/login",
    register: "/users/register",
  },
  getUrl: function(endpoint) {
    return `${this.apiUrl}${endpoint}`;
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const goHome = () => navigate("/");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const switchMode = (mode) => {
    setIsLogin(mode);
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? API_CONFIG.endpoints.login : API_CONFIG.endpoints.register;
    const url = API_CONFIG.getUrl(endpoint);

    console.log("API URL:", url); // Debug: Check the URL

    const body = isLogin
      ? {
          email: form.email,
          password: form.password,
        }
      : {
          fullName: form.name,
          email: form.email,
          password: form.password,
        };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        if (data.data.user.role === "admin") {
          navigate("/");
        } else {
          navigate("/");
        }
      } else {
        alert("Account created successfully! Please sign in.");
        switchMode(true);
      }
    } catch (error) {
      console.error("FETCH ERROR:", error);
      setError("Cannot connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center px-3 py-4"
      style={{ backgroundColor: "#eef0f8" }}
    >
      <div className="w-100 mb-3" style={{ maxWidth: 480 }}>
        <button
          className="btn btn-link text-decoration-none fw-medium p-0 d-flex align-items-center gap-2"
          style={{ color: "#0e4311" }}
          onClick={goHome}
        >
          <i className="bi bi-arrow-left"></i>
          Back to Home
        </button>
      </div>

      <div
        className="bg-white rounded-4 w-100 px-4 px-md-5 py-5 shadow"
        style={{
          maxWidth: 480,
          borderTop: "5px solid #0e4311",
        }}
      >
        <form onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <h2 className="fw-bold text-center mb-1" style={{ color: "#0e4311" }}>
                Welcome Back
              </h2>

              <p className="text-center text-secondary mb-4" style={{ fontSize: "0.92rem" }}>
                Sign in to continue
              </p>

              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-envelope" style={{ color: "#0e4311" }}></i>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control border-0 rounded-3 py-3"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ backgroundColor: "#f3f4f8" }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-lock" style={{ color: "#0e4311" }}></i>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control border-0 rounded-3 py-3"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ backgroundColor: "#f3f4f8" }}
                />
              </div>

              <button
                type="submit"
                className="btn w-100 fw-semibold text-white py-3 rounded-3 mb-3"
                style={{
                  background: "#0e4311",
                  border: "none",
                }}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p className="text-center mb-3" style={{ fontSize: "0.88rem", color: "#6b7280" }}>
                Don't have an account?{" "}
                <span
                  className="fw-semibold"
                  role="button"
                  style={{ color: "#0e4311", cursor: "pointer" }}
                  onClick={() => switchMode(false)}
                >
                  Sign up
                </span>
              </p>
            </>
          ) : (
            <>
              <h2 className="fw-bold text-center mb-1" style={{ color: "#0e4311" }}>
                Create Account
              </h2>

              <p className="text-center text-secondary mb-4" style={{ fontSize: "0.92rem" }}>
                Join us today
              </p>

              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-person" style={{ color: "#0e4311" }}></i>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control border-0 rounded-3 py-3"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{ backgroundColor: "#f3f4f8" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-envelope" style={{ color: "#0e4311" }}></i>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control border-0 rounded-3 py-3"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ backgroundColor: "#f3f4f8" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-lock" style={{ color: "#0e4311" }}></i>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control border-0 rounded-3 py-3"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ backgroundColor: "#f3f4f8" }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-lock" style={{ color: "#0e4311" }}></i>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control border-0 rounded-3 py-3"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ backgroundColor: "#f3f4f8" }}
                />
              </div>

              <button
                type="submit"
                className="btn w-100 fw-semibold text-white py-3 rounded-3 mb-3"
                style={{
                  background: "#0e4311",
                  border: "none",
                }}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <p className="text-center mb-0" style={{ fontSize: "0.88rem", color: "#6b7280" }}>
                Already have an account?{" "}
                <span
                  className="fw-semibold"
                  role="button"
                  style={{ color: "#0e4311", cursor: "pointer" }}
                  onClick={() => switchMode(true)}
                >
                  Sign in
                </span>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
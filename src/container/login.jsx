import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

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
  };

  const switchMode = (mode) => {
    setIsLogin(mode);
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const url = isLogin
      ? `${API_BASE_URL}/users/login`
      : `${API_BASE_URL}/users/register`;

    const body = isLogin
      ? {
          email: form.email,
          password: form.password,
        }
      : {
          name: form.name,
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
        alert(data.message || data.error || "Something went wrong");
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/dashboard");
      } else {
        alert("Account created successfully, please sign in");
        switchMode(true);
      }
    } catch (error) {
      console.log("FETCH ERROR:", error);
      alert("Cannot connect to backend server");
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
          borderTop: "5px solid transparent",
          backgroundImage:
            "linear-gradient(white, white), linear-gradient(90deg, #0e4311, #0e4311)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
      >
        {/* <div className="d-flex justify-content-center mb-4">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 text-white"
            style={{
              width: 64,
              height: 64,
              background: "linear-gradient(135deg, #0e4311, #0e4311)",
              boxShadow: "0 6px 20px rgba(124,58,237,0.35)",
            }}
          >
            <i className="bi bi-wallet2" style={{ fontSize: 28 }}></i>
          </div>
        </div> */}

        <form onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <h2
                className="fw-bold text-center mb-1"
                style={{
                  
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "#0e4311",
                }}
              >
                Welcome Back
              </h2>

              <p className="text-center text-secondary mb-4" style={{ fontSize: "0.92rem" }}>
                Sign in to continue managing your budget
              </p>

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
              >
                Sign In
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
              <h2
                className="fw-bold text-center mb-1"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Create Account
              </h2>

              <p className="text-center text-secondary mb-4" style={{ fontSize: "0.92rem" }}>
                Start tracking your budget today
              </p>

              <div className="mb-3">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-person" style={{ color: "#7c3aed" }}></i>
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
                  <i className="bi bi-envelope" style={{ color: "#7c3aed" }}></i>
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
                  <i className="bi bi-lock" style={{ color: "#7c3aed" }}></i>
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
                  <i className="bi bi-lock" style={{ color: "#7c3aed" }}></i>
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
                  background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                  border: "none",
                }}
              >
                Create Account
              </button>

              <p className="text-center mb-0" style={{ fontSize: "0.88rem", color: "#6b7280" }}>
                Already have an account?{" "}
                <span
                  className="fw-semibold"
                  role="button"
                  style={{ color: "#7c3aed", cursor: "pointer" }}
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
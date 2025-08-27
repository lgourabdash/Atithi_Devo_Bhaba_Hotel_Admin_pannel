import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import profileIcon from "../assets/Screenshot 2025-07-24 140802.png";
import footerLogo from "../assets/Technext Software/android-chrome-192x192.png";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "../styles/dashboard.css";

function DashboardLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // check if current page is home
  const isHomePage = location.pathname === "/dashboard/home";

  // Login check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleProfileClick = () => {
    // Refresh + Navigate to dashboard
    navigate("/dashboard");
    window.location.reload(); // forces refresh if you want a hard reload
  };

  const handleGoBack = () => {
    navigate(-1); // go to previous page
  };

  return (
    <div className="container-fluid dashboard-page p-0">
      <Helmet>
        <title>Dashboard - Atithi Devo Bhaba</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Helmet>

      {/* Header */}
      <header className="header-bar border-bottom py-2 px-3 d-flex justify-content-between align-items-center flex-wrap">
        <div className="d-flex align-items-center">
          <img
            src={profileIcon}
            alt="Profile"
            className="profile-icon me-2"
            style={{ cursor: "pointer" }}
            onClick={handleProfileClick}
          />
          <span className="fw-bold">Welcome, {user?.email}</span>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Back Button */}
      {!isHomePage && (
        <div className="p-3">
          <button
            className="btn btn-outline-primary btn-sm shadow-sm"
            onClick={handleGoBack}
          >
            ⬅ Back
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="d-flex justify-content-center align-items-start flex-column flex-grow-1 p-3">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer-bar border-top py-3 mt-auto">
        <div className="row align-items-center text-center">
          <div className="col-4 text-start">
            <img src={footerLogo} alt="Footer Logo" className="logo" />
          </div>
          <div className="col-4">
            <p className="m-0 footer-text">
              © All Rights Reserved | Technext Software Private Limited
            </p>
          </div>
          <div className="col-4 text-end">
            <img src={footerLogo} alt="Footer Logo" className="logo" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DashboardLayout;

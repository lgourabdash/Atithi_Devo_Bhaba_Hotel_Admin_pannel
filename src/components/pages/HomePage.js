import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import BillingCard from "./BillingCard"; // import the modal billing card

function HomePage() {
  return (
    <div className="container mt-4">
      {/* Welcome Section */}
      <div className="text-center mb-5">
        <h1 className="fw-bold">Welcome to the Dashboard</h1>
        <p className="text-secondary fs-5 fst-italic">
          <span className="fw-bold text-light">Manage your</span>{" "}
          <span className="fw-bold text-primary">items</span>,{" "}
          <span className="fw-bold text-success">members</span>,{" "}
          <span className="fw-bold text-info">attendance</span>,{" "}
          <span className="fw-bold text-light">and</span>{" "}
          <span className="fw-bold text-warning">expenditures</span>{" "}
          <span className="fw-bold text-light">all in one place.</span>
        </p>
      </div>

      {/* Responsive Cards Section */}
      <div className="row g-4">
        {/* Billing Card (with Modal) */}
        <BillingCard />

        {/* View Members */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-people fs-1 text-success mb-3"></i>
              <h5 className="card-title">Members Pannel</h5>
              <p className="card-text">
                Check and manage all registered members.
              </p>
              <a href="/dashboard/view" className="btn btn-success w-100">
                View Members Pannel
              </a>
            </div>
          </div>
        </div>

        {/* Expenditure */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-cash-stack fs-1 text-warning mb-3"></i>
              <h5 className="card-title">Expenditure</h5>
              <p className="card-text">Track and review expenditure details.</p>
              <a
                href="/dashboard/expenditure"
                className="btn btn-warning w-100 text-white"
              >
                View Expenditure
              </a>
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div className="col-md-6 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-calendar-check fs-1 text-info mb-3"></i>
              <h5 className="card-title">Attendance</h5>
              <p className="card-text">
                Monitor and mark member attendance efficiently.
              </p>
              <a
                href="/dashboard/attendance"
                className="btn btn-info w-100 text-white"
              >
                Attendance
              </a>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="col-md-6 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-bar-chart-line fs-1 text-danger mb-3"></i>
              <h5 className="card-title">Summary</h5>
              <p className="card-text">
                Get a quick overview and summary reports.
              </p>
              <a href="/dashboard/summary" className="btn btn-danger w-100">
                View Summary
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

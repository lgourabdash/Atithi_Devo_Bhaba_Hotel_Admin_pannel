import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Login from "./components/Login";
import DashboardLayout from "./components/DashboardLayout";
import HomePage from "./components/pages/HomePage"; // 👈 create this new page
import BillingPage from "./components/pages/BillingPage";
import ViewMembers from "./components/pages/ViewMembers";
import ExpenditureDetails from "./components/pages/ExpenditureDetails";
import AttendancePage from "./components/pages/AttendancePage";
import SummaryPage from "./components/pages/SummaryPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route → Login Page */}
        <Route path="/" element={<Login />} />

        {/* Dashboard Layout with Nested Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Default inside dashboard → Home */}
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomePage />} /> {/* 👈 new home nav */}
          <Route path="billing" element={<BillingPage />} />
          <Route path="view" element={<ViewMembers />} />
          <Route path="expenditure" element={<ExpenditureDetails />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="summary" element={<SummaryPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

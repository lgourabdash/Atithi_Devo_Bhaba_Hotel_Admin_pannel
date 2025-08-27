import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { listenMembers, listenAttendance, markAttendance } from "../../dbcon";
import "bootstrap/dist/css/bootstrap.min.css";

function AttendancePage() {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);

  const leaveReasons = ["Medical Issue", "Health Issue", "Personal", "Other"];

  // Auth
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });
  }, []);

  // Members
  useEffect(() => {
    if (!user) return;
    return listenMembers(user.uid, (list) => {
      setMembers(list);
      setLoading(false);
    });
  }, [user]);

  // Attendance
  useEffect(() => {
    if (!user) return;
    return listenAttendance(user.uid, selectedMonth, setAttendance);
  }, [user, selectedMonth]);

  // Handle dropdown change
  const handleMark = (memberId, session, value) => {
    if (!user) return;
    markAttendance(
      user.uid,
      selectedMonth,
      selectedDate,
      memberId,
      session,
      value,
      user.email
    );
  };

  const handleReason = (memberId, reason) => {
    if (!user) return;
    markAttendance(
      user.uid,
      selectedMonth,
      selectedDate,
      memberId,
      "evening",
      "On Leave",
      user.email,
      reason
    );
  };

  return (
    <div className="container my-4">
      <h2 className="text-center fw-bold mb-4">
        📌 Staff Attendance Management
      </h2>

      {/* Filters */}
      <div className="row mb-4 justify-content-center g-2">
        <div className="col-md-3">
          <input
            type="month"
            className="form-control"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Cards */}
      <div className="row">
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : members.length === 0 ? (
          <p className="text-center text-muted">No staff found</p>
        ) : (
          members.map((m) => {
            const current = attendance?.[selectedDate]?.[m.id] || {};
            const cardBorder =
              user?.uid === m.id ? "border-primary" : "border-secondary";

            // Status color
            const statusColor =
              current.finalStatus === "Present"
                ? "bg-success"
                : current.finalStatus === "Absent"
                ? "bg-danger"
                : current.finalStatus === "On Leave"
                ? "bg-warning text-dark"
                : "bg-dark";

            // Counters (count Present, Absent, On Leave)
            const morningStatus = current.morning || "";
            const eveningStatus = current.evening || "";
            const counters = {
              Present: [morningStatus, eveningStatus].filter(
                (s) => s === "Present"
              ).length,
              Absent: [morningStatus, eveningStatus].filter(
                (s) => s === "Absent"
              ).length,
              "On Leave": [morningStatus, eveningStatus].filter(
                (s) => s === "On Leave"
              ).length,
            };

            return (
              <div key={m.id} className="col-md-6 mb-3">
                <div className={`card shadow-sm ${cardBorder}`}>
                  <div className="card-body">
                    <h5 className="fw-bold">{m.name}</h5>
                    <p className="text-muted">{m.designation}</p>

                    {/* Counters */}
                    <div className="mb-2">
                      <span className="badge bg-success me-1">
                        Present: {counters.Present}
                      </span>
                      <span className="badge bg-danger me-1">
                        Absent: {counters.Absent}
                      </span>
                      <span className="badge bg-warning text-dark">
                        On Leave: {counters["On Leave"]}
                      </span>
                    </div>

                    {/* Dropdowns with labels */}
                    <div className="row mb-2">
                      <div className="col">
                        <label className="form-label fw-bold">
                          Morning (10:00 AM - 4:00 PM)
                        </label>
                        <select
                          className="form-select"
                          value={morningStatus}
                          onChange={(e) =>
                            handleMark(m.id, "morning", e.target.value)
                          }
                          disabled={eveningStatus === "Absent"}
                        >
                          <option value="">Select Morning</option>
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="On Leave">On Leave</option>
                        </select>
                      </div>
                      <div className="col">
                        <label className="form-label fw-bold">
                          Evening (7:00 PM - 12:00 AM)
                        </label>
                        {morningStatus === "On Leave" ||
                        eveningStatus === "On Leave" ? (
                          <select
                            className="form-select"
                            value={current.reason || ""}
                            onChange={(e) => handleReason(m.id, e.target.value)}
                          >
                            <option value="">Select Reason</option>
                            {leaveReasons.map((r, i) => (
                              <option key={i} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            className="form-select"
                            value={eveningStatus}
                            onChange={(e) =>
                              handleMark(m.id, "evening", e.target.value)
                            }
                            disabled={morningStatus === "Absent"}
                          >
                            <option value="">Select Evening</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="On Leave">On Leave</option>
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Final Status */}
                    <div className="mt-2">
                      <span className={`badge ${statusColor}`}>
                        {current.finalStatus || "Not Marked"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AttendancePage;

import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase";

function SummaryPage() {
  const [members, setMembers] = useState([]);
  const [attendanceValues, setAttendanceValues] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [expenditures, setExpenditures] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Fetch members
  useEffect(() => {
    const membersRef = ref(database, "members");
    onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const membersList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setMembers(membersList);
      } else setMembers([]);
    });
  }, []);

  // Fetch attendance values
  useEffect(() => {
    const attValRef = ref(database, "attendanceValues");
    onValue(attValRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const valList = Object.keys(data).map((key) => data[key].value);
        setAttendanceValues(valList);
      } else setAttendanceValues([]);
    });
  }, []);

  // Fetch attendance
  useEffect(() => {
    const attRef = ref(database, `attendance/${selectedMonth}`);
    onValue(attRef, (snapshot) => {
      setAttendance(snapshot.val() || {});
    });
  }, [selectedMonth]);

  // Fetch expenditures
  useEffect(() => {
    const expRef = ref(database, "expenditures");
    onValue(expRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const expList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setExpenditures(expList);
      } else setExpenditures([]);
    });
  }, []);

  // Attendance summary
  const getAttendanceCounts = (memberId) => {
    const counts = {};
    attendanceValues.forEach((val) => (counts[val] = 0));
    Object.keys(attendance || {}).forEach((date) => {
      if (attendance[date][memberId]) {
        const status = attendance[date][memberId].status;
        if (counts[status] !== undefined) counts[status]++;
      }
    });
    return counts;
  };

  // Expenditure summary
  const totalExpenditure = expenditures.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );
  const totalPaid = expenditures.reduce(
    (sum, e) => sum + (e.paidAmount || 0),
    0
  );
  const totalRemaining = totalExpenditure - totalPaid;

  return (
    <div className="w-100">
      <h4 className="mb-3 text-center">Summary Page</h4>

      <div className="d-flex justify-content-center mb-3">
        <input
          type="month"
          className="form-control w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {/* Attendance Summary */}
      <h5 className="mt-4">Attendance Summary</h5>
      <table className="table table-bordered table-striped text-center">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            {attendanceValues.map((val, i) => (
              <th key={i}>{val}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const counts = getAttendanceCounts(m.id);
            return (
              <tr key={m.id}>
                <td>{m.name}</td>
                {attendanceValues.map((val, i) => (
                  <td key={i}>{counts[val]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Expenditure Summary */}
      <h5 className="mt-4">Expenditure Summary</h5>
      <table className="table table-bordered text-center">
        <thead className="table-dark">
          <tr>
            <th>Total Expenditure</th>
            <th>Total Paid</th>
            <th>Total Remaining</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>₹{totalExpenditure}</td>
            <td>₹{totalPaid}</td>
            <td>₹{totalRemaining}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default SummaryPage;

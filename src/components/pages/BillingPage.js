import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, update, onValue } from "firebase/database";
import { database } from "../../firebase";
import "bootstrap/dist/css/bootstrap.min.css";

function BillingPage() {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [billingMonth, setBillingMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [loading, setLoading] = useState(true);

  // Payment gateway script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadMembers(currentUser.uid);
      }
    });
  }, []);

  const loadMembers = (uid) => {
    const membersRef = ref(database, `users/${uid}/members`);
    onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      const membersList = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setMembers(membersList);
      setLoading(false);
    });
  };

  const generateBill = async (memberId, amount) => {
    if (!user) return;

    // Load payment gateway
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    // Create order in backend / here we simulate
    const options = {
      key: "rzp_test_YourTestKey", // Replace with your Razorpay test key
      amount: amount * 100, // in paise
      currency: "INR",
      name: "Your Company Name",
      description: `Monthly Billing for ${billingMonth}`,
      handler: function (response) {
        // Payment success
        const billingRef = ref(
          database,
          `users/${user.uid}/billing/${billingMonth}/${memberId}`
        );
        update(billingRef, {
          amount,
          status: "Paid",
          paymentId: response.razorpay_payment_id,
          timestamp: Date.now(),
        });
        alert("Payment Successful!");
      },
      prefill: {
        email: user.email,
      },
      theme: { color: "#0d6efd" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className="container my-4">
      <h2 className="text-center fw-bold mb-4">💳 Monthly Billing</h2>

      <div className="row mb-3 justify-content-center">
        <div className="col-md-3">
          <input
            type="month"
            className="form-control"
            value={billingMonth}
            onChange={(e) => setBillingMonth(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="row">
          {members.map((member) => (
            <div key={member.id} className="col-md-6 mb-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold">{member.name}</h5>
                  <p className="text-muted">{member.designation}</p>
                  <div className="mb-2">
                    <span className="badge bg-primary">
                      Amount: ₹{member.salary || 0}
                    </span>
                  </div>
                  <button
                    className="btn btn-success w-100"
                    onClick={() => generateBill(member.id, member.salary || 0)}
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BillingPage;

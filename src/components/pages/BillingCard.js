import React, { useState } from "react";
import "animate.css";

function BillingCard() {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  return (
    <>
      {/* Billing Card */}
      <div className="col-md-6 col-lg-4">
        <div className="card shadow-sm h-100 text-center">
          <div className="card-body">
            <i className="bi bi-wallet2 fs-1 text-primary mb-3"></i>
            <h5 className="card-title">Billing</h5>
            <p className="card-text">
              Generate monthly bills and pay in a timely manner.
            </p>
            <button className="btn btn-primary w-100" onClick={handleClick}>
              Go to Billing
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content animate__animated animate__fadeInDown">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                  Notice
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClose}
                ></button>
              </div>
              <div className="p-4 rounded border-start border-4 border-primary bg-light shadow-sm">
                <p
                  className="mb-0 text-dark fw-bold"
                  style={{ color: "#000000" }}
                >
                  <i className="bi bi-info-circle-fill text-primary me-2"></i>
                  <strong style={{ color: "#B22222" }}>Notice:</strong> This
                  section is currently under construction.
                  <br />
                  As a free user, you cannot access the payment functionality at
                  this moment.
                  <br />
                  We will notify you as soon as the payment feature is
                  available.
                  <br />
                  Thank you for your patience and understanding.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleClose}
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BillingCard;

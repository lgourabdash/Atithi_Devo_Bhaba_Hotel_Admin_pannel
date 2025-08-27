import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import {
  addMember,
  deleteMember,
  addDesignation,
  removeDesignation,
  updateSalary,
  listenMembers,
  listenDesignations,
} from "../../dbcon";
import { onAuthStateChanged } from "firebase/auth";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/ViewMembers.css";

function ViewMembers() {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [designations, setDesignations] = useState([]);
  const [newDesignation, setNewDesignation] = useState("");
  const [designationKeys, setDesignationKeys] = useState({});
  const [removeDesig, setRemoveDesig] = useState("");

  // Salary states
  const [selectedMemberForAdd, setSelectedMemberForAdd] = useState("");
  const [addSalaryAmount, setAddSalaryAmount] = useState("");
  const [selectedMemberForUpdate, setSelectedMemberForUpdate] = useState("");
  const [updateSalaryAmount, setUpdateSalaryAmount] = useState("");

  // Delete confirmation
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Track login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // Fetch members
  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenMembers(user.uid, (membersList) => {
      setMembers(membersList);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch designations
  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenDesignations(
      user.uid,
      ({ desigList, mapping }) => {
        setDesignations(desigList);
        setDesignationKeys(mapping);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handlers
  const handleAddMember = () => {
    if (!name || !designation)
      return alert("Please enter both Name and Designation");
    addMember(user.uid, name, designation, user.email);
    setName("");
    setDesignation("");
  };

  const handleAddDesignation = () => {
    if (!newDesignation.trim()) return alert("Please enter a designation");
    if (newDesignation.trim().toLowerCase() === "leave")
      return alert('The designation "leave" is not allowed.');
    addDesignation(user.uid, newDesignation);
    setNewDesignation("");
  };
  const handleRemoveDesignation = () => {
    if (!removeDesig) return alert("Please select a designation to remove");
    const keyToRemove = designationKeys[removeDesig];
    if (!keyToRemove) return alert("Invalid designation selected");
    removeDesignation(user.uid, keyToRemove)
      .then(() => {
        alert(`Designation "${removeDesig}" removed successfully`);
        setRemoveDesig("");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to remove designation");
      });
  };

  const confirmDeleteMember = (member) => {
    setMemberToDelete(member);
    setShowConfirmModal(true);
  };

  const handleDeleteMember = () => {
    if (!memberToDelete) return;
    deleteMember(user.uid, memberToDelete.id)
      .then(() => {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to remove member");
      })
      .finally(() => {
        setMemberToDelete(null);
      });
  };

  // Salary Handlers
  const handleAddSalary = () => {
    if (!selectedMemberForAdd || !addSalaryAmount)
      return alert("Select member and enter salary amount");
    updateSalary(user.uid, selectedMemberForAdd, addSalaryAmount);
    setSelectedMemberForAdd("");
    setAddSalaryAmount("");
  };
  const handleUpdateSalary = () => {
    if (!selectedMemberForUpdate || !updateSalaryAmount)
      return alert("Select member and enter salary amount");
    updateSalary(user.uid, selectedMemberForUpdate, updateSalaryAmount);
    setSelectedMemberForUpdate("");
    setUpdateSalaryAmount("");
  };

  return (
    <div className="container-fluid">
      <div className="text-center my-4 mb-5">
        <h2 className="fw-bold">👥 Members Management</h2>
      </div>

      <div className="row g-4">
        {/* Add Designation */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white fw-bold">
              ➕ Add Designation
            </div>
            <div className="card-body">
              <input
                type="text"
                placeholder="Enter Designation"
                className="form-control mb-3"
                value={newDesignation}
                onChange={(e) => setNewDesignation(e.target.value)}
              />
              <button
                className="btn btn-success w-100"
                onClick={handleAddDesignation}
              >
                Add Designation
              </button>
            </div>
          </div>
        </div>

        {/* Remove Designation */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-danger text-white fw-bold">
              ❌ Remove Designation
            </div>
            <div className="card-body">
              <select
                className="form-select mb-3"
                value={removeDesig}
                onChange={(e) => setRemoveDesig(e.target.value)}
              >
                <option value="">Select Designation</option>
                {designations.map((d, i) => (
                  <option key={i}>{d}</option>
                ))}
              </select>
              <button
                className="btn btn-danger w-100"
                onClick={handleRemoveDesignation}
              >
                Remove Designation
              </button>
            </div>
          </div>
        </div>

        {/* Add Member */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white fw-bold">
              ➕ Add Member
            </div>
            <div className="card-body">
              <input
                type="text"
                placeholder="Full Name"
                className="form-control mb-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <select
                className="form-select mb-3"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="">Select Designation</option>
                {designations.map((d, i) => (
                  <option key={i}>{d}</option>
                ))}
              </select>
              <button
                className="btn btn-primary w-100"
                onClick={handleAddMember}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>

        {/* Add Salary */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-info text-white fw-bold">
              💰 Add Monthly Salary
            </div>
            <div className="card-body">
              <select
                className="form-select mb-3"
                value={selectedMemberForAdd}
                onChange={(e) => setSelectedMemberForAdd(e.target.value)}
              >
                <option value="">Select Member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Enter Salary Amount"
                className="form-control mb-3"
                value={addSalaryAmount}
                onChange={(e) => setAddSalaryAmount(e.target.value)}
              />
              <button className="btn btn-info w-100" onClick={handleAddSalary}>
                Add Monthly Salary
              </button>
            </div>
          </div>
        </div>

        {/* Update Salary */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-warning text-white fw-bold">
              🔄 Update Monthly Salary
            </div>
            <div className="card-body">
              <select
                className="form-select mb-3"
                value={selectedMemberForUpdate}
                onChange={(e) => setSelectedMemberForUpdate(e.target.value)}
              >
                <option value="">Select Member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Enter New Salary Amount"
                className="form-control mb-3"
                value={updateSalaryAmount}
                onChange={(e) => setUpdateSalaryAmount(e.target.value)}
              />
              <button
                className="btn btn-warning w-100"
                onClick={handleUpdateSalary}
              >
                Update Monthly Salary
              </button>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="card shadow-sm mt-4">
          <div className="card-header bg-dark text-white fw-bold">
            Members List
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle text-center mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Monthly Salary</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.length > 0 ? (
                  members.map((m) => (
                    <tr key={m.id}>
                      <td className="fw-semibold">{m.name}</td>
                      <td>{m.designation}</td>
                      <td>{m.salary || 0}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => confirmDeleteMember(m)}
                        >
                          Remove / Leave Member
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>No members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you want to delete <strong>{memberToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            No
          </Button>
          <Button variant="danger" onClick={handleDeleteMember}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
      >
        <Modal.Header className="bg-success text-white">
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <strong>{memberToDelete?.name}</strong> has been successfully deleted.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowSuccessModal(false)}>
            Okay
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ViewMembers;

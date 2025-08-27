import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { auth } from "../../firebase";
import {
  addExpenditureItem,
  updateExpenditureItem,
  removeExpenditureItem,
  listenExpenditureItems,
  saveHotelTotal,
  updateExpenditureName,
  updateExpenditureCategory,
} from "../../dbcon";

/** --- helpers --- */
function rupeesInWords(num) {
  if (num === "" || num == null) return "";
  const n = Number(num);
  if (Number.isNaN(n)) return "";
  if (n === 0) return "zero rupees";
  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const toWords99 = (x) => {
    if (x < 20) return ones[x];
    const t = Math.floor(x / 10),
      o = x % 10;
    return `${tens[t]}${o ? " " + ones[o] : ""}`.trim();
  };

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;

  const parts = [];
  if (crore) parts.push(`${toWords99(crore)} crore`);
  if (lakh) parts.push(`${toWords99(lakh)} lakh`);
  if (thousand) parts.push(`${toWords99(thousand)} thousand`);
  if (hundred) parts.push(`${ones[hundred]} hundred`);
  if (rest) parts.push(toWords99(rest));

  return `${parts.join(" ")} rupees`.replace(/\s+/g, " ").trim();
}

export default function ExpenditureDetails() {
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedQty, setSelectedQty] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [entryDate, setEntryDate] = useState("");
  const [updatedAmount, setUpdatedAmount] = useState("");
  const [updatedEntryDate, setUpdatedEntryDate] = useState("");
  const [nowTime, setNowTime] = useState(new Date().toLocaleTimeString());
  const [isHotelTotalSaved, setIsHotelTotalSaved] = useState(false);
  // 🔹 Modal States
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "item" | "qty" | "category"
  const [modalValue, setModalValue] = useState(""); // current name/qty/category
  const [newValue, setNewValue] = useState(""); // entered in modal

  useEffect(() => {
    const t = setInterval(
      () => setNowTime(new Date().toLocaleTimeString()),
      1000
    );
    return () => clearInterval(t);
  }, []);

  const [thisMonthLabel, setThisMonthLabel] = useState(
    new Date().toLocaleString(undefined, { month: "long" })
  );

  useEffect(() => {
    const checkMonth = () => {
      setThisMonthLabel(
        new Date().toLocaleString(undefined, { month: "long" })
      );
    };
    const interval = setInterval(checkMonth, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  // 🔗 Sync items from Firebase
  useEffect(() => {
    // Subscribe to auth state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Only call DB functions if user exists
        listenExpenditureItems((list) => setItems(list));
        // Similarly, you can listen hotel totals, etc.
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    if (!itemName || !itemCategory || !itemPrice || !itemQty) return;
    await addExpenditureItem({
      name: itemName,
      category: itemCategory,
      price: itemPrice,
      quantity: itemQty,
    });
    setItemName("");
    setItemCategory("");
    setItemPrice("");
    setItemQty("");
  };

  const handleRemoveItem = async () => {
    if (!selectedId) return;
    await removeExpenditureItem(selectedId);
    setSelectedId("");
    if (!selectedId) return;
    const item = items.find((it) => it.id === selectedId);
    setModalType("item");
    setModalValue(item?.name || "");
    setNewValue("");
    setShowRenameModal(true);
  };

  const handleRenameItem = async () => {
    if (!selectedId) return;
    const item = items.find((it) => it.id === selectedId);
    const newName = window.prompt("Enter new item name", item?.name || "");
    if (!newName) return;

    await updateExpenditureItem(selectedId, item.price, item.quantity);
    // update only the name separately
    import("firebase/database").then(({ ref, update }) => {
      const { database } = require("../../firebase");
      update(ref(database, `expenditures/items/${selectedId}`), {
        name: newName,
      });
    });

    if (!selectedId) return;
    // eslint-disable-next-line no-const-assign
    item = items.find((it) => it.id === selectedId);
    setModalType("item");
    setModalValue(item?.name || "");
    setNewValue("");
    setShowRenameModal(true);
  };

  const handleRenameQty = async () => {
    if (!selectedId) return;
    const item = items.find((it) => it.id === selectedId);
    const newQty = window.prompt("Enter new quantity", item?.quantity || "");
    if (!newQty || isNaN(newQty)) return;
    await updateExpenditureItem(selectedId, item.price, newQty);
  };

  const handleRemoveQty = async () => {
    if (!selectedId) return;
    const item = items.find((it) => it.id === selectedId);
    await updateExpenditureItem(selectedId, item.price, 0);
  };

  const handleRenameCategory = async () => {
    if (!selectedCategory) return;
    const newCategory = window.prompt(
      "Enter new category name",
      selectedCategory
    );
    if (!newCategory) return;

    items
      .filter((it) => it.category === selectedCategory)
      .forEach((it) => {
        import("firebase/database").then(({ ref, update }) => {
          const { database } = require("../../firebase");
          update(ref(database, `expenditures/items/${it.id}`), {
            category: newCategory,
          });
        });
      });

    setSelectedCategory("");
  };

  const handleRemoveCategory = async () => {
    if (!selectedCategory) return;
    const filtered = items.filter((it) => it.category === selectedCategory);
    await Promise.all(filtered.map((it) => removeExpenditureItem(it.id)));
    setSelectedCategory("");
  };

  const saveHotelTotalHandler = async () => {
    await saveHotelTotal(month, {
      amount: Number(totalAmount),
      entryDate,
    });
    setIsHotelTotalSaved(true);
  };

  const updateHotelTotal = async () => {
    if (!updatedAmount || !updatedEntryDate) {
      alert("Please fill all fields to update");
      return;
    }

    try {
      await saveHotelTotal({
        amount: updatedAmount,
        month,
        entryDate: updatedEntryDate,
        updatedAt: new Date().toISOString(),
      });
      alert("Hotel total updated successfully!");
    } catch (err) {
      console.error("Error updating hotel total:", err);
      alert("Failed to update");
    }
  };
  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* Add Items */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm rounded-3 text-center p-3 h-100">
            <div className="card-body">
              <div className="mb-3 text-primary fs-1">
                <i className="fas fa-plus-circle"></i>
              </div>
              <h5 className="card-title fw-bold">Add Items</h5>
              <p className="text-muted">
                Add new items with category, price and quantity.
              </p>

              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  placeholder="Item Name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <label>Item Name</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  placeholder="Category"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                />
                <label>Item Category</label>
              </div>

              <div className="form-floating mb-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Price"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                />
                <label>Item Price</label>
              </div>
              <small className="text-muted d-block mb-3">
                ₹ {rupeesInWords(itemPrice)}
              </small>

              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Quantity"
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                />
                <label>Item Quantity</label>
              </div>

              <button
                className="btn btn-success w-100 mb-3"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i> Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Right side (Save + Update + Display stacked) */}
        <div className="col-md-6 col-lg-8 d-flex flex-column gap-4">
          <div className="row g-4">
            {/* Hotel Total Sell */}
            <div className="col-md-6">
              <div className="card shadow-sm rounded-3 text-center p-3 h-100">
                <div className="card-body">
                  <div className="mb-3 text-success fs-1">
                    <i className="fas fa-hotel"></i>
                  </div>
                  <h5 className="card-title fw-bold">
                    Hotel Total Sell of {thisMonthLabel}
                  </h5>
                  <p className="text-muted">Enter hotel’s total sell record.</p>

                  <div className="form-floating mb-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Total Amount"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      disabled={isHotelTotalSaved}
                    />
                    <label>Total Amount</label>
                  </div>
                  <small className="text-muted d-block mb-3">
                    ₹ {rupeesInWords(totalAmount)}
                  </small>

                  <div className="form-floating mb-3">
                    <input
                      type="month"
                      className="form-control"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    />
                    <label>Select Month</label>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="date"
                      className="form-control"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                    />
                    <label>Entry Date</label>
                  </div>

                  <button
                    className="btn btn-success w-100"
                    onClick={saveHotelTotalHandler}
                  >
                    <i className="fas fa-save me-2"></i> Save Hotel Total Sell
                  </button>
                </div>
              </div>
            </div>

            {/* Update Hotel Total */}
            <div className="col-md-6">
              <div className="card shadow-sm rounded-3 text-center p-3 h-100">
                <div className="card-body">
                  <div className="mb-3 text-info fs-1">
                    <i className="bi bi-arrow-repeat"></i>
                  </div>
                  <h5 className="card-title fw-bold">
                    Update Hotel Total Sell ({thisMonthLabel})
                  </h5>
                  <p className="text-muted">Update monthly sales details.</p>

                  <div className="form-floating mb-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Amount"
                      value={updatedAmount}
                      onChange={(e) => setUpdatedAmount(e.target.value)}
                    />
                    <label>Updated Hotel Total Amount</label>
                  </div>
                  <small className="text-muted d-block mb-3">
                    ₹ {rupeesInWords(updatedAmount)}
                  </small>

                  <div className="form-floating mb-3">
                    <input
                      type="date"
                      className="form-control"
                      value={updatedEntryDate}
                      onChange={(e) => setUpdatedEntryDate(e.target.value)}
                    />
                    <label>Updated Entry Date</label>
                  </div>

                  <div className="form-floating mb-3">
                    <input className="form-control" value={nowTime} readOnly />
                    <label>Updated Time (Auto)</label>
                  </div>

                  <button
                    className="btn btn-info text-white w-100"
                    onClick={updateHotelTotal}
                  >
                    <i className="fas fa-sync-alt me-2"></i> Update
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Total Sell Display (span full right side) */}
          <div className="card shadow-sm rounded-3 p-3 text-center flex-grow-1 d-flex align-items-center justify-content-center">
            {totalAmount ? (
              <h5 className="mb-0 fw-bold text-danger">
                Hotel total sell {thisMonthLabel}: ₹ {totalAmount}
              </h5>
            ) : (
              <h5 className="mb-0 fw-bold text-danger">
                Hotel total sell {thisMonthLabel} will display at this place
              </h5>
            )}
          </div>
        </div>

        {/* Remove & Rename Item */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm rounded-3 text-center p-3 h-100">
            <div className="card-body">
              <div className="mb-3 text-danger fs-1">
                <i className="bi bi-box-seam"></i>
              </div>
              <h5 className="card-title fw-bold">Remove & Rename Item</h5>
              <p className="text-muted">Select and manage individual items.</p>

              <div
                className="mb-3"
                style={{ maxHeight: "150px", overflowY: "auto" }}
              >
                <select
                  className="form-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="">Select Item</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="d-flex gap-3">
                <button
                  className="btn btn-outline-warning w-50"
                  onClick={handleRenameItem}
                >
                  <i className="bi bi-pencil-square me-1"></i> Rename
                </button>
                <button
                  className="btn btn-outline-danger w-50"
                  onClick={handleRemoveItem}
                >
                  <i className="bi bi-trash-fill me-1"></i> Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Remove & Rename Quantity */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm rounded-3 text-center p-3 h-100">
            <div className="card-body">
              <div className="mb-3 text-warning fs-1">
                <i className="bi bi-stack"></i>
              </div>
              <h5 className="card-title fw-bold">Remove & Rename Quantity</h5>
              <p className="text-muted">Manage quantity for selected items.</p>

              <div
                className="mb-3"
                style={{ maxHeight: "150px", overflowY: "auto" }}
              >
                <select
                  className="form-select"
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(e.target.value)}
                >
                  <option value="">Select Quantity</option>
                  {items.find((it) => it.id === selectedId)?.qty &&
                    Array.from(
                      {
                        length: Number(
                          items.find((it) => it.id === selectedId).qty
                        ),
                      },
                      (_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}
                        </option>
                      )
                    )}
                </select>
              </div>

              <div className="d-flex gap-3">
                <button
                  className="btn btn-outline-warning w-50"
                  onClick={handleRenameQty}
                >
                  <i className="bi bi-pencil-square me-1"></i> Rename
                </button>
                <button
                  className="btn btn-outline-danger w-50"
                  onClick={handleRemoveQty}
                >
                  <i className="bi bi-trash-fill me-1"></i> Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Remove & Rename Category */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm rounded-3 text-center p-3 h-100">
            <div className="card-body">
              <div className="mb-3 text-secondary fs-1">
                <i className="bi bi-tags"></i>
              </div>
              <h5 className="card-title fw-bold">Remove & Rename Category</h5>
              <p className="text-muted">Modify categories easily.</p>

              <div
                className="mb-3"
                style={{ maxHeight: "150px", overflowY: "auto" }}
              >
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {[...new Set(items.map((it) => it.category))].map(
                    (cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="d-flex gap-3">
                <button
                  className="btn btn-outline-warning w-50"
                  onClick={handleRenameCategory}
                >
                  <i className="bi bi-pencil-square me-1"></i> Rename
                </button>
                <button
                  className="btn btn-outline-danger w-50"
                  onClick={handleRemoveCategory}
                >
                  <i className="bi bi-trash-fill me-1"></i> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*Expenditure Summary table*/}
      <div className="card shadow-sm rounded-3 mt-5">
        <div className="card-body">
          <h5 className="fw-bold mb-4 text-center text-primary">
            Expenditure Summary
          </h5>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>SL No.</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={it.id}>
                  <td>{i + 1}</td>
                  <td>{it.name}</td>
                  <td>{it.category}</td>
                  <td>{it.quantity}</td>
                  <td>₹{it.price}</td>
                  <td>₹{it.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="5" className="text-end fw-bold">
                  Total Expenditure:
                </td>
                <td className="fw-bold text-danger">
                  ₹{items.reduce((sum, it) => sum + (it.total || 0), 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* 🔹 Rename Modal */}
        <div
          className={`modal fade ${showRenameModal ? "show d-block" : ""}`}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rename {modalType}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRenameModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Your current {modalType} is <b>{modalValue}</b>
                </p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter new value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRenameModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    if (!newValue) return;
                    if (modalType === "item") {
                      await updateExpenditureName(selectedId, newValue);
                    }
                    if (modalType === "category") {
                      await updateExpenditureCategory(
                        selectedCategory,
                        newValue
                      );
                    }
                    setShowRenameModal(false);
                  }}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 Remove Modal */}
        <div
          className={`modal fade ${showRemoveModal ? "show d-block" : ""}`}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRemoveModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete <b>{modalValue}</b>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRemoveModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    if (modalType === "item") {
                      await removeExpenditureItem(selectedId);
                    }
                    setShowRemoveModal(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* 🔹 Remove Modal */}
        <div
          className={`modal fade ${showRemoveModal ? "show d-block" : ""}`}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRemoveModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete <b>{modalValue}</b>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRemoveModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    if (modalType === "item") {
                      await removeExpenditureItem(selectedId);
                    }
                    setShowRemoveModal(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

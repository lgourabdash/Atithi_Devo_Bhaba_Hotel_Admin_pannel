// src/dbcon.js
import { ref, set, onValue, push, remove, update } from "firebase/database";
import { database, auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

// --- Login & Store User Data ---
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Store user info in database
    await storeUserData(user, email);

    return user;
  } catch (err) {
    throw err;
  }
};

// Store user info in DB
export const storeUserData = async (user, email) => {
  if (!user) return;

  const userRef = ref(database, `users/${user.uid}/profile`);
  await set(userRef, {
    uid: user.uid,
    email: email,
    displayName: user.displayName || "",
    lastLogin: Date.now(),
    lastLogout: null, // default null, update on logout
  });
};

// --- Logout ---
// Logout & update lastLogout
export const logoutUser = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}/profile`);
      await update(userRef, {
        lastLogout: Date.now(),
      });
    }
    await auth.signOut();
  } catch (err) {
    console.error("Logout failed:", err);
  }
};
// ✅ Create Member
export const addMember = (uid, name, designation, email) => {
  const membersRef = ref(database, `users/${uid}/members`);
  return push(membersRef, {
    name,
    designation,
    salary: 0,
    addedBy: email,
    timestamp: Date.now(),
  });
};

// ✅ Delete Member
export const deleteMember = (uid, memberId) => {
  const memberRef = ref(database, `users/${uid}/members/${memberId}`);
  return remove(memberRef);
};

// ✅ Add Designation
export const addDesignation = (uid, newDesignation) => {
  const desigRef = ref(database, `users/${uid}/designations`);
  return push(desigRef, { name: newDesignation });
};

// ✅ Remove Designation
export const removeDesignation = (uid, keyToRemove) => {
  const desigRef = ref(database, `users/${uid}/designations/${keyToRemove}`);
  return remove(desigRef);
};

// ✅ Update Salary
export const updateSalary = (uid, memberId, salary) => {
  const memberRef = ref(database, `users/${uid}/members/${memberId}`);
  return update(memberRef, { salary: Number(salary) });
};

// ✅ Listen to Members
export const listenMembers = (uid, callback) => {
  const membersRef = ref(database, `users/${uid}/members`);
  return onValue(membersRef, (snapshot) => {
    const data = snapshot.val();
    const membersList = data
      ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
      : [];
    callback(membersList);
  });
};

// ✅ Listen to Designations
export const listenDesignations = (uid, callback) => {
  const desigRef = ref(database, `users/${uid}/designations`);
  return onValue(desigRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const desigList = Object.keys(data).map((key) => data[key].name);
      const mapping = {};
      Object.keys(data).forEach((key) => {
        mapping[data[key].name] = key;
      });
      callback({ desigList, mapping });
    } else {
      callback({ desigList: [], mapping: {} });
    }
  });
};

// ✅ Attendance Values (Options)
export const listenAttendanceValues = (callback) => {
  // Default options
  const values = ["Present", "Half Day", "On Leave", "Absent"];
  callback(values);
};

// ✅ Mark Attendance
export const markAttendance = (
  uid,
  month,
  date,
  memberId,
  session, // "morning" or "evening"
  status,
  email,
  reason = null
) => {
  const attRef = ref(
    database,
    `users/${uid}/attendance/${month}/${date}/${memberId}`
  );

  return update(attRef, {
    [session]: status, // morning or evening status
    markedBy: email,
    reason: reason || null,
    timestamp: Date.now(),
  }).then(async () => {
    // compute final status after updating
    onValue(
      attRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        const finalStatus = computeFinalStatus(data);
        update(attRef, { finalStatus });
      },
      { onlyOnce: true }
    );
  });
};

// Compute final attendance status
const computeFinalStatus = (data) => {
  const morning = data.morning || "";
  const evening = data.evening || "";

  if (morning === "Absent" || evening === "Absent") {
    return "Absent";
  }
  if (morning === "On Leave" || evening === "On Leave") {
    return `On Leave${data.reason ? " - " + data.reason : ""}`;
  }
  if (morning === "Present" && evening === "Present") {
    return "Present";
  }
  if (
    (morning === "Present" && evening !== "Present") ||
    (evening === "Present" && morning !== "Present")
  ) {
    return "Half Day";
  }
  return "Not Marked";
};

// ✅ Listen to Attendance (Month Wise)
export const listenAttendance = (uid, month, callback) => {
  const attRef = ref(database, `users/${uid}/attendance/${month}`);
  return onValue(attRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
};

// --- Items CRUD ---
export const addExpenditureItem = (item) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const itemRef = ref(database, `users/${user.uid}/expenditures/items`);
  return push(itemRef, {
    name: item.name,
    category: item.category,
    price: parseFloat(item.price),
    quantity: parseInt(item.quantity),
    total: parseFloat(item.price) * parseInt(item.quantity),
    createdAt: Date.now(),
  });
};

export const updateExpenditureItem = (id, price, quantity) => {
  const itemRef = ref(database, `expenditures/items/${id}`);
  return update(itemRef, {
    price: parseFloat(price),
    quantity: parseInt(quantity),
    total: parseFloat(price) * parseInt(quantity),
  });
};

export const updateExpenditureName = (id, newName) => {
  const itemRef = ref(database, `expenditures/items/${id}`);
  return update(itemRef, { name: newName });
};

export const updateExpenditureCategory = (id, newCategory) => {
  const itemRef = ref(database, `expenditures/items/${id}`);
  return update(itemRef, { category: newCategory });
};

export const removeExpenditureItem = (id) => {
  const itemRef = ref(database, `expenditures/items/${id}`);
  return remove(itemRef);
};

export const listenExpenditureItems = (callback) => {
  const itemsRef = ref(database, "expenditures/items");
  return onValue(itemsRef, (snapshot) => {
    const data = snapshot.val();
    const itemsList = data
      ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
      : [];
    callback(itemsList);
  });
};

// ✅ Save Hotel Total (Realtime Database version)
export const saveHotelTotal = (month, data) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const totalRef = ref(database, `users/${user.uid}/hotelTotals/${month}`);
  return set(totalRef, {
    ...data,
    createdAt: Date.now(),
  });
};

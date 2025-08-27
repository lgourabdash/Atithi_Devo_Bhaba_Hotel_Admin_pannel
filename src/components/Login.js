import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Login.css";
import "../styles/mainlogin.css";
import headerLogo from "../assets/Atithi Devo Bhaba/android-chrome-192x192.png";
import footerLogo from "../assets/Technext Software/android-chrome-192x192.png";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// Firebase through dbcon.js
import { loginUser } from "../dbcon";

// Bootstrap
import { Modal, Button, Form } from "react-bootstrap";

// EmailJS
import emailjs from "emailjs-com";

function Login() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [show, setShow] = useState(false);
  const [subject, setSubject] = useState("Choose from dropdown");
  const [showPassword, setShowPassword] = useState(false);

  // EmailJS Send
  const handleSend = () => {
    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          subject,
          to_email: "technextprivatelimited2025@gmail.com",
          name: userName,
          message,
          email,
          phone: `${countryCode} ${phone}`,
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        alert("✅ Email sent successfully!");
        setShow(false);
      })
      .catch((err) => {
        console.error("EmailJS Error:", err);
        alert("❌ Failed to send email");
      });
  };

  // Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(email, password);
      console.log("User logged in:", user);
      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("❌ Invalid email or password");
    }
  };

  return (
    <div className="container-fluid login-page">
      <Helmet>
        <title>Atithi Devo Bhaba - Admin Panel</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Helmet>

      {/* Header */}
      <header className="header-bar2 border-bottom py-3">
        <div className="row align-items-center text-center">
          <div className="col-4 text-start">
            <img src={headerLogo} alt="Header Logo" className="logo" />
          </div>
          <div className="col-4">
            <h2 className="page-title2">Atithi Devo Bhaba - Admin Panel</h2>
          </div>
          <div className="col-4 text-end">
            <img src={headerLogo} alt="Header Logo" className="logo" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="d-flex justify-content-center align-items-center flex-column flex-grow-1">
        <form onSubmit={handleSubmit}>
          <div className="ring">
            <i style={{ "--clr": "#00ff0a" }}></i>
            <i style={{ "--clr": "#ff0057" }}></i>
            <i style={{ "--clr": "#fffd44" }}></i>

            <div className="login">
              <h2 className="text-danger">Login</h2>
              <div className="inputBx">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="inputBx" style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#ff0057",
                  }}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </span>
              </div>

              <div className="inputBx">
                <input type="submit" value="Sign in" />
              </div>

              <div className="inputBx">
                <input
                  type="button"
                  value="Sign Up"
                  className="btn font-weight-bold text-warning w-100"
                  onClick={() => setShow(true)}
                />
              </div>

              {message && <p style={{ color: "white" }}>{message}</p>}
            </div>
          </div>
        </form>
      </main>

      {/* SignUp Modal */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contact Database Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            If you want to sign up or register, please contact your Database
            Admin.
          </p>
          <p>
            Your Database Admin is:{" "}
            <a href="mailto:technextprivatelimited2025@gmail.com">
              Technext Software Private Limited.
            </a>
          </p>
          {/* Form Fields */}
          <Form.Group className="mt-3">
            <Form.Label>Your Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Your Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Your Phone Number</Form.Label>
            <div className="d-flex">
              <Form.Select
                style={{ maxWidth: "120px", marginRight: "10px" }}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="+91">🇮🇳 +91 (India)</option>
                <option value="+1">🇺🇸 +1 (USA)</option>
                <option value="+44">🇬🇧 +44 (UK)</option>
                <option value="+61">🇦🇺 +61 (Australia)</option>
                <option value="+971">🇦🇪 +971 (UAE)</option>
              </Form.Select>
              <Form.Control
                type="text"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) setPhone(value);
                }}
                maxLength={10}
              />
            </div>
            {phone.length > 0 && phone.length !== 10 && (
              <small className="text-danger">
                Phone number must be exactly 10 digits.
              </small>
            )}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Select a subject</Form.Label>
            <Form.Select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option>Choose from dropdown</option>
              <option>Request New Account</option>
              <option>Password Reset</option>
              <option>Profile Update</option>
              <option>Other Query</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSend}>
            Send Email
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Footer */}
      <footer className="footer-bar border-top py-3">
        <div className="row align-items-center text-center">
          <div className="col-4 text-start">
            <img src={footerLogo} alt="Footer Logo" className="logo" />
          </div>
          <div className="col-4">
            <p className="m-0 footer-text">
              © All Rights Reserved | Technext Software Private Limited.
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

export default Login;

// import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "../styles/Login.css";
// import "../styles/mainlogin.css";
// import headerLogo from "../assets/Atithi Devo Bhaba/android-chrome-192x192.png";
// import footerLogo from "../assets/Technext Software/android-chrome-192x192.png";
// import { Helmet } from "react-helmet";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// // Firebase
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebase";

// // Bootstrap
// import { Modal, Button, Form } from "react-bootstrap";

// // ✅ EmailJS
// import emailjs from "emailjs-com";

// function Login() {
//   const [userName, setUserName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [phone, setPhone] = useState("");
//   const [countryCode, setCountryCode] = useState("+91"); // default India
//   // --- For SignUp modal ---
//   const [show, setShow] = useState(false);
//   const [subject, setSubject] = useState("Choose from dropdown");
//   const [showPassword, setShowPassword] = useState(false);

//   // ✅ Send Email using EmailJS
//   const handleSend = () => {
//     emailjs
//       .send(
//         process.env.REACT_APP_EMAILJS_SERVICE_ID, // from .env
//         process.env.REACT_APP_EMAILJS_TEMPLATE_ID, // from .env
//         {
//           subject: subject,
//           to_email: "technextprivatelimited2025@gmail.com", // Admin email
//           name: userName,
//           message: message,
//           email: email,
//           phone: `${countryCode} ${phone}`,
//         },
//         process.env.REACT_APP_EMAILJS_PUBLIC_KEY // from .env
//       )
//       .then(() => {
//         alert("✅ Email sent successfully!");
//         setShow(false);
//       })
//       .catch((err) => {
//         console.error("EmailJS Error:", err);
//         alert("❌ Failed to send email");
//       });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       console.log("User logged in:", userCredential.user);
//       setMessage("✅ Login successful! Redirecting...");
//       setTimeout(() => {
//         window.location.href = "/dashboard";
//       }, 1000);
//     } catch (error) {
//       console.error(error);
//       setMessage("❌ Invalid email or password");
//     }
//   };

//   return (
//     <div className="container-fluid login-page">
//       <Helmet>
//         <title>Atithi Devo Bhaba - Admin Panel</title>
//         <link rel="icon" type="image/png" href="/favicon.png" />
//       </Helmet>

//       {/* Header */}
//       <header className="header-bar2 border-bottom py-3">
//         <div className="row align-items-center text-center">
//           <div className="col-4 text-start">
//             <img src={headerLogo} alt="Header Logo" className="logo" />
//           </div>
//           <div className="col-4">
//             <h2 className="page-title2">Atithi Devo Bhaba - Admin Panel</h2>
//           </div>
//           <div className="col-4 text-end">
//             <img src={headerLogo} alt="Header Logo" className="logo" />
//           </div>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="d-flex justify-content-center align-items-center flex-column flex-grow-1">
//         <form onSubmit={handleSubmit}>
//           <div className="ring">
//             <i style={{ "--clr": "#00ff0a" }}></i>
//             <i style={{ "--clr": "#ff0057" }}></i>
//             <i style={{ "--clr": "#fffd44" }}></i>

//             <div className="login">
//               <h2 className="text-danger">Login</h2>
//               <div className="inputBx">
//                 <input
//                   type="email"
//                   placeholder="Email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="inputBx" style={{ position: "relative" }}>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//                 <span
//                   onClick={() => setShowPassword(!showPassword)}
//                   style={{
//                     position: "absolute",
//                     right: "10px",
//                     top: "50%",
//                     transform: "translateY(-50%)",
//                     cursor: "pointer",
//                     color: "#ff0057", // unique highlight color
//                   }}
//                 >
//                   <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
//                 </span>
//               </div>

//               <div className="inputBx">
//                 <input type="submit" value="Sign in" />
//               </div>

//               {/* ✅ New SignUp Modal Trigger */}
//               <div className="inputBx">
//                 <input
//                   type="button"
//                   value="Sign Up"
//                   className="btn font-weight-bold text-warning w-100"
//                   onClick={() => setShow(true)}
//                 />
//               </div>

//               {message && <p style={{ color: "white" }}>{message}</p>}
//             </div>
//           </div>
//         </form>
//       </main>

//       {/* SignUp Modal */}
//       <Modal show={show} onHide={() => setShow(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Contact Database Admin</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>
//             If you really want to sign up or register, please contact your
//             Database Admin.
//           </p>
//           <p>
//             Your Database Admin is:{" "}
//             <a href="mailto:technextprivatelimited2025@gmail.com">
//               Technext Software Private Limited.
//             </a>
//           </p>

//           {/* Name */}
//           <Form.Group className="mt-3">
//             <Form.Label>Your Name</Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="Enter your name"
//               value={userName}
//               onChange={(e) => setUserName(e.target.value)}
//             />
//           </Form.Group>

//           {/* Email */}
//           <Form.Group className="mt-3">
//             <Form.Label>Your Email</Form.Label>
//             <Form.Control
//               type="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </Form.Group>

//           {/* Phone */}
//           <Form.Group className="mt-3">
//             <Form.Label>Your Phone Number</Form.Label>
//             <div className="d-flex">
//               {/* Country Code Dropdown */}
//               <Form.Select
//                 style={{ maxWidth: "120px", marginRight: "10px" }}
//                 value={countryCode}
//                 onChange={(e) => setCountryCode(e.target.value)}
//               >
//                 <option value="+91">🇮🇳 +91 (India)</option>
//                 <option value="+1">🇺🇸 +1 (USA)</option>
//                 <option value="+44">🇬🇧 +44 (UK)</option>
//                 <option value="+61">🇦🇺 +61 (Australia)</option>
//                 <option value="+971">🇦🇪 +971 (UAE)</option>
//                 {/* You can add more country codes as needed */}
//               </Form.Select>

//               {/* Phone Input */}
//               <Form.Control
//                 type="text"
//                 placeholder="Enter 10-digit number"
//                 value={phone}
//                 onChange={(e) => {
//                   const value = e.target.value.replace(/\D/g, ""); // remove non-numeric
//                   if (value.length <= 10) {
//                     setPhone(value);
//                   }
//                 }}
//                 maxLength={10}
//               />
//             </div>
//             {/* Validation Message */}
//             {phone.length > 0 && phone.length !== 10 && (
//               <small className="text-danger">
//                 Phone number must be exactly 10 digits.
//               </small>
//             )}
//           </Form.Group>

//           {/* Dropdown */}
//           <Form.Group className="mt-3">
//             <Form.Label>Select a subject</Form.Label>
//             <Form.Select
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//             >
//               <option>Choose from dropdown</option>
//               <option>Request New Account</option>
//               <option>Password Reset</option>
//               <option>Profile Update</option>
//               <option>Other Query</option>
//             </Form.Select>
//           </Form.Group>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShow(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSend}>
//             Send Email
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Footer */}
//       <footer className="footer-bar border-top py-3">
//         <div className="row align-items-center text-center">
//           <div className="col-4 text-start">
//             <img src={footerLogo} alt="Footer Logo" className="logo" />
//           </div>
//           <div className="col-4">
//             <p className="m-0 footer-text">
//               © All Rights Reserved | Technext Software Private Limited.
//             </p>
//           </div>
//           <div className="col-4 text-end">
//             <img src={footerLogo} alt="Footer Logo" className="logo" />
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default Login;

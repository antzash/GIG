import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginForm from "./Components/Login";
import RegistrationForm from "./Components/Registration";
import ProfilePage from "./Pages/Profile"; // Import the ProfilePage component
import { UserProvider } from "./Context/UserContext"; // Import the UserProvider
import "./tailwind.css";

function App() {
  return (
    <UserProvider>
      {" "}
      {/* Wrap your application with the UserProvider */}
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/profile" element={<ProfilePage />} />{" "}
          {/* Add this line */}
          <Route path="/" element={<LoginForm />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginForm from "./Components/Login";
import RegistrationForm from "./Components/Registration";
import ProfilePage from "./Pages/Profile";
import HomePage from "./Pages/Homepage"; // Import the HomePage component
import { UserProvider } from "./Context/UserContext";
import "./tailwind.css";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<HomePage />} />{" "}
          {/* Set HomePage as the default route */}
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;

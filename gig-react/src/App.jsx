import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginForm from "./Components/Login";
import RegistrationForm from "./Components/Registration";
import ProfilePage from "./Pages/Profile";
import HomePage from "./Pages/Homepage"; // Import the HomePage component
import { UserProvider } from "./Context/UserContext";
import "./tailwind.css";
import UserPage from "./Pages/UserPage";

function App() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<HomePage />} />{" "}
            <Route path="/user/:userId" element={<UserPage />} />
            {/* Set HomePage as the default route */}
          </Routes>
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;

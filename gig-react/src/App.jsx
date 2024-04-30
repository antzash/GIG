import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";
import HomePage from "./Pages/Homepage";
import { UserProvider } from "./Context/UserContext";
import "./tailwind.css";
import UserPage from "./Pages/UserPage";
import Chat from "./Components/Chat";
import RegistrationPage from "./Pages/RegistrationPage"; // Import the RegistrationPage component

function App() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />{" "}
            <Route path="/register" element={<RegistrationPage />} />{" "}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/home" element={<HomePage />} />{" "}
            <Route path="/user/:userId" element={<UserPage />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;

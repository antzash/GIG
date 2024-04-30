import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";
import HomePage from "./Pages/Homepage"; // Import the HomePage component
import { UserProvider } from "./Context/UserContext";
import "./tailwind.css";
import UserPage from "./Pages/UserPage";
import Chat from "./Components/Chat";

function App() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />{" "}
            {/* Set LoginPage as the default route */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/home" element={<HomePage />} />{" "}
            {/* Adjusted HomePage route */}
            <Route path="/user/:userId" element={<UserPage />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;

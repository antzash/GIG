// App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginForm from "./Components/Login";
import RegistrationForm from "./Components/Registration";
import ProfilePage from "./Pages/Profile";
import HomePage from "./Pages/Homepage";
import { UserProvider, useUser } from "./Context/UserContext"; // Import the UserProvider and useUser hook
import "./tailwind.css";
import UserPage from "./Pages/UserPage";
import Chat from "./Components/Chat";

function App() {
  const { user } = useUser(); // Use the useUser hook to access the user context

  // Check if the user is authenticated
  const isAuthenticated = user && user.userId && user.token;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <UserProvider>
        <Router>
          {!isAuthenticated && <Navigate to="/login" />}
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/user/:userId" element={<UserPage />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;

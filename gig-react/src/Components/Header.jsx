import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import gigLogo from "../gig-logo.png"; // Adjust the path as necessary

function Header() {
  const { user, logoutUser } = useUser();
  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = () => {
    logoutUser(); // Call the logoutUser function from UserContext
    navigate("/login"); // Navigate to the login page
  };

  return (
    <header className="text-black p-4 flex justify-between items-center">
      <Link to="/">
        <img src={gigLogo} alt="Gig Logo" className="h-12" />
      </Link>

      <div>
        {user.username && (
          <>
            <span>Welcome, {user.username}</span>
            <nav className="ml-4 inline">
              <Link to="/profile" className="text-black mr-4">
                Profile
              </Link>
              <Link to="/chat" className="text-black mr-4">
                Chat
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;

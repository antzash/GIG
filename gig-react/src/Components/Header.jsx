import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import gigLogo from "../gig-logo.png";
import { FaUser, FaComments } from "react-icons/fa";

function Header() {
  const { user, logoutUser } = useUser();
  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = () => {
    logoutUser(); // Call the logoutUser function from UserContext
    navigate("/"); // Navigate to the login page
  };

  return (
    <header className="text-black p-4 flex justify-between items-center mt-4 ">
      <Link to="/home">
        <img src={gigLogo} alt="Gig Logo" className="h-12 " />
      </Link>

      <div>
        {user.username && (
          <>
            <span>Welcome, {user.username}</span>
            <nav className="ml-4 inline-flex items-center">
              {" "}
              <Link
                to="/profile"
                className="text-xl text-amber-500 mr-4 flex items-center hover:scale-110 hover:shadow-lg"
              >
                {" "}
                <FaUser />
                <span className="ml-2"></span>
              </Link>
              <Link
                to="/chat"
                className="text-xl text-amber-500 mr-4 flex items-center hover:scale-110 hover:shadow-lg"
              >
                {" "}
                <FaComments />
                <span className="ml-2"></span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-amber-500 hover:bg-red-700 hover:scale-110 hover:shadow-lg text-white font-bold py-2 px-4 rounded"
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

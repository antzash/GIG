import React from "react";
import { Link } from "react-router-dom";

function Header({ username }) {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Gig Finder</h1>
      <div>
        <span>Welcome, {username}</span>
        <nav className="ml-4 inline">
          <Link to="/" className="text-white mr-4">
            Home
          </Link>
          <Link to="/profile" className="text-white">
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;

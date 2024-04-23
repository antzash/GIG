import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";

function ProfilePage() {
  const { user, logoutUser } = useUser(); // Access the user and logoutUser function
  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = () => {
    logoutUser(); // Call the logoutUser function when the button is clicked
    navigate("/login"); // Redirect the user to the login page
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Profile Details</h2>
      <div className="bg-white shadow rounded p-4">
        {user.role === "artist" ? (
          <>
            <p className="mb-2">
              <span className="font-bold">Band Name:</span>{" "}
              {user.details?.band_name}
            </p>
            <p className="mb-2">
              <span className="font-bold">Genre:</span> {user.details?.genre}
            </p>
            <p className="mb-2">
              <span className="font-bold">Bio:</span> {user.details?.bio}
            </p>
          </>
        ) : user.role === "venue" ? (
          <>
            <p className="mb-2">
              <span className="font-bold">Venue Name:</span>{" "}
              {user.details?.venue_name}
            </p>
            <p className="mb-2">
              <span className="font-bold">Address:</span>{" "}
              {user.details?.address}
            </p>
            <p className="mb-2">
              <span className="font-bold">Bio:</span> {user.details?.bio}
            </p>
          </>
        ) : (
          <p>No profile details available.</p>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default ProfilePage;

import React, { useContext, useEffect } from "react";
import { useUser } from "../Context/UserContext";

function ProfilePage() {
  const { user } = useUser();

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
    </div>
  );
}

export default ProfilePage;

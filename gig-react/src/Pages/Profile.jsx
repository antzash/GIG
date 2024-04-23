import React, { useContext, useEffect, useState } from "react";
import { useUser } from "../Context/UserContext";

function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    async function fetchProfile() {
      if (!user.userId || !user.token) {
        console.error("User ID or token not available");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5001/api/user/profile/${user.userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
    fetchProfile();
  }, [user]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Profile Details</h2>
      <div className="bg-white shadow rounded p-4">
        <p className="mb-2">
          <span className="font-bold">Band Name:</span>{" "}
          {profile.details?.bandName}
        </p>
        <p className="mb-2">
          <span className="font-bold">Genre:</span> {profile.details?.genre}
        </p>
        <p className="mb-2">
          <span className="font-bold">Bio:</span> {profile.details?.bio}
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;

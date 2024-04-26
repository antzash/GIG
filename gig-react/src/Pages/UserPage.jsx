import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import Header from "../Components/Header";

function UserPage() {
  const { userId } = useParams();
  const { user } = useUser();
  const [profileDetails, setProfileDetails] = useState({});
  const [activeTab, setActiveTab] = useState("gigs"); // Step 1: Define the state for active tab

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/user/profile/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
        const data = await response.json();
        setProfileDetails(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchProfileDetails();
  }, [userId, user.token]);

  return (
    <div>
      <Header />
      <div className="p-4">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-300 rounded-full mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">
            {profileDetails.details?.band_name ||
              profileDetails.details?.venue_name}
          </h2>
          <p className="text-gray-700 mb-2">
            {profileDetails.details?.genre || profileDetails.details?.address}
          </p>
          <p className="text-gray-700 mb-4">{profileDetails.details?.bio}</p>
        </div>
        {/* Tabs */}
        <div className="flex justify-center mt-4">
          <button
            className={`px-4 py-2 mx-2 ${
              activeTab === "gigs" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("gigs")}
          >
            Gigs
          </button>
          <button
            className={`px-4 py-2 mx-2 ${
              activeTab === "reviews" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
        </div>
        {/* Content based on active tab */}
        {activeTab === "gigs" && <div>Content for Gigs</div>}
        {activeTab === "reviews" && <div>Content for Reviews</div>}
      </div>
    </div>
  );
}

export default UserPage;

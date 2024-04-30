import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext"; // Adjust the import path as necessary

const SideBar = () => {
  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);
  const [activeTab, setActiveTab] = useState("artists");
  const { user } = useUser();
  const loggedInUserId = user.userId;

  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/artists");
        const data = await response.json();
        // Filter out the logged-in user from the list of artists
        const filteredArtists = data.filter(
          (artist) => artist.user_id !== loggedInUserId
        );
        setArtists(filteredArtists);
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      }
    };

    const fetchVenues = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/venues");
        const data = await response.json();
        // Filter out the logged-in user from the list of venues
        const filteredVenues = data.filter(
          (venue) => venue.user_id !== loggedInUserId
        );
        setVenues(filteredVenues);
      } catch (error) {
        console.error("Failed to fetch venues:", error);
      }
    };

    fetchArtists();
    fetchVenues();
  }, [loggedInUserId]); // Add loggedInUserId as a dependency

  return (
    <div className="w-1/4 bg-white p-4 border border-amber-400 py-6 px-10 rounded-lg shadow-xl mt-4 ">
      <div className="tabs flex justify-between mb-4">
        <button
          onClick={() => setActiveTab("artists")}
          className={`px-4 py-2 ${
            activeTab === "artists"
              ? "font-bold text-amber-500"
              : "text-gray-500"
          }`}
        >
          Discover Artists
        </button>
        <button
          onClick={() => setActiveTab("venues")}
          className={`px-4 py-2 ${
            activeTab === "venues"
              ? "font-bold text-amber-500"
              : "text-gray-500"
          }`}
        >
          Discover Venues
        </button>
      </div>
      <div className="content overflow-y-auto max-h-96">
        {activeTab === "artists" && (
          <div>
            {artists.map((artist) => (
              <div
                key={artist.user_id}
                className="mb-4"
                onClick={() => navigate(`/user/${artist.user_id}`)}
              >
                <h3 className="text-lg font-semibold">{artist.band_name}</h3>
              </div>
            ))}
          </div>
        )}
        {activeTab === "venues" && (
          <div>
            {venues.map((venue) => (
              <div
                key={venue.user_id}
                className="mb-4"
                onClick={() => navigate(`/user/${venue.user_id}`)}
              >
                <h3 className="text-lg font-semibold">{venue.venue_name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;

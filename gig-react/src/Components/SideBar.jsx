// src/Components/SideBar.jsx

import React, { useState, useEffect } from "react";

const SideBar = () => {
  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);
  const [activeTab, setActiveTab] = useState("artists");

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch("/api/artists");
        const data = await response.json();
        setArtists(data);
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      }
    };

    const fetchVenues = async () => {
      try {
        const response = await fetch("/api/venues");
        const data = await response.json();
        setVenues(data);
      } catch (error) {
        console.error("Failed to fetch venues:", error);
      }
    };

    fetchArtists();
    fetchVenues();
  }, []);

  return (
    <div className="w-1/4 bg-gray-100 p-4 rounded-lg shadow-md">
      <div className="tabs flex justify-between mb-4">
        <button
          onClick={() => setActiveTab("artists")}
          className={`px-4 py-2 ${
            activeTab === "artists"
              ? "font-bold text-blue-500"
              : "text-gray-500"
          }`}
        >
          Discover Artists
        </button>
        <button
          onClick={() => setActiveTab("venues")}
          className={`px-4 py-2 ${
            activeTab === "venues" ? "font-bold text-blue-500" : "text-gray-500"
          }`}
        >
          Discover Venues
        </button>
      </div>
      <div className="content overflow-y-auto max-h-96">
        {activeTab === "artists" && (
          <div>
            {artists.map((artist) => (
              <div key={artist.user_id} className="mb-4">
                <h3 className="text-lg font-semibold">{artist.band_name}</h3>
              </div>
            ))}
          </div>
        )}
        {activeTab === "venues" && (
          <div>
            {venues.map((venue) => (
              <div key={venue.user_id} className="mb-4">
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

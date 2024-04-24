// src/Pages/Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import Header from "../Components/Header";

function ProfilePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);

  const fetchGigs = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/user/profile/${user.userId}/gigs`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch gigs");
      }
      const data = await response.json();
      if (data.length === 0) {
        console.log("No gigs found for this user");
      } else {
        setGigs(data);
      }
    } catch (error) {
      console.error("Error fetching gigs:", error);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [user.userId]); // Use user.userId as the dependency

  const deleteGig = async (gigId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/gigs/${gigId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        console.log("Gig deleted successfully");
        // Refresh the gigs list
        fetchGigs();
      } else {
        console.error("Failed to delete gig");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Your Gigs</h2>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Pay</th>
              <th className="px-4 py-2">Accepted By</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {gigs.map((gig) => (
              <tr key={gig.id}>
                <td className="border px-4 py-2">{gig.title}</td>
                <td className="border px-4 py-2">{gig.description}</td>
                <td className="border px-4 py-2">{gig.date}</td>
                <td className="border px-4 py-2">{gig.time}</td>
                <td className="border px-4 py-2">{gig.pay}</td>
                <td className="border px-4 py-2">{gig.accepted_by}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => deleteGig(gig.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProfilePage;

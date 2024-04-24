// src/Pages/Homepage.jsx
import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import GigPostingForm from "../Components/GigPostingForm";

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/gigs");
        if (!response.ok) {
          throw new Error("Failed to fetch gigs");
        }
        const data = await response.json();
        setGigs(data);
      } catch (error) {
        console.error("Error fetching gigs:", error);
      }
    };

    fetchGigs();
  }, []);

  return (
    <div>
      <Header />
      <h1>Welcome to the Home Page</h1>
      <button onClick={() => setShowModal(true)}>Create Gig</button>
      {showModal && (
        <div className="modal">
          <GigPostingForm />
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      )}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Available Gigs</h2>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Venue</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Pay</th>
              <th className="px-4 py-2">Accepted By</th>
            </tr>
          </thead>
          <tbody>
            {gigs.map((gig) => (
              <tr key={gig.id}>
                <td className="border px-4 py-2">{gig.venue_name}</td>
                <td className="border px-4 py-2">{gig.title}</td>
                <td className="border px-4 py-2">{gig.description}</td>
                <td className="border px-4 py-2">{gig.date}</td>
                <td className="border px-4 py-2">{gig.time}</td>
                <td className="border px-4 py-2">{gig.pay}</td>
                <td className="border px-4 py-2">{gig.accepted_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomePage;

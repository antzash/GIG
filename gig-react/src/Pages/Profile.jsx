import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import Header from "../Components/Header";

function ProfilePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState({});
  const [offerMade, setOfferMade] = useState(false);

  const isVenue = user.role === "venue";
  const isArtist = user.role === "artist";

  useEffect(() => {
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
        setGigs(data);
      } catch (error) {
        console.error("Error fetching gigs:", error);
      }
    };

    const fetchArtists = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/artists");
        if (!response.ok) {
          throw new Error("Failed to fetch artists");
        }
        const data = await response.json();
        setArtists(data);
      } catch (error) {
        console.error("Error fetching artists:", error);
      }
    };

    // Fetch data immediately
    fetchGigs();
    fetchArtists();

    // Set up polling with a shorter interval
    const intervalId = setInterval(() => {
      fetchGigs();
      fetchArtists();
    }, 500); // Poll every 1 second

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [user.userId, user.token]);

  const offerGig = async (gigId) => {
    if (!selectedArtist || !selectedArtist.user_id) {
      console.error("No artist selected");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/gigs/offer/${gigId}/${selectedArtist.user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (response.ok) {
        console.log("Gig offered successfully");
        setOfferMade(true);
      } else {
        console.error("Failed to offer gig");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const retractOffer = async (gigId, offeredArtistId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/gigs/retract/${gigId}/${offeredArtistId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (response.ok) {
        console.log("Offer retracted successfully");
        // Optionally, update the local state to reflect the change immediately
      } else {
        console.error("Failed to retract offer");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
        // Optionally, remove the gig from the local state to reflect the change immediately
        setGigs(gigs.filter((gig) => gig.id !== gigId));
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
              <th className="px-4 py-2">Offered To</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {gigs.map((gig) => {
              if (isVenue) {
                const artistOfferedTo = artists.find(
                  (artist) => artist.band_name === gig.offered_to
                );
                return (
                  <tr key={gig.id}>
                    <td className="border px-4 py-2">{gig.title}</td>
                    <td className="border px-4 py-2">{gig.description}</td>
                    <td className="border px-4 py-2">{gig.date}</td>
                    <td className="border px-4 py-2">{gig.time}</td>
                    <td className="border px-4 py-2">{gig.pay}</td>
                    <td className="border px-4 py-2">{gig.accepted_by}</td>
                    <td className="border px-4 py-2">
                      {artistOfferedTo
                        ? artistOfferedTo.band_name
                        : "Not offered"}
                    </td>
                    <td className="border px-4 py-2">
                      {gig.offered_to ? (
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                          onClick={() => retractOffer(gig.id)}
                        >
                          Retract Offer
                        </button>
                      ) : (
                        <>
                          <select
                            className="mr-2"
                            value={selectedArtist?.user_id || ""}
                            onChange={(e) =>
                              setSelectedArtist(
                                artists.find(
                                  (artist) =>
                                    artist.user_id === parseInt(e.target.value)
                                )
                              )
                            }
                          >
                            <option value="">Select an artist</option>
                            {artists.map((artist) => (
                              <option
                                key={artist.user_id}
                                value={artist.user_id}
                              >
                                {artist.band_name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => offerGig(gig.id)}
                          >
                            Offer to
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => deleteGig(gig.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              } else if (isArtist) {
                if (gig.offered_to === user.userId) {
                  return (
                    <tr key={gig.id}>
                      <td className="border px-4 py-2">{gig.title}</td>
                      <td className="border px-4 py-2">{gig.description}</td>
                      <td className="border px-4 py-2">{gig.date}</td>
                      <td className="border px-4 py-2">{gig.time}</td>
                      <td className="border px-4 py-2">{gig.pay}</td>
                      <td className="border px-4 py-2">{gig.accepted_by}</td>
                      <td className="border px-4 py-2">{gig.offered_to}</td>
                      <td className="border px-4 py-2">
                        <button onClick={() => acceptGig(gig.id)}>
                          Accept Gig
                        </button>
                      </td>
                    </tr>
                  );
                }
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProfilePage;

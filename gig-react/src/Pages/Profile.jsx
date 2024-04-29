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
  const [offeredGigs, setOfferedGigs] = useState([]);
  const [profileDetails, setProfileDetails] = useState({});
  const [selectedTab, setSelectedTab] = useState("yourGigs");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);

  const isVenue = user.role === "venue";
  const isArtist = user.role === "artist";

  const fetchOfferedGigs = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/gigs/offered`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch offered gigs");
      }
      const data = await response.json();
      setOfferedGigs(data);
    } catch (error) {
      console.error("Error fetching offered gigs:", error);
    }
  };

  useEffect(() => {
    const fetchProfileDetails = async () => {
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
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
        const data = await response.json();
        setProfileDetails(data); // Store the fetched profile details in state
        console.log(data); // Log the profile details to check if it retrieves the data
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    // Fetch profile details only if user.userId and user.token are available
    if (user.userId && user.token) {
      fetchProfileDetails();
    }
  }, [user.userId, user.token]); // Depend on the user state to re-fetch if the user ID or token changes

  useEffect(() => {
    // Fetch gigs offered to the artist if the user is an artist
    if (isArtist) {
      fetchOfferedGigs();
    }
  }, [user]);

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

    // Set up polling
    const intervalId = setInterval(() => {
      fetchGigs();
      fetchArtists();
    }, 500); //

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [user.userId, user.token]);

  const offerGig = async (gigId) => {
    // Check if an artist is selected for the specific gig
    if (!selectedArtist[gigId] || !selectedArtist[gigId].user_id) {
      console.error("No artist selected for this gig");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/gigs/offer/${gigId}/${selectedArtist[gigId].user_id}`,
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

  const acceptGig = async (gigId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/gigs/accept/${gigId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (response.ok) {
        console.log("Gig accepted successfully");
        // Optionally, re-fetch the gigs list to update the UI
        fetchOfferedGigs();
      } else {
        console.error("Failed to accept gig");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const rejectGig = async (gigId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/gigs/reject/${gigId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (response.ok) {
        console.log("Offer rejected successfully");
        // Optionally, re-fetch the gigs list to update the UI
        fetchOfferedGigs();
      } else {
        console.error("Failed to reject offer");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (timeString) => {
    const date = new Date(`1970-01-01T${timeString}`);
    const options = { hour: "2-digit", minute: "2-digit", hour12: true };
    return date.toLocaleTimeString("en-US", options);
  };

  const handleEditGig = async () => {
    // Assuming you have a function to get the updated values from the form
    const updatedTitle = document.getElementById("title").value;
    const updatedDescription = document.getElementById("description").value;

    try {
      const response = await fetch(
        `http://localhost:5001/api/gigs/${selectedGig.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            title: updatedTitle,
            description: updatedDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update gig");
      }

      // Close the modal and refresh the gigs list
      setIsModalOpen(false);
      // Optionally, refresh the gigs list to reflect the changes
    } catch (error) {
      console.error("Error updating gig:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="p-4">
        {isVenue && profileDetails.details && (
          <>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">
                {profileDetails.details.venue_name}
              </h2>
              <p className="text-gray-700 mb-2">
                {profileDetails.details.address}
              </p>
              <p className="text-gray-700 mb-4">{profileDetails.details.bio}</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mt-4">
              <button
                className={`px-4 py-2 mr-2 mb-5 ${
                  selectedTab === "yourGigs"
                    ? "bg-amber-400 text-white font-bold"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setSelectedTab("yourGigs")}
              >
                Your Gigs
              </button>
              <button
                className={`px-4 py-2 mr-2 mb-5 ${
                  selectedTab === "reviews"
                    ? "bg-amber-400 text-white font-bold"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setSelectedTab("reviews")}
              >
                Reviews
              </button>
            </div>

            {/* Conditional rendering for tabs content */}
            {selectedTab === "yourGigs" && (
              <div className="grid grid-cols-1 gap-4">
                {gigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="bg-white shadow rounded p-4 w-full md:w-[800px] lg:w-[800px] h-[200px] border border-amber-400"
                  >
                    <div className="flex flex-wrap">
                      <div className="w-full md:w-1/2">
                        <h3 className="text-xl font-bold mb-2">{gig.title}</h3>
                        <p className="text-gray-700 mb-2">{gig.description}</p>
                        <p className="text-gray-500 mb-2">
                          Offered to:{" "}
                          {gig.offered_to ? gig.offered_to : "Not offered yet"}
                        </p>
                      </div>
                      <div className="w-full md:w-1/2 text-right">
                        <p className="text-gray-500 mb-2">
                          {formatDate(gig.date)}
                        </p>
                        <p className="text-gray-500 mb-2">
                          {formatTime(gig.time)}
                        </p>
                        <p className="text-gray-500 mb-2">${gig.pay}</p>
                        <div className="flex justify-end space-x-2">
                          {gig.offered_to ? (
                            <button
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                              onClick={() => retractOffer(gig.id)}
                            >
                              Retract Offer
                            </button>
                          ) : (
                            <>
                              <select
                                className="mr-2 bg-gray-200 text-gray-700 border border-gray-300 rounded py-2 px-4"
                                value={selectedArtist[gig.id]?.user_id || ""}
                                onChange={(e) =>
                                  setSelectedArtist({
                                    ...selectedArtist,
                                    [gig.id]: artists.find(
                                      (artist) =>
                                        artist.user_id ===
                                        parseInt(e.target.value)
                                    ),
                                  })
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
                                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => {
                                  setSelectedGig(gig);
                                  setIsModalOpen(true);
                                }}
                              >
                                Edit
                              </button>
                            </>
                          )}
                          <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => deleteGig(gig.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedTab === "reviews" && (
              <div className="grid grid-cols-1 gap-4">
                {/* Reviews content will go here */}
              </div>
            )}
          </>
        )}
        {isArtist && profileDetails.details && (
          <>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">
                {profileDetails.details.band_name}
              </h2>
              <p className="text-gray-700 mb-2">
                {profileDetails.details.genre}
              </p>
              <p className="text-gray-700 mb-4">{profileDetails.details.bio}</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mt-4">
              <button
                className={`px-4 py-2 mr-2 mb-5 ${
                  selectedTab === "yourGigs"
                    ? "bg-amber-400 text-white font-bold"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setSelectedTab("yourGigs")}
              >
                Your Gigs
              </button>
              <button
                className={`px-4 py-2 mb-5 ${
                  selectedTab === "reviews"
                    ? "bg-amber-500 text-white font-bold"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setSelectedTab("reviews")}
              >
                Reviews
              </button>
            </div>

            {/* Conditional rendering for tabs content */}
            {selectedTab === "yourGigs" && (
              <div className="grid grid-cols-1 gap-4">
                {offeredGigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="bg-white shadow rounded p-4 w-full md:w-[800px] lg:w-[800px] h-[200px] border border-amber-400"
                  >
                    <div className="flex flex-wrap">
                      <div className="w-full md:w-1/2">
                        <h3 className="text-xl font-bold mb-2">{gig.title}</h3>
                        <p className="text-gray-700 mb-2">{gig.description}</p>
                      </div>
                      <div className="w-full md:w-1/2 text-right">
                        <p className="text-gray-500 mb-2">
                          {formatDate(gig.date)}
                        </p>
                        <p className="text-gray-500 mb-2">
                          {formatTime(gig.time)}
                        </p>
                        <p className="text-gray-500 mb-2">${gig.pay}</p>
                        <div className="flex justify-end space-x-2">
                          {gig.accepted_by ? (
                            <p className="text-white bg-amber-400 px-4 py-2 rounded font-bold">
                              Accepted
                            </p>
                          ) : (
                            <>
                              <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => acceptGig(gig.id)}
                              >
                                Accept Gig
                              </button>
                              <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => rejectGig(gig.id)}
                              >
                                Reject Gig
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedTab === "reviews" && (
              <div className="grid grid-cols-1 gap-4">
                {/* Reviews content will go here */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;

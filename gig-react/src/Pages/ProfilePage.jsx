import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import Header from "../Components/Header";

function ProfilePage() {
  const { user } = useUser();
  const [gigs, setGigs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState({});
  const [offeredGigs, setOfferedGigs] = useState([]);
  const [profileDetails, setProfileDetails] = useState({});
  const [selectedTab, setSelectedTab] = useState("yourGigs");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState({
    id: null,
    title: "",
    description: "",
    date: "",
    pay: "",
    time: "",
  });
  const [reviews, setReviews] = useState([]);

  const isVenue = user.role === "venue";
  const isArtist = user.role === "artist";

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/reviews/${user.userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        let reviewsData = await response.json();

        // Fetch reviewer details for each review
        for (let review of reviewsData) {
          const reviewerResponse = await fetch(
            `http://localhost:5001/api/user/profile/${review.reviewer_id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          if (!reviewerResponse.ok) {
            throw new Error("Failed to fetch reviewer details");
          }
          // Check for reviewer's band or venue name
          const reviewerDetails = await reviewerResponse.json();
          review.reviewerName =
            reviewerDetails.details?.band_name ||
            reviewerDetails.details?.venue_name;
        }

        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    if (user.userId && user.token) {
      fetchReviews();
    }
  }, [user.userId, user.token]);

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
    try {
      const response = await fetch(
        `http://localhost:5001/api/gigs/${selectedGig.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(selectedGig),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update gig");
      }

      // Close the modal and refresh the gigs list
      setIsModalOpen(false);
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
            <div className="flex flex-col items-start">
              <h2 className="text-3xl font-bold mb-2">
                {profileDetails.details?.band_name ||
                  profileDetails.details?.venue_name}
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                {profileDetails.details?.address}
              </p>
              <button className="bg-amber-500 hover:bg-cyan-700 hover:scale-110 hover:shadow-lg text-white font-bold py-2 px-4 rounded transition-transform duration-200">
                Visit Website
              </button>
              <p className="text-gray-700 mt-4">
                {profileDetails.details?.bio}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mt-4">
              <button
                className={`px-4 py-2 mr-2 mb-5 hover:scale-110 hover:shadow-lg ${
                  selectedTab === "yourGigs"
                    ? "bg-amber-500 text-white font-bold"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setSelectedTab("yourGigs")}
              >
                Your Gigs
              </button>
              <button
                className={`px-4 py-2 mr-2 mb-5 hover:scale-110 hover:shadow-lg ${
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
                {gigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="bg-white shadow rounded-xl hover:scale-110 hover:shadow-lg p-4 w-full md:w-[800px] lg:w-[800px] h-[200px] border border-amber-400"
                  >
                    <div className="flex flex-wrap">
                      <div className="w-full md:w-1/2">
                        <h3 className="text-xl text-amber-500 font-bold mb-2">
                          {gig.title}
                        </h3>
                        <p className="text-gray-700 font-light mb-2">
                          {gig.description}
                        </p>
                        <p className="text-gray-500 mb-2 font-bold mt-6">
                          Offered to:{" "}
                          <span
                            className={`${
                              gig.offered_to ? "bg-amber-500" : "bg-red-500"
                            } text-white rounded-xl p-2`}
                          >
                            {gig.offered_to
                              ? gig.offered_to
                              : "Not offered yet"}
                          </span>
                        </p>
                      </div>
                      <div className="w-full md:w-1/2 text-right">
                        <p className="text-black font-bold text-[15px] mb-2">
                          {formatDate(gig.date)}
                        </p>
                        <p className="text-gray-500 mb-2">
                          {formatTime(gig.time)}
                        </p>
                        <p className="text-green-500 text-[19px] mb-2">
                          ${gig.pay}
                        </p>
                        <div className="flex justify-end space-x-1">
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
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded hover:scale-110 hover:shadow-lg"
                                onClick={() => offerGig(gig.id)}
                              >
                                Offer to
                              </button>
                              <button
                                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded hover:scale-110 hover:shadow-lg"
                                onClick={() => {
                                  setSelectedGig({
                                    id: gig.id,
                                    title: gig.title,
                                    description: gig.description,
                                    date: gig.date,
                                    pay: gig.pay,
                                    time: gig.time,
                                  });
                                  setIsModalOpen(true);
                                }}
                              >
                                Edit
                              </button>
                            </>
                          )}
                          <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded hover:scale-110 hover:shadow-lg"
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
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-amber-400 shadow-md rounded px-8 pt-6 pb-8 mb-4"
                  >
                    <div className="mb-4">
                      <p className="text-gray-700 text-base">
                        <strong>“{review.content}”</strong>
                      </p>
                      <p className="text-gray-500 text-sm">
                        - {review.reviewerName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {isArtist && profileDetails.details && (
          <>
            <div className="flex flex-col items-start">
              <h2 className="text-[50px] font-bold mb-2">
                {profileDetails.details?.band_name ||
                  profileDetails.details?.venue_name}
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                {profileDetails.details?.genre}
              </p>
              <button className="bg-amber-500 hover:bg-cyan-700 hover:scale-110 hover:shadow-lg text-white font-bold py-2 px-4 rounded transition-transform duration-200">
                Visit Website
              </button>
              <p className="text-gray-700 mt-4">
                {profileDetails.details?.bio}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mt-4">
              <button
                className={`px-4 py-2 mr-2 mb-5 hover:scale-110 hover:shadow-lg ${
                  selectedTab === "yourGigs"
                    ? "bg-amber-500 text-white font-bold"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setSelectedTab("yourGigs")}
              >
                Your Gigs
              </button>
              <button
                className={`px-4 py-2 mb-5 hover:scale-110 hover:shadow-lg ${
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
                        <h3 className="text-[30px] text-amber-500 font-bold mb-2">
                          {gig.title}
                        </h3>
                        <p className="text-gray-700 mb-2">{gig.description}</p>
                        <p className="text-gray-500 mb-2 font-bold mt-4">
                          Offered by:{" "}
                          <span className="bg-amber-500 p-2 rounded-xl text-white">
                            {gig.venue_name}
                          </span>
                        </p>
                      </div>
                      <div className="w-full md:w-1/2 text-right">
                        <p className="text-amber-500 mb-2 text-[20px]">
                          {formatDate(gig.date)}
                        </p>
                        <p className="text-gray-500 mb-2">
                          {formatTime(gig.time)}
                        </p>
                        <p className="text-green-500 mb-2">${gig.pay}</p>
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
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-amber-400 shadow-md rounded px-8 pt-6 pb-8 mb-4"
                  >
                    <div className="mb-4">
                      <p className="text-gray-700 text-base">
                        <strong>“{review.content}”</strong>
                      </p>
                      <p className="text-gray-500 text-sm">
                        - {review.reviewerName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {isModalOpen && selectedGig && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="my-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Edit Gig
              </h3>
              <form className="mt-2 px-7 py-3" onSubmit={handleEditGig}>
                <input
                  type="text"
                  className="mb-2 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Title"
                  value={selectedGig.title}
                  onChange={(e) =>
                    setSelectedGig({ ...selectedGig, title: e.target.value })
                  }
                />
                <textarea
                  className="mb-2 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Description"
                  value={selectedGig.description}
                  onChange={(e) =>
                    setSelectedGig({
                      ...selectedGig,
                      description: e.target.value,
                    })
                  }
                />
                <input
                  type="date"
                  className="mb-2 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={selectedGig.date}
                  onChange={(e) =>
                    setSelectedGig({ ...selectedGig, date: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="mb-2 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Pay"
                  value={selectedGig.pay}
                  onChange={(e) =>
                    setSelectedGig({ ...selectedGig, pay: e.target.value })
                  }
                />
                <input
                  type="time"
                  className="mb-2 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={selectedGig.time}
                  onChange={(e) =>
                    setSelectedGig({ ...selectedGig, time: e.target.value })
                  }
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 focus:outline-none"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;

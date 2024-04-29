import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import GigPostingForm from "../Components/GigPostingForm";
import { useUser } from "../Context/UserContext";
import SideBar from "../Components/SideBar";

const HomePage = () => {
  const { user } = useUser();
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
        fetchGigs();
      } else {
        console.error("Failed to accept gig");
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

  return (
    <div className="flex flex-col h-screen">
      <Header className="fixed top-0 w-full z-50" />
      <div className="flex flex-row flex-grow overflow-auto pt-16">
        <div className="w-3/4">
          <div>
            <div className="p-4">
              {user.role === "venue" && (
                <>
                  <br />
                  <button
                    className="bg-amber-400 rounded-lg px-4 py-2"
                    onClick={() => setShowModal(true)}
                  >
                    Create Gig
                  </button>
                  {showModal && (
                    <div className="modal">
                      <GigPostingForm />
                      <button onClick={() => setShowModal(false)}>Close</button>
                    </div>
                  )}
                  <br />
                  <br />

                  <div className="grid grid-cols-1 gap-4">
                    {gigs.map((gig) => (
                      <div
                        key={gig.id}
                        className="bg-white rounded-[30px] shadow-xl p-4 w-full md:w-[800px] lg:w-[800px] h-[250px] border border-amber-400"
                      >
                        <div className="flex flex-wrap">
                          <div className="w-full md:w-1/2">
                            <h2 className="text-[30px] text-amber-400 font-bold mb-2">
                              {gig.title}
                            </h2>
                            <p className="text-gray-700 mb-2">
                              {gig.description}
                            </p>
                            <p className="text-gray-500 mb-2">
                              Venue: {gig.venue_name}
                            </p>
                            <p className="text-green-500 font-bold mb-2">
                              Accepted By: {gig.accepted_by}
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
                            <button className="bg-blue-500 text-white px-4 py-2 rounded">
                              Message
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {user.role === "artist" && (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    {gigs.map((gig) => (
                      <div
                        key={gig.id}
                        className="bg-white rounded-[30px] shadow-xl p-4 w-full md:w-[800px] lg:w-[800px] h-[250px] border border-amber-400"
                      >
                        <div className="flex flex-wrap">
                          <div className="w-full md:w-1/2">
                            <h2 className="text-[30px] text-amber-400 font-bold mb-2">
                              {gig.title}
                            </h2>
                            <p className="text-gray-700 mb-2">
                              {gig.description}
                            </p>
                            <p className="text-gray-500 mb-2">
                              Venue: {gig.venue_name}
                            </p>
                            <p className="text-green-500 font-bold mb-2">
                              Accepted By: {gig.accepted_by}
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
                            {gig.accepted_by === null && (
                              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                                Message
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <SideBar />
      </div>
    </div>
  );
};

export default HomePage;

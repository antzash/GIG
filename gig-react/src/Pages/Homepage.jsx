import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import GigPostingForm from "../Components/GigPostingForm";
import { useUser } from "../Context/UserContext";
import SideBar from "../Components/SideBar";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [gigs, setGigs] = useState([]);
  const [sortByDate, setSortByDate] = useState("asc");
  const navigate = useNavigate();

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

  useEffect(() => {
    const sortedGigs = [...gigs].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (sortByDate === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
    setGigs(sortedGigs);
  }, [sortByDate]);

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
      <hr />
      <div className="flex flex-row flex-grow overflow-auto pt-16">
        <SideBar />
        <div className="w-3/4">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-row space-x-4">
                <select
                  className="border rounded p-2"
                  value={sortByDate}
                  onChange={(e) => setSortByDate(e.target.value)}
                >
                  <option value="asc">Sort by Date (Asc)</option>
                  <option value="desc">Sort by Date (Desc)</option>
                </select>
                {user.role === "venue" && (
                  <button
                    className="bg-amber-400 rounded-lg px-4 py-2"
                    onClick={() => setShowModal(true)}
                  >
                    Create Gig
                  </button>
                )}
              </div>
            </div>
            {showModal && (
              <div className="modal">
                <GigPostingForm />
                <button
                  className="bg-blue-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-9 mb-9 focus:outline-none focus:shadow-outline"
                  onClick={() => {
                    setShowModal(false);
                    window.location.reload();
                  }}
                >
                  Close
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              {gigs.map((gig) => (
                <div
                  key={gig.id}
                  className="bg-white rounded-[30px] shadow-xl p-4 w-full md:w-[800px] lg:w-[800px] h-[250px] border border-amber-400"
                >
                  <div className="flex flex-wrap">
                    <div className="w-full md:w-1/2">
                      <h2 className="text-[30px] text-amber-500 font-bold mb-2">
                        {gig.title}
                      </h2>
                      <p className="text-gray-700 mb-2">{gig.description}</p>
                      <p className="text-black-500 font-bold text-[20px] mb-4 mt-4">
                        at{" "}
                        <span className="text-amber-500 text-[20px]">
                          {gig.venue_name}
                        </span>
                      </p>
                      {gig.accepted_by ? (
                        <p className="text-green-500 font-bold mb-2">
                          Accepted By: {gig.accepted_by}
                        </p>
                      ) : (
                        <p className="text-green-500 text-[20px] font-bold mb-2">
                          Open
                        </p>
                      )}
                    </div>
                    <div className="w-full md:w-1/2 text-right">
                      <p className="text-amber-500 text-[25px] mb-2">
                        {formatDate(gig.date)}
                      </p>
                      <p className="text-gray-500 mb-2">
                        {formatTime(gig.time)}
                      </p>
                      <p className="text-[20px] text-green-500 mb-2">
                        ${gig.pay}
                      </p>
                      {user.role === "artist" && gig.accepted_by === null && (
                        <button
                          className="bg-amber-500 hover:bg-green-500 hover:scale-110 hover:shadow-lg text-white px-4 py-2 rounded"
                          onClick={() => navigate(`/chat`)}
                        >
                          Message
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

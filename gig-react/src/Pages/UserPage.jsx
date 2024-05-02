import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import Header from "../Components/Header";
import { useNavigate } from "react-router-dom";

function UserPage() {
  const { userId } = useParams();
  const { user } = useUser();
  const [profileDetails, setProfileDetails] = useState({});
  const [activeTab, setActiveTab] = useState("reviews");
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewContent, setReviewContent] = useState("");
  const [gigs, setGigs] = useState([]);
  const [acceptedGigs, setAcceptedGigs] = useState([]);
  const navigate = useNavigate();

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/reviews/${userId}`,
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

    const fetchGigs = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/user/profile/${userId}/gigs`,
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
        const gigsData = await response.json();
        setGigs(gigsData);
      } catch (error) {
        console.error("Error fetching gigs:", error);
      }
    };

    const fetchAcceptedGigs = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/gigs/accepted/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch accepted gigs");
        }
        const acceptedGigsData = await response.json();
        setAcceptedGigs(acceptedGigsData);
      } catch (error) {
        console.error("Error fetching accepted gigs:", error);
      }
    };

    fetchProfileDetails();
    fetchReviews();
    fetchGigs();
    fetchAcceptedGigs();
  }, [userId, user.token]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      // Determine the correct endpoint based on the user's role
      const endpoint =
        user.role === "artist"
          ? `http://localhost:5001/api/reviews/artist-to-venue`
          : `http://localhost:5001/api/reviews/venue-to-artist`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          reviewee_id: userId,
          content: reviewContent,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit review");
      }
      // Refresh reviews after submitting a new review
      fetchReviews();
      setShowReviewForm(false); // Hide the review form after submission
    } catch (error) {
      console.error("Error submitting review:", error);
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
    <div>
      <Header />
      <div className="p-4">
        <div className="flex flex-col items-start">
          <h2 className="text-3xl font-bold mb-2">
            {profileDetails.details?.band_name ||
              profileDetails.details?.venue_name}
          </h2>
          <p className="text-lg text-gray-700 mb-2">
            {profileDetails.details?.address}
          </p>
          <button className="bg-amber-500 hover:bg-green-700 hover:scale-110 hover:shadow-lg text-white font-bold py-2 px-4 rounded">
            Visit Website
          </button>
          <p className="text-gray-700 mt-4">{profileDetails.details?.bio}</p>
        </div>
        {/* Tabs */}
        <div className="flex justify-center mt-4 mb-8">
          <button
            className={`px-4 py-2 mx-2 ${
              activeTab === "reviews"
                ? "bg-amber-500 text-white"
                : "bg-gray-200"
            } hover:scale-110 hover:shadow-lg`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
          <button
            className={`px-4 py-2 mx-2 ${
              activeTab === "gigs" ? "bg-amber-500 text-white" : "bg-gray-200"
            } hover:scale-110 hover:shadow-lg`}
            onClick={() => setActiveTab("gigs")}
          >
            Gigs
          </button>
        </div>
        {/* Content based on active tab */}
        {activeTab === "reviews" && (
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
        {activeTab === "gigs" && (
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
                      <p className="inline-block text-amber-500 bg-black rounded-xl p-2 font-bold text-[15px] mb-2">
                        Accepted by {gig.accepted_by}
                      </p>
                    ) : (
                      <p className="inline-block text-white bg-green-500 rounded-xl p-2 font-bold text-[15px] mb-2">
                        Open
                      </p>
                    )}
                  </div>
                  <div className="w-full md:w-1/2 text-right">
                    <p className="text-amber-500 text-[25px] mb-2">
                      {formatDate(gig.date)}
                    </p>
                    <p className="text-gray-500 mb-2">{formatTime(gig.time)}</p>
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
            {acceptedGigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-white rounded-[30px] shadow-xl p-4 w-full md:w-[800px] lg:w-[800px] h-[250px] border border-amber-400"
              >
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
                <p className="text-amber-500 text-[20px] mb-2">
                  Accepted by {gig.accepted_by}
                </p>
                <p className="text-amber-500 text-[25px] mb-2">
                  {formatDate(gig.date)}
                </p>
                <p className="text-gray-500 mb-2">{formatTime(gig.time)}</p>
                <p className="text-[20px] text-green-500 mb-2">${gig.pay}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === "reviews" && showReviewForm && (
          <form onSubmit={handleReviewSubmit}>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Write your review here..."
              className="w-full p-2 mb-2"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white hover:scale-110 hover:shadow-lg rounded-xl"
            >
              Submit Review
            </button>
          </form>
        )}
        {activeTab === "reviews" && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 mt-4 bg-gray-200"
          >
            {showReviewForm ? "Cancel" : "Write a Review"}
          </button>
        )}
      </div>
    </div>
  );
}

export default UserPage;

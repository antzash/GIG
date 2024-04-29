import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import Header from "../Components/Header";

function UserPage() {
  const { userId } = useParams();
  const { user } = useUser();
  const [profileDetails, setProfileDetails] = useState({});
  const [activeTab, setActiveTab] = useState("reviews");
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewContent, setReviewContent] = useState("");

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

    fetchProfileDetails();
    fetchReviews();
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
      fetchReviews(); // Now fetchReviews is accessible here
      setShowReviewForm(false); // Hide the review form after submission
    } catch (error) {
      console.error("Error submitting review:", error);
    }
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
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Visit Website
          </button>
          <p className="text-gray-700 mt-4">{profileDetails.details?.bio}</p>
        </div>
        {/* Tabs */}
        <div className="flex justify-center mt-4 mb-8">
          <button
            className={`px-4 py-2 mx-2 ${
              activeTab === "gigs" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("gigs")}
          >
            Gigs
          </button>
          <button
            className={`px-4 py-2 mx-2 ${
              activeTab === "reviews" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
        </div>
        {/* Content based on active tab */}
        {activeTab === "gigs" && <div>Content for Gallery</div>}
        {activeTab === "reviews" && (
          <div className="grid grid-cols-1 gap-4">
            {reviews.map((review) => (
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
            ))}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit}>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Write your review here..."
                  className="w-full p-2 mb-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white"
                >
                  Submit Review
                </button>
              </form>
            )}
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 mt-4 bg-gray-200"
            >
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPage;

// src/Pages/Homepage.jsx
import React, { useState } from "react";
import Header from "../Components/Header";
import GigPostingForm from "../Components/GigPostingForm";

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);

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
    </div>
  );
};

export default HomePage;

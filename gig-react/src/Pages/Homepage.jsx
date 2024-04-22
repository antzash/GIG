import React from "react";
import Header from "../Components/Header"; // Update the path according to your project structure

const HomePage = () => {
  const userRole = "artist"; // This should ideally come from user authentication data

  return (
    <div>
      <Header userRole={userRole} />
      <h1>Welcome to the Home Page</h1>
      {/* Other content of your home page */}
    </div>
  );
};

export default HomePage;

import React from "react";

const Header = ({ userRole }) => {
  const headerStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px",
  };

  const logoStyle = {
    height: "50px", // Adjust size as needed
  };

  const verticalLineStyle = {
    width: "1px",
    backgroundColor: "#333",
    height: "30px",
    margin: "0 20px",
  };

  const userInfoStyle = {
    fontSize: "16px",
    color: "#333",
  };

  return (
    <div style={headerStyle}>
      <img src="/path-to-your-logo.png" alt="Logo" style={logoStyle} />
      <div style={verticalLineStyle}></div>
      <div style={userInfoStyle}>
        You have logged in as <strong>{userRole}</strong>
      </div>
    </div>
  );
};

export default Header;

import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext({
  user: {},
  fetchUserProfile: () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({});

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    if (!user.userId || !user.token) {
      console.error("User ID or token not available");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/user/profile/:userId`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUser((prevUser) => ({ ...prevUser, ...data })); // Merge the existing user state with the fetched profile data
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Automatically fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [user]); // Depend on the user state to re-fetch if the user ID or token changes

  return (
    <UserContext.Provider value={{ user, fetchUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

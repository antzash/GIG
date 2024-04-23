import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext({
  user: {},
  fetchUserProfile: () => {},
  updateUser: () => {}, // Add updateUser to the context
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load user information from localStorage on initialization
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    if (!user.userId || !user.token) {
      return;
    }

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
      setUser((prevUser) => ({ ...prevUser, ...data })); // Merge the existing user state with the fetched profile data
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Function to update the user state
  const updateUser = (newUser) => {
    setUser(newUser);
    // Store the user's information in localStorage
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  // Automatically fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [user]); // Depend on the user state to re-fetch if the user ID or token changes

  // Function to log out the user
  const logoutUser = () => {
    setUser({});
    // Clear the user's information from localStorage
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider
      value={{ user, fetchUserProfile, updateUser, logoutUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

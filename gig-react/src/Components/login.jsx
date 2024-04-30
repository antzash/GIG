import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";
s;
import gigLogo from "../gig-logo.png";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { updateUser } = useUser(); // Use the updateUser function from UserContext

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Login successful", data);
        // Update the user state with the userId and token
        updateUser({ userId: data.userId, token: data.token });
        // Redirect to the profile page
        navigate("/");
      } else {
        console.error("Failed to login");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={gigLogo} alt="Gig Logo" className="h-12" />
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded px-8 pt-6 pb-8 mb-4"
        >
          <h2 className="text-center font-bold font-avenir text-bold text-xl mb-5">
            Sign In
          </h2>
          <div className="mb-4">
            <label
              className="font-bold font-avenir text-bold text-l mb-5"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="font-bold font-avenir text-bold text-l mb-5"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-amber-400 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline items-center"
              type="submit"
            >
              Login
            </button>
          </div>
        </form>
        <div className="flex justify-center mt-4">
          <Link to="/register" className="text-black font-avenir py-2 px-4">
            Not registered ? Create your account here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;

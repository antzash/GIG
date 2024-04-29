import React, { useState } from "react";
import { Link } from "react-router-dom";
import gigLogo from "../gig-logo.png"; // Adjust the path as necessary
import Modal from "react-modal"; // Import Modal if you're using react-modal

function RegistrationForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("artist");
  const [bandName, setBandName] = useState(""); // Specific to artists
  const [genre, setGenre] = useState(""); // Specific to artists
  const [artistBio, setArtistBio] = useState(""); // Specific to artists
  const [venueName, setVenueName] = useState(""); // Specific to venues
  const [address, setAddress] = useState(""); // Specific to venues
  const [venueBio, setVenueBio] = useState(""); // Specific to venues
  const [modalIsOpen, setModalIsOpen] = useState(false); // State to control modal visibility

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userDetails = {
      username,
      password,
      role,
      ...(role === "artist" && { bandName, genre, bio: artistBio }),
      ...(role === "venue" && {
        venueName,
        address,
        bio: venueBio,
      }),
    };
    try {
      const response = await fetch("http://localhost:5001/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });
      if (response.ok) {
        console.log("User registered successfully");
        console.log("Sending registration data:", userDetails);
        setModalIsOpen(true); // Open the modal on successful registration
      } else {
        console.error("Failed to register");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Account Created"
          className="modal"
          overlayClassName="overlay"
        >
          <h2>Account Created</h2>
          <p>Your account has been successfully created.</p>
          <button onClick={closeModal}>Close</button>
        </Modal>
        <div className="flex justify-center mb-6">
          <img src={gigLogo} alt="Logo" className="h-12 mb-10" />
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded px-8 pt-6 pb-8 mb-4"
        >
          <h2 className="text-center font-bold font-avenir text-bold text-xl mb-5">
            Register
          </h2>
          {/* Username and Password Fields */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="role"
            >
              Role
            </label>
            <select
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="artist">Artist</option>
              <option value="venue">Venue</option>
            </select>
          </div>
          {/* Conditional Inputs Based on Role */}
          {role === "artist" && (
            <>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="bandName"
                >
                  Band Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="bandName"
                  type="text"
                  placeholder="Band Name"
                  value={bandName}
                  onChange={(e) => setBandName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="genre"
                >
                  Genre
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="genre"
                  type="text"
                  placeholder="Genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="artistBio"
                >
                  Bio
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="artistBio"
                  placeholder="Artist Bio"
                  value={artistBio}
                  onChange={(e) => setArtistBio(e.target.value)}
                />
              </div>
            </>
          )}
          {role === "venue" && (
            <>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="venueName"
                >
                  Venue Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="venueName"
                  type="text"
                  placeholder="Venue Name"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="venueAddress"
                >
                  Venue Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="address"
                  type="text"
                  placeholder="Venue Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="venueBio"
                >
                  Bio
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="venueBio"
                  placeholder="Venue Bio"
                  value={venueBio}
                  onChange={(e) => setVenueBio(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <button
              className="bg-amber-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Register
            </button>
          </div>
        </form>
        <div className="flex justify-center mt-4">
          <Link
            to="/login"
            className="text-black font-avenir py-2 px-4 rounded"
          >
            Already have an account? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;

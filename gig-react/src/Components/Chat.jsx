// src/Components/Chat.jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Header from "./Header";
import { useUser } from "../Context/UserContext";

const socket = io("http://localhost:5001");

function Chat() {
  const { user } = useUser(); // Access the current user's information
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); // List of users to chat with
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5001/api/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error("Error fetching users:", error));

    socket.on("chat message", (msg) => {
      setMessages((messages) => [...messages, msg]);
    });

    // Clean up the effect
    return () => socket.disconnect();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message && selectedUser) {
      // Use the current user's ID as the senderId
      const senderId = user.userId;
      const recipientId = selectedUser.id;

      try {
        const response = await fetch("http://localhost:5001/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ senderId, recipientId, message }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();
        console.log("Message sent successfully:", data);
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col h-screen justify-between">
        <header className="p-6 bg-blue-500 text-white">
          <h1 className="text-2xl font-bold">Chat</h1>
        </header>
        <main className="flex flex-row flex-grow overflow-hidden">
          <section className="flex flex-col w-1/4 bg-gray-200 p-4 space-y-2">
            <h2 className="text-lg font-semibold">Users</h2>
            <ul>
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-2 rounded-lg ${
                    selectedUser && selectedUser.id === user.id
                      ? "bg-blue-100"
                      : ""
                  }`}
                >
                  {user.username} {/* Access the username field */}
                </li>
              ))}
            </ul>
          </section>
          <section className="flex flex-col w-3/4 p-4 space-y-4 overflow-y-scroll">
            <h2 className="text-lg font-semibold">
              Chat with {selectedUser ? selectedUser.username : "Select a user"}
            </h2>{" "}
            {/* Access the username field */}
            <ul>
              {messages.map((message, index) => (
                <li key={index} className="p-2 rounded-lg bg-blue-100">
                  {message.content}
                </li>
              ))}
            </ul>
            <form onSubmit={sendMessage} className="flex">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                type="text"
                placeholder="Type your message..."
                className="flex-grow border border-gray-300 rounded-md p-2"
              />
              <button
                type="submit"
                className="ml-4 bg-blue-500 text-white p-2 rounded-md"
              >
                Send
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Chat;

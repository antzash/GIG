// Chat.jsx

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

  // Modified function to fetch messages
  const fetchMessages = async (senderId, recipientId) => {
    // Clear messages before fetching new ones
    setMessages([]);

    try {
      const response = await fetch(
        `http://localhost:5001/api/messages/${senderId}/${recipientId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data); // This will update the messages state with messages between the logged-in user and the selected user
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Call fetchMessages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(user.userId, selectedUser.id);
    }
  }, [selectedUser, user.userId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message && selectedUser) {
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
        // Re-fetch messages to include the newly sent message
        fetchMessages(senderId, recipientId);
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
                  {user.username}
                </li>
              ))}
            </ul>
          </section>
          <section className="flex flex-col w-3/4 p-4 space-y-4 overflow-y-scroll">
            <h2 className="text-lg font-semibold">
              {selectedUser ? selectedUser.username : "Select a user"}
            </h2>
            <ul>
              {messages.length === 0 ? (
                <li className="p-2 text-center">No messages yet.</li>
              ) : (
                messages.map((message, index) => (
                  <li
                    key={index}
                    className={`p-2 rounded-lg ${
                      message.senderId === user.userId
                        ? "self-end bg-blue-100"
                        : "self-start bg-gray-100"
                    } flex flex-col space-y-1`}
                  >
                    <p>{message.message}</p>
                    <span className="text-xs">
                      {new Date(message.sent_at).toLocaleTimeString()}
                    </span>
                  </li>
                ))
              )}
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

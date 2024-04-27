// src/Components/Chat.jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5001");

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); // List of users to chat with
  const [selectedUser, setSelectedUser] = useState(null); // Currently selected user

  useEffect(() => {
    // Fetch list of users (you'll need to implement this on your server)
    fetch("http://localhost:5001/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));

    socket.on("chat message", (msg) => {
      setMessages((messages) => [...messages, msg]);
    });

    // Clean up the effect
    return () => socket.disconnect();
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message && selectedUser) {
      socket.emit("chat message", { message, to: selectedUser.id });
      setMessage("");
    }
  };

  return (
    <div>
      <select
        onChange={(e) =>
          setSelectedUser(users.find((user) => user.id === e.target.value))
        }
      >
        <option value="">Select a user to chat with</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message.content}</li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;

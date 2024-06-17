import './App.css';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Update with your server's URL

function App() {
  // State to handle name input
  const [name, setName] = useState('anonymous');
  // State to handle message input
  const [message, setMessage] = useState('');
  // State to store messages
  const [messages, setMessages] = useState([]);
  // State to handle typing feedback
  const [feedback, setFeedback] = useState('');
  // State to track the total clients
  const [clientsTotal, setClientsTotal] = useState(0);

  useEffect(() => {
    // Listen for messages from the server
    socket.on('message', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Listen for feedback from the server
    socket.on('typing', (typingFeedback) => {
      setFeedback(typingFeedback);
    });

    // Listen for client count updates from the server
    socket.on('clientsTotal', (totalClients) => {
      setClientsTotal(totalClients);
    });

    // Clean up the effect
    return () => {
      socket.off('message');
      socket.off('typing');
      socket.off('clientsTotal');
    };
  }, []);

  // Function to handle name input change
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  // Function to handle message input change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      const newMessage = {
        text: message,
        author: name,
        date: new Date().toLocaleString(),
      };
      // Send the message to the server
      socket.emit('message', newMessage);
      setMessage('');
      setFeedback('');
      // Emit stop typing event
      socket.emit('stopTyping');
    }
  };

  // Function to handle typing feedback
  const handleTyping = () => {
    socket.emit('typing', `${name} is typing a message...`);
  };

  return (
    <>
      <h1>iChat</h1>
      <div className="main">
        <div className="name">
          <span>
            <FontAwesomeIcon icon={faUser} />
            <input
              type="text"
              className="nameInput"
              id="nameInput"
              value={name}
              onChange={handleNameChange}
              maxLength="20"
            />
          </span>
        </div>
        <ul className="messageContainer" id="messageContainer">
          {messages.map((msg, index) => (
            <li
              key={index}
              className={msg.author === name ? 'messageRight' : 'messageLeft'}
            >
              <p className="message">{msg.text}</p>
              <span>
                {msg.author} - {msg.date}
              </span>
            </li>
          ))}
          <li className="messageFeedback">
            <p className="feedback" id="feedback">
              {feedback}
            </p>
          </li>
        </ul>

        <form className="messageForm" id="messageForm" onSubmit={handleSubmit}>
          <input
            type="text"
            name="message"
            id="messageInput"
            className="messageInput"
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleTyping}
          />
          <div className="verticalDivider"></div>
          <button type="submit" className="sendButton">
            Send
            <span>
              <FontAwesomeIcon icon={faPaperPlane} />
            </span>
          </button>
        </form>

        <h3 className="clientsTotal" id="ClientTotal">
          Total Clients: {clientsTotal}
        </h3>
      </div>
    </>
  );
}

export default App;

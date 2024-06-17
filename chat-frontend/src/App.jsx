import './App.css';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser } from '@fortawesome/free-solid-svg-icons';

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
      setMessages([...messages, newMessage]);
      setMessage('');
      setFeedback('');
    }
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
              id="nameInput"
              value={name}
              onChange={handleNameChange}
              maxLength="20"
            />
          </span>
        </div>
        <ul className="messageContainer" id="messageContainer">
          {messages.map((msg, index) => (
            <li key={index} className="messageLeft">
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
            onKeyPress={() => setFeedback(`${name} is typing a message...`)}
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

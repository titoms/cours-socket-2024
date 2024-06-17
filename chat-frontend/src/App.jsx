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
  // State to track the list of users
  const [users, setUsers] = useState({});
  // State to track the selected recipient for private messages
  const [recipientId, setRecipientId] = useState('');

  useEffect(() => {
    socket.emit('setUsername', name);

    socket.on('message', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on('privateMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on('typing', (typingFeedback) => {
      setFeedback(typingFeedback);
    });

    socket.on('clientsTotal', (totalClients) => {
      setClientsTotal(totalClients);
    });

    socket.on('updateUserList', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('message');
      socket.off('privateMessage');
      socket.off('typing');
      socket.off('clientsTotal');
      socket.off('updateUserList');
    };
  }, [name]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    socket.emit('setUsername', e.target.value);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      const newMessage = {
        text: message,
        author: name,
        date: new Date().toLocaleString(),
        senderId: socket.id,
      };
      if (recipientId) {
        socket.emit('privateMessage', { recipientId, message });
      } else {
        socket.emit('message', newMessage);
      }
      setMessage('');
      setFeedback('');
      socket.emit('stopTyping');
    }
  };

  const handleTyping = () => {
    socket.emit('typing', `${name} is typing a message...`);
  };

  const handleRecipientClick = (id) => {
    setRecipientId(id === recipientId ? '' : id); // Toggle recipient selection
  };

  return (
    <>
      <h1>iChat</h1>

      <div className="fullBody">
        <div className="main userList">
          <h3>Users:</h3>
          <ul>
            {Object.keys(users).map((id) => (
              <li
                key={id}
                onClick={() => handleRecipientClick(id)}
                className={id === recipientId ? 'selectedUser' : ''}
              >
                {users[id]}
              </li>
            ))}
          </ul>
        </div>

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
              <li key={index} className={msg.direction}>
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

          <form
            className="messageForm"
            id="messageForm"
            onSubmit={handleSubmit}
          >
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
      </div>
    </>
  );
}

export default App;

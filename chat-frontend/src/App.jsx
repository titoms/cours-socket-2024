import './App.css';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Update with your server's URL

function App() {
  const [name, setName] = useState('anonymous');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [clientsTotal, setClientsTotal] = useState(0);
  const [users, setUsers] = useState({});
  const [recipientId, setRecipientId] = useState('All');
  const [conversations, setConversations] = useState({ All: [] });

  useEffect(() => {
    socket.emit('setUsername', name);

    socket.on('message', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setConversations((prevConversations) => ({
        ...prevConversations,
        All: [...prevConversations.All, newMessage],
      }));
    });

    socket.on('privateMessage', (newMessage) => {
      const recipientKey =
        newMessage.senderId === socket.id
          ? newMessage.recipientId
          : newMessage.senderId;
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setConversations((prevConversations) => ({
        ...prevConversations,
        [recipientKey]: [
          ...(prevConversations[recipientKey] || []),
          newMessage,
        ],
      }));
    });

    socket.on('typing', ({ recipientId: typingRecipientId, feedback }) => {
      if (typingRecipientId === recipientId) {
        setFeedback(feedback);
      }
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
  }, [name, recipientId]);

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
        recipientId: recipientId === 'All' ? 'All' : recipientId,
      };
      if (recipientId === 'All') {
        socket.emit('message', newMessage);
      } else {
        socket.emit('privateMessage', { recipientId, message });
      }
      setMessage('');
      setFeedback('');
      socket.emit('stopTyping', recipientId);
    }
  };

  const handleTyping = () => {
    socket.emit('typing', {
      recipientId,
      feedback: `${name} is typing a message...`,
    });
  };

  const handleRecipientClick = (id) => {
    setRecipientId(id);
    setFeedback(''); // Clear typing feedback when switching conversations
  };

  const currentMessages = conversations[recipientId] || [];

  return (
    <>
      <h1>iChat</h1>
      <div className="fullBody">
        <div className="main userList">
          <h3>Users:</h3>
          <ul>
            <li
              key="All"
              onClick={() => handleRecipientClick('All')}
              className={recipientId === 'All' ? 'selectedUser' : ''}
            >
              All
            </li>
            {Object.keys(users).map(
              (id) =>
                id !== socket.id && (
                  <li
                    key={id}
                    onClick={() => handleRecipientClick(id)}
                    className={id === recipientId ? 'selectedUser' : ''}
                  >
                    {users[id]}
                  </li>
                )
            )}
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
            {currentMessages.map((msg, index) => (
              <li
                key={index}
                className={
                  msg.senderId === socket.id ? 'messageRight' : 'messageLeft'
                }
              >
                <p className="message">{msg.text}</p>
                <span>
                  {msg.author} - {msg.date}
                </span>
              </li>
            ))}
            {feedback && (
              <li className="messageFeedback">
                <p className="feedback" id="feedback">
                  {feedback}
                </p>
              </li>
            )}
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

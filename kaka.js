import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import './App.css'; // Import CSS file for styling

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase config here
};

firebase.initializeApp(firebaseConfig);

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [messages, setMessages] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setUser(user);
        observeMessages();
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const registerUser = async () => {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
    } catch (error) {
      console.error(error.message);
    }
  };

  const loginUser = async () => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error(error.message);
    }
  };

  const sendMessage = () => {
    if (!user || !pickupLocation || !dropoffLocation) return;

    const message = `From ${user.email}: Pickup Location - ${pickupLocation}, Dropoff Location - ${dropoffLocation}`;

    const messagesRef = firebase.database().ref('messages');
    messagesRef.push({
      text: message,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    setPickupLocation('');
    setDropoffLocation('');
  };

  const observeMessages = () => {
    const messagesRef = firebase.database().ref('messages');
    messagesRef.on('value', snapshot => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesArray = Object.entries(messagesData).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setMessages(messagesArray);
      }
    });
  };

  const handleLogout = () => {
    firebase.auth().signOut();
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
  };

  return (
    <div className="App">
      {showTutorial && (
        <div className="tutorial">
          <h1>Welcome to Mahi Rider!</h1>
          <p>This app allows you to easily request and share rides with other users.</p>
          <p>To get started, you can register or log in with your email and password.</p>
          <button onClick={handleTutorialClose}>Got it!</button>
        </div>
      )}
      <div className="background-image"></div>
      <div className="content">
        <div className="watermark-top-left">Watermark - Mahendra Yadav</div>
        <div className="watermark-bottom-right">© Mahendra Yadav</div>
        {user ? (
          <div className="user-section">
            <h1>Welcome, {user.email}</h1>
            <button onClick={handleLogout}>Logout</button>
            <div className="ride-request">
              <input type="text" value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} placeholder="Enter Pickup Location" />
              <input type="text" value={dropoffLocation} onChange={e => setDropoffLocation(e.target.value)} placeholder="Enter Dropoff Location" />
              <button onClick={sendMessage}>Send Ride Request</button>
            </div>
            <div className="message-list">
              <h2>Messages</h2>
              <ul>
                {messages.map(message => (
                  <li key={message.id}>{message.text}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="login-section">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <button onClick={registerUser}>Register</button>
            <button onClick={loginUser}>Login</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


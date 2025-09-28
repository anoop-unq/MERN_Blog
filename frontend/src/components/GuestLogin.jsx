

import React, { useState } from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';


const GuestLogin = () => {
  const { createGuest, findGuestByUsername, checkUsernameAvailability } = useContext(AppContext)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupUsername, setPopupUsername] = useState('');
  const [popupError, setPopupError] = useState('');

  const handleCheckUsername = async () => {
    if (username.length < 3) return;
    
    setCheckingUsername(true);
    const result = await checkUsernameAvailability(username);
    setCheckingUsername(false);
    
    if (result.success) {
      setUsernameAvailable(result.available);
    } else {
      setUsernameAvailable(false);
    }
  };

  const handleGuestLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await createGuest(
      username || undefined, 
      displayName || undefined
    );
    
    if (result.success) {
      navigate('/');
    } else {
      alert(result.error || 'Failed to create guest account');
    }
    setLoading(false);
  };

  const handleFindGuest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPopupError('');
    
    const result = await findGuestByUsername(popupUsername);
    
    if (result.success) {
      setShowPopup(false);
      navigate('/home');
    } else {
      setPopupError(result.error || 'Guest account not found');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-96 max-w-md mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join as Guest</h1>
            <p className="text-gray-600">
              Create a new account or access your existing one
            </p>
          </div>
          
          <form onSubmit={handleGuestLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username (optional)
              </label>
              <div className="flex space-x-2">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameAvailable(null);
                  }}
                  onBlur={handleCheckUsername}
                  placeholder="Choose a username"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                />
                <button
                  type="button"
                  onClick={handleCheckUsername}
                  disabled={username.length < 3 || checkingUsername}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  {checkingUsername ? '...' : 'Check'}
                </button>
              </div>
              {usernameAvailable === false && (
                <p className="text-red-500 text-sm mt-1">Username is already taken</p>
              )}
              {usernameAvailable === true && (
                <p className="text-green-500 text-sm mt-1">Username is available!</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>
            
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name (optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={30}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || usernameAvailable === false}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                       transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create New Account'}
            </button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowPopup(true)}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Login to Existing Account
          </button>
          
          <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t border-gray-200">
            <p>Your guest account will be preserved for future visits</p>
          </div>
        </div>
      </div>

      {/* Popup Modal for Existing Account Login */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Login to Existing Account</h2>
                <button 
                  onClick={() => {
                    setShowPopup(false);
                    setPopupError('');
                    setPopupUsername('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleFindGuest} className="space-y-4">
                <div>
                  <label htmlFor="popupUsername" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="popupUsername"
                    type="text"
                    value={popupUsername}
                    onChange={(e) => {
                      setPopupUsername(e.target.value);
                      setPopupError('');
                    }}
                    placeholder="Enter your username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_]+"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the username of your existing guest account
                  </p>
                </div>
                
                {popupError && (
                  <p className="text-red-500 text-sm">{popupError}</p>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !popupUsername}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                           transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuestLogin;
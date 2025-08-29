import React, { useState, useEffect } from 'react';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';

// You MUST replace these placeholder values with your own from your Azure Entra ID app registration.
const msalConfig = {
  auth: {
    clientId: '34c37852-64ec-4b95-80fa-714a50e41b2e', // This is the Application (client) ID from your app registration
    authority: 'https://login.microsoftonline.com/6086a83a-cdae-48c5-985c-0bf5ba575ef3', // This is the Directory (tenant) ID
    redirectUri: 'http://localhost:3000', // Your app's redirect URI
  },
};

// Create a new MSAL PublicClientApplication instance
const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Main App component.
 * It's wrapped with MsalProvider to give all child components access to MSAL context.
 */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use a useEffect hook to set up event listeners for authentication state changes
  useEffect(() => {
    // Add an event listener to listen for authentication success events
    const callbackId = msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS) {
        setIsAuthenticated(true);
      } else if (event.eventType === EventType.LOGOUT_SUCCESS) {
        setIsAuthenticated(false);
      }
      // Once the initial check is complete, set loading to false
      setLoading(false);
    });

    // Check the current authentication status on initial load
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      setIsAuthenticated(true);
    }
    setLoading(false);

    // Clean up the event listener on component unmount
    return () => {
      if (callbackId) {
        msalInstance.removeEventCallback(callbackId);
      }
    };
  }, []);

  // Show a loading state while MSAL is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-center p-4 space-x-2 rounded-lg bg-gray-800 shadow-xl">
            <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // The MsalProvider wraps the entire application and makes the MSAL instance available to child components
  return (
    <MsalProvider instance={msalInstance}>
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="max-w-xl w-full p-8 space-y-6 bg-gray-800 rounded-xl shadow-2xl text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            MSAL.js React Demo
          </h1>
          <p className="text-gray-400">
            A simple example of authenticating with Azure Entra ID.
          </p>

          <MainContent />
        </div>
      </div>
    </MsalProvider>
  );
}

/**
 * MainContent component. Renders different content based on authentication status.
 * This component and its children can access the MSAL context via useMsal().
 */
const MainContent = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    // Redirects the user to the login page
    instance.loginRedirect().catch(e => {
      console.error(e);
    });
  };

  const handleLogout = () => {
    // Logs the user out and redirects them to the home page
    instance.logoutRedirect().catch(e => {
      console.error(e);
    });
  };

  return (
    <div>
      {isAuthenticated ? (
        // Render content for authenticated users
        <div className="space-y-4">
          <p className="text-green-400 font-medium">You are logged in!</p>
          <p className="text-gray-300 break-all">
            Welcome, <span className="text-indigo-400 font-semibold">{accounts[0]?.username}</span>!
          </p>
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-red-600 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transform hover:scale-105"
          >
            Log out
          </button>
        </div>
      ) : (
        // Render content for unauthenticated users
        <div className="space-y-4">
          <p className="text-red-400 font-medium">You are not logged in.</p>
          <button
            onClick={handleLogin}
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transform hover:scale-105"
          >
            Log in with Microsoft
          </button>
        </div>
      )}
    </div>
  );
};


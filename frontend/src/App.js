import React, { useState } from 'react';
import './App.css';
import { Web3Provider } from './context/Web3Context';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import AIStrategy from './components/AIStrategy';
import AutoPayment from './components/AutoPayment';
import Header from './components/Header';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'portfolio':
        return <Portfolio />;
      case 'ai-strategy':
        return <AIStrategy />;
      case 'auto-payment':
        return <AutoPayment />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Web3Provider>
      <AuthProvider>
        <div className="App">
          <Header 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <main className="main-content">
            {renderContent()}
          </main>
        </div>
      </AuthProvider>
    </Web3Provider>
  );
}

export default App;
import React, { useState } from 'react';
import Sidebar from './components/sidebar';
import MainDashboard from './pages/maindashboard';

function App() {
  const [activeSection, setActiveSection] = useState('overview'); // More generic state name

  const handleNavigation = (key) => {
    setActiveSection(key);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar onNavigate={handleNavigation} activeSection={activeSection} />
      <MainDashboard activeSection={activeSection} />
    </div>
  );
}

export default App;
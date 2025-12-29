import React, { useState } from 'react';
import { Bot, X } from 'lucide-react'; // Use lucide icons
import { useNavigate } from 'react-router-dom';

const FloatingChatButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate('/ai-chatbot');
  };

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={handleChatClick}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-sky-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 z-40 animate-bounce"
        aria-label="Open AI Health Assistant"
      >
        <Bot size={24} />
        <span className="hidden md:inline font-semibold text-sm">AI Assistant</span>
      </button>
      
      <button 
        onClick={() => setIsVisible(false)}
        className="fixed bottom-24 right-6 bg-white text-sky-700 p-2 rounded-full shadow-md hover:bg-gray-100 transition z-40"
        aria-label="Hide chat assistant"
      >
        <X size={16} />
      </button>
    </>
  );
};

export default FloatingChatButton;
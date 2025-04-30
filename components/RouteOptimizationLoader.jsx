import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRoute,
  faMapMarkedAlt,
  faCarSide,
  faWalking,
  faBicycle,
  faClock,
  faMapPin,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";

const RouteOptimizationLoader = ({ isVisible }) => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const icons = [
    { icon: faRoute, text: "Calculating routes..." },
    { icon: faMapMarkedAlt, text: "Analyzing locations..." },
    { icon: faCarSide, text: "Optimizing driving routes..." },
    { icon: faWalking, text: "Checking walking distances..." },
    { icon: faBicycle, text: "Evaluating transit options..." },
    { icon: faClock, text: "Scheduling visits..." },
    { icon: faMapPin, text: "Arranging stops..." },
    { icon: faCheckCircle, text: "Finalizing your itinerary..." }
  ];

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isVisible, icons.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full animate-fade-in">
        <div className="text-5xl text-blue-500 mb-6 animate-pulse">
          <FontAwesomeIcon icon={icons[currentIcon].icon} />
        </div>
        <p className="text-gray-600 mb-4">{icons[currentIcon].text}</p>
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-6">This may take a few moments...</p>
      </div>
    </div>
  );
};

export default RouteOptimizationLoader;
"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faRoute, 
  faBus, 
  faWalking, 
  faCar, 
  faTrain, 
  faBicycle,
  faSubway,
  faArrowDown,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

const TransportModeIndicator = ({ transportMode }: any) => {
  if (!transportMode) return null;
  
  // Determine which icon to use based on the transport mode text
  const getTransportIcon = (mode: any) => {
    const lowerMode = mode.toLowerCase();
    if (lowerMode.includes("bus")) return faBus;
    if (lowerMode.includes("walk")) return faWalking;
    if (lowerMode.includes("drive") || lowerMode.includes("car")) return faCar;
    if (lowerMode.includes("train")) return faTrain;
    if (lowerMode.includes("subway") || lowerMode.includes("metro")) return faSubway;
    if (lowerMode.includes("bike") || lowerMode.includes("cycle")) return faBicycle;
    if (lowerMode.includes("error")) return faExclamationTriangle;
    return faRoute; // Default icon
  };

  // Get color based on transport mode
  const getColor = (mode: any) => {
    const lowerMode = mode.toLowerCase();
    if (lowerMode.includes("bus")) return {bg: "bg-blue-600", text: "text-blue-600"};
    if (lowerMode.includes("walk")) return {bg: "bg-green-600", text: "text-green-600"};
    if (lowerMode.includes("drive") || lowerMode.includes("car")) return {bg: "bg-red-600", text: "text-red-600"};
    if (lowerMode.includes("train") || lowerMode.includes("subway") || lowerMode.includes("metro")) return {bg: "bg-purple-600", text: "text-purple-600"};
    if (lowerMode.includes("bike") || lowerMode.includes("cycle")) return {bg: "bg-yellow-600", text: "text-yellow-600"};
    if (lowerMode.includes("error")) return {bg: "bg-gray-600", text: "text-gray-600"};
    return {bg: "bg-gray-600", text: "text-gray-600"}; // Default color
  };

  const icon = getTransportIcon(transportMode);
  const colors = getColor(transportMode);

  return (
    <div className="flex flex-col items-center mx-auto">
      {/* Top line segment */}
      <div className="w-0.5 h-4 bg-black"></div>

      {/* Circular icon container */}
      <div className={`${colors.bg} w-7 h-7 rounded-full flex items-center justify-center text-white`}>
        <FontAwesomeIcon icon={icon} />
      </div>

      {/* Bottom line segment with arrow */}
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-4 bg-black"></div>
        <div className="text-black text-lg -mt-3">
          <FontAwesomeIcon icon={faArrowDown} />
        </div>
      </div>
      
      {/* Transport mode text */}
      <div className={`${colors.text} text-sm font-medium`}>
        {transportMode}
      </div>
    </div>
  );
};

export default TransportModeIndicator;
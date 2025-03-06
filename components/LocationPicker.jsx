"use client";

import React, { useRef, useEffect, useState } from "react";
import { APIProvider } from '@vis.gl/react-google-maps';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faArrowUp, faArrowDown, faSearch } from "@fortawesome/free-solid-svg-icons";
import TransportModeIndicator from "@/components/TransportModeIndicator";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const LocationPicker = ({ 
  places = [], 
  onPlacesChange,
  dayLabel,
  onMoveUp,
  onMoveDown,
  onRemovePlace,
  onAddPlace,
  transportModes = {} 
}) => {
  const pickerRefs = useRef([]);
  const [selectedPlaces, setSelectedPlaces] = useState(places.length > 0 ? [...places] : [""]);
  const [PlacePicker, setPlacePicker] = useState(null);
  const [showTransportIndicator, setShowTransportIndicator] = useState(true); // New state

  useEffect(() => {
    import("@googlemaps/extended-component-library/react").then((module) => {
      setPlacePicker(() => module.PlacePicker);
    });
  }, []);
  
  useEffect(() => {
    setShowTransportIndicator(true); // Enable indicator again when transport modes update
  }, [JSON.stringify(transportModes)]);

  useEffect(() => {
    setSelectedPlaces(places.length > 0 ? [...places] : [""]);
  }, [JSON.stringify(places)]);

  const handlePlaceChange = (index) => {
    if (!pickerRefs.current[index]?.current?.value) return;
  
    const place = pickerRefs.current[index].current.value;
  
    if (!place) return;
  
    const placeData = {
      name: place?.displayName || "",  
      placeId: place.place_id || place.id || "",  
      coordinate: {
        lat: place?.location?.lat ? place.location.lat() : 0, 
        lng: place?.location?.lng ? place.location.lng() : 0
      }
    };
  
    const updatedPlaces = [...selectedPlaces];
    updatedPlaces[index] = placeData;
    setSelectedPlaces(updatedPlaces);
    onPlacesChange(dayLabel, updatedPlaces);
  };

  const handleMoveUp = (dayLabel, index) => {
    setShowTransportIndicator(false);
    onMoveUp(dayLabel, index);
  };

  const handleMoveDown = (dayLabel, index) => {
    setShowTransportIndicator(false);
    onMoveDown(dayLabel, index);
  };

  const handleRemovePlace = (dayLabel, index) => {
    setShowTransportIndicator(false);
    onRemovePlace(dayLabel, index);
  };

  return (
    <APIProvider apiKey={API_KEY} version="beta" solutionChannel="GMP_itinerary_planner">
      <div className="space-y-2">
        {(places.length > 0 ? places : [""]).map((place, index) => {
          if (!pickerRefs.current[index]) {
            pickerRefs.current[index] = React.createRef();
          }
  
          const placeName = typeof place === 'object' && place !== null ? place.name || "" : place || "";

          return (
            <React.Fragment key={index}>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="text-gray-400 text-lg min-w-4" />
    
                <div className="relative flex-grow">
                  <div className="flex w-full border rounded-md overflow-hidden">
                    {placeName ? (
                      <input
                        type="text"
                        value={placeName}
                        disabled
                        className="w-full bg-white text-black p-2 border-2 rounded-lg"
                      />
                    ) : (
                      <div className="w-full relative flex items-center">
                        {PlacePicker && (
                          <PlacePicker
                            ref={pickerRefs.current[index]}
                            placeholder="Search for a place"
                            onPlaceChange={() => handlePlaceChange(index)}
                            className="w-full"
                          />
                        )}
                        <div className="w-10 flex items-center justify-center bg-gray-100">
                          <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
    
                <div className="flex gap-1">
                  <button onClick={() => handleMoveUp(dayLabel, index)} disabled={index === 0}
                    className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-blue-500 hover:bg-blue-100'}`} title="Move Up">
                    <FontAwesomeIcon icon={faArrowUp} />
                  </button>
                  <button onClick={() => handleMoveDown(dayLabel, index)} disabled={index === places.length - 1}
                    className={`p-1 rounded ${index === places.length - 1 ? 'text-gray-300' : 'text-blue-500 hover:bg-blue-100'}`} title="Move Down">
                    <FontAwesomeIcon icon={faArrowDown} />
                  </button>
                  <button onClick={() => handleRemovePlace(dayLabel, index)}
                    className="p-1 rounded text-red-500 hover:bg-red-100" title="Remove">
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Transport mode indicator - only show when enabled */}
              {showTransportIndicator && index < places.length - 1 && transportModes[dayLabel]?.travelModes?.[index] && (
                <TransportModeIndicator transportMode={transportModes[dayLabel].travelModes[index]} />
              )}
            </React.Fragment>
          );
        })}
  
        <button onClick={() => onAddPlace(dayLabel)}
          className="mt-2 text-blue-500 hover:text-blue-700 flex items-center gap-1">
          + Add another place
        </button>
      </div>
    </APIProvider>
  );
};

export default LocationPicker;

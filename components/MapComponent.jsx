"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin 
} from '@vis.gl/react-google-maps';
import { 
  PlacePicker 
} from '@googlemaps/extended-component-library/react';
import { PlacePicker as TPlacePicker } from '@googlemaps/extended-component-library/place_picker.js';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 0, lng: 0 };
const DEFAULT_ZOOM = 2;
const FOCUSED_ZOOM = 13;

const MapComponent = ({ 
  onPlaceSelect, 
  markers = [], 
  selectedDayLabel,
  clearSearchAfterSelection = true
}) => {
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const pickerRef = useRef(null);

  // Adjust map center based on markers
  useEffect(() => {
    if (markers && markers.length > 0) {
      // If we have markers, center on the latest one
      const latestMarker = markers[markers.length - 1];
      if (latestMarker && latestMarker.coordinate) {
        setMapCenter(latestMarker.coordinate);
        setZoom(FOCUSED_ZOOM);
      }
    } else {
      // Reset to default view if no markers
      setZoom(DEFAULT_ZOOM);
    }
  }, [markers]);

  const handlePlaceChange = () => {
    if (!pickerRef.current?.value) return;
    
    const place = pickerRef.current.value;
    const placeData = {
      name: place.displayName?.text || place.name,
      coordinate: place.location,
      formattedAddress: place.formattedAddress,
      placeId: place.id,
      types: place.types,
      dayLabel: selectedDayLabel
    };
    
    // Call the parent component's handler
    onPlaceSelect(placeData);
    
    // Clear the search field if needed
    if (clearSearchAfterSelection && pickerRef.current) {
      setTimeout(() => {
        pickerRef.current.reset();
      }, 300);
    }
    
    // Update map center and zoom
    setMapCenter(place.location);
    setZoom(FOCUSED_ZOOM);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <APIProvider
        apiKey={API_KEY}
        version="beta"
        solutionChannel="GMP_devsite_samples_v3_rgmtravelplanner">
        <div className="mb-2">
          <PlacePicker
            ref={pickerRef}
            placeholder={`Search for places to visit${selectedDayLabel ? ` on ${selectedDayLabel}` : ''}`}
            forMap="travelMap"
            onPlaceChange={handlePlaceChange}
            className="w-full"
          />
        </div>
        <div className="flex-grow relative rounded-lg overflow-hidden border border-gray-300 h-full min-h-96">
          <Map
            id="travelMap"
            mapId="TRAVEL_MAP_ID" // Replace with your map ID
            center={mapCenter}
            zoom={zoom}
            gestureHandling="cooperative"
            className="w-full h-full"
          >
            {markers && markers.map((marker, index) => (
              <AdvancedMarker
                key={`${marker.name}-${index}`}
                position={marker.coordinate}
                title={marker.name}
              >
                <Pin
                  background={'#4B5563'} 
                  glyphColor={'#FFFFFF'} 
                  borderColor={'#2D3748'}
                  scale={1.2}
                />
              </AdvancedMarker>
            ))}
          </Map>
        </div>
      </APIProvider>
    </div>
  );
};

export default MapComponent;
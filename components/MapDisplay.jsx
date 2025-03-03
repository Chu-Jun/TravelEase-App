"use client";

import React, { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

// Define your API key - in production this should be in environment variables
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // New York City as default
const DEFAULT_ZOOM = 10;

const MapDisplay = ({ itineraryData, activeDay }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapConfig, setMapConfig] = useState({
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM
  });

  // Get markers for the active day
  const markers = itineraryData?.markers?.[activeDay] || [];

  // Update map center and zoom when markers change
  useEffect(() => {
    if (markers.length > 0) {
      // Find average lat/lng to center the map
      const sumLat = markers.reduce((sum, marker) => sum + marker.coordinate.lat, 0);
      const sumLng = markers.reduce((sum, marker) => sum + marker.coordinate.lng, 0);
      
      setMapConfig({
        center: {
          lat: sumLat / markers.length,
          lng: sumLng / markers.length
        },
        zoom: markers.length > 1 ? 11 : 13 // Zoom out if multiple markers
      });
    } else {
      // Reset to default if no markers
      setMapConfig({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM
      });
    }
  }, [markers, activeDay]);

  return (
    <div className="w-full h-full">
      <APIProvider apiKey={API_KEY}>
        <Map
          center={mapConfig.center}
          zoom={mapConfig.zoom}
          gestureHandling="auto"
          disableDefaultUI={false}
          mapId="YOUR_MAP_ID" // Optional: Replace with your custom map ID
        >
          {markers.map((marker, index) => (
            <AdvancedMarker
              key={index}
              position={marker.coordinate}
              onClick={() => setSelectedMarker(marker)}
              title={marker.name}
            >
              <Pin />
              {selectedMarker === marker && (
                <InfoWindow
                  position={marker.coordinate}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2">
                    <h3 className="font-bold text-lg">{marker.name}</h3>
                    {marker.formattedAddress && (
                      <p className="text-sm mt-1">{marker.formattedAddress}</p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
};

export default MapDisplay;
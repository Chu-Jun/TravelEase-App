"use client";

import React, { useState, useEffect, useRef } from "react";
import Script from "next/script";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const DEFAULT_CENTER = { lat: 5.2632, lng: 100.4846 }; // Penang as default
const DEFAULT_ZOOM = 10;

const MapDisplay = ({ itineraryData, activeDay }) => {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
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

  // Separate initialization function that will be called when Google Maps API is loaded
  window.initGoogleMap = () => {
    setGoogleMapsLoaded(true);
  };

  // Handle map initialization after Google Maps is loaded
  useEffect(() => {
    if (!googleMapsLoaded || !markers.length) return;

    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const initMap = async () => {
      try {
        // Create the map instance
        const map = new google.maps.Map(mapElement, {
          center: mapConfig.center,
          zoom: mapConfig.zoom,
          mapId: "itineraryPlanningMap"
        });

        mapRef.current = map;

        // Create the info window once and reuse it
        const infoWindow = new google.maps.InfoWindow();

        // Clear any existing markers
        markersRef.current.forEach(marker => {
          marker.setMap(null);
        });
        markersRef.current = [];

        // Add markers to the map
        markers.forEach((marker, index) => {
          // Create a standard marker with a label
          const mapMarker = new google.maps.Marker({
            position: marker.coordinate,
            map,
            title: marker.name,
            label: {
              text: String(index + 1),
              color: "white",
              fontWeight: "bold"
            }
          });

          markersRef.current.push(mapMarker);

          // Add click listener for info window
          mapMarker.addListener("click", () => {
            const content = `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${marker.name}</h3>
                ${marker.formattedAddress ? `<p style="font-size: 14px; margin: 4px 0;">${marker.formattedAddress}</p>` : ''}
                <p style="font-size: 12px; color: #666; margin-top: 4px;">Stop #${index + 1}</p>
              </div>
            `;
            
            infoWindow.setContent(content);
            infoWindow.open(map, mapMarker);
            setSelectedMarker(marker);
          });
        });

        // Draw the route if there are at least 2 markers
        if (markers.length >= 2) {
          try {
            await drawRoute(map, markers);
          } catch (error) {
            console.error("Error drawing route:", error);
            drawFallbackRoute(map, markers);
          }
        }
      } catch (error) {
        console.error("Map initialization error:", error);
      }
    };

    initMap();
  }, [googleMapsLoaded, markers, mapConfig]);

  // Draw the route using the Routes API
  const drawRoute = async (map, routeMarkers) => {
    if (routeMarkers.length < 2) return;

    try {
      // Create the route request payload
      const origin = routeMarkers[0].coordinate;
      const destination = routeMarkers[routeMarkers.length - 1].coordinate;
      
      // Handle intermediate waypoints
      const intermediates = routeMarkers.slice(1, -1).map(marker => ({
        location: {
          latLng: {
            latitude: marker.coordinate.lat,
            longitude: marker.coordinate.lng
          }
        }
      }));

      // Build the request body
      const requestBody = {
        origin: {
          location: {
            latLng: {
              latitude: origin.lat,
              longitude: origin.lng
            }
          }
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng
            }
          }
        },
        intermediates: intermediates,
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        routeModifiers: {
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false
        },
        languageCode: "en-US",
        units: "METRIC"
      };

      // Make the API request to the Routes API
      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'routes.polyline,routes.duration,routes.distanceMeters'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`Routes API request failed with status: ${response.status}`);
      }

      const routeData = await response.json();
      
      if (!routeData.routes || routeData.routes.length === 0) {
        throw new Error("No routes returned from API");
      }

      // Create and display the polyline using the encoded polyline from the response
      const route = routeData.routes[0];
      const decodedPath = google.maps.geometry.encoding.decodePath(
        route.polyline.encodedPolyline
      );

      const routeLine = new google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: "#4285F4",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: map
      });

    } catch (error) {
      console.error("Error with Routes API:", error);
      // Fall back to direct line if the API fails
      drawFallbackRoute(map, routeMarkers);
    }
  };

  // Draw a simple straight-line route as fallback
  const drawFallbackRoute = (map, routeMarkers) => {
    const path = routeMarkers.map(marker => marker.coordinate);
    
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#FF5252", // Different color to indicate fallback
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map
    });
  };

  return (
    <div className="w-full h-full relative">
      {/* Load Google Maps JavaScript API with callback */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initGoogleMap&libraries=geometry`}
        strategy="afterInteractive"
      />
      
      {/* Map container */}
      <div id="map" className="w-full h-full" />
      
      {/* Loading indicator */}
      {!googleMapsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
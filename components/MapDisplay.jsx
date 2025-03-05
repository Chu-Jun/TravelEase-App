"use client";

import React, { useState, useEffect, useRef } from "react";
import Script from "next/script";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const DEFAULT_CENTER = { lat: 5.2632, lng: 100.4846 }; // Penang as default
const DEFAULT_ZOOM = 10;

const MapDisplay = ({ itineraryData, activeDay }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);
  const [mapConfig, setMapConfig] = useState({
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM
  });

  // Get markers for the active day
  const markers = itineraryData?.markers?.[activeDay] || [];
  const transportMode = itineraryData?.transportModes || [];
  console.log(transportMode);

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

  // Initialize map after components are loaded
  useEffect(() => {
    if (!mapLoaded || markers.length === 0) return;

    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Set custom HTML for the info window content
    const createInfoWindowContent = (marker, index) => {
      return `
        <div style="padding: 8px; max-width: 200px;">
          <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${marker.name}</h3>
          ${marker.formattedAddress ? `<p style="font-size: 14px; margin: 4px 0;">${marker.formattedAddress}</p>` : ''}
          <p style="font-size: 12px; color: #666; margin-top: 4px;">Stop #${index + 1}</p>
        </div>
      `;
    };

    // Initialize map components
    const initMap = async () => {
      try {
        // Load the Maps JavaScript API and Routes library
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        
        // Create map
        const map = new Map(mapElement, {
          center: mapConfig.center,
          zoom: mapConfig.zoom,
          mapId: "itineraryPlanningMap"
        });
        
        mapRef.current = map;

        // Create info window (reused for all markers)
        const infoWindow = new google.maps.InfoWindow();
        
        // Add markers with index labels
        markers.forEach((marker, index) => {
          // Create marker with label
          const mapMarker = new google.maps.Marker({
            position: marker.coordinate,
            map: map,
            title: marker.name,
            label: {
              text: String(index + 1),
              color: "white",
              fontWeight: "bold"
            }
          });

          // Add click listener to show info window
          mapMarker.addListener("click", () => {
            infoWindow.setContent(createInfoWindowContent(marker, index));
            infoWindow.open(map, mapMarker);
            setSelectedMarker(marker);
          });
        });

        // Add route if there are at least 2 markers
        if (markers.length >= 2) {
          try {
            // For Routes API, we need to make a fetch request to the API
            const routeResponse = await fetchRoute(markers);
            renderRoute(map, routeResponse);
          } catch (error) {
            console.error('Error fetching or rendering route:', error);
            
            // Fallback: draw simple polyline if routes API call fails
            const path = markers.map(marker => marker.coordinate);
            const polyline = new google.maps.Polyline({
              path: path,
              geodesic: true,
              strokeColor: '#4285F4',
              strokeOpacity: 0.8,
              strokeWeight: 4
            });
            
            polyline.setMap(map);
          }
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Fetch route from Routes API
    const fetchRoute = async (markers) => {
      if (markers.length < 2) return null;

      // Create origin, destination and waypoints
      const origin = markers[0].coordinate;
      const destination = markers[markers.length - 1].coordinate;
      
      // Format waypoints for the Routes API
      const intermediates = markers.slice(1, -1).map(marker => ({
        location: {
          latLng: {
            latitude: marker.coordinate.lat,
            longitude: marker.coordinate.lng
          }
        }
      }));

      // Build the Routes API request
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

      // Make the API request
      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'routes.polyline,routes.legs,routes.duration,routes.distanceMeters'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`Routes API request failed with status: ${response.status}`);
      }

      return await response.json();
    };

    // Render the route on the map
    const renderRoute = (map, routeResponse) => {
      if (!routeResponse || !routeResponse.routes || routeResponse.routes.length === 0) {
        throw new Error('No route found in the response');
      }

      const route = routeResponse.routes[0];
      
      // The polyline in the response is encoded
      const polyline = new google.maps.Polyline({
        path: google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline),
        geodesic: true,
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 4
      });
      
      polyline.setMap(map);
    };

    // Initialize if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Google Maps will call this function when loaded
      window.initGoogleMap = initMap;
    }
  }, [mapLoaded, markers, mapConfig, activeDay]);

  return (
    <div className="w-full h-full relative">
      {/* Load Google Maps JavaScript API with required libraries */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=marker,geometry&callback=initGoogleMap&v=beta`}
        onLoad={() => setMapLoaded(true)}
        strategy="afterInteractive"
      />
      
      {/* Map container */}
      <div id="map" className="w-full h-full" />
      
      {/* Optional loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
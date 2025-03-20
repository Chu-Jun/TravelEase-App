"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
const DEFAULT_CENTER = { lat: 5.2632, lng: 100.4846 }; // Penang as default
const DEFAULT_ZOOM = 10;

// Helper to safely load Google Maps libraries
const loadGoogleMapsLibraries = async () => {
  // First make sure the core Maps API is loaded
  if (!window.google || !window.google.maps) {
    return null;
  }
  
  try {
    // Load required libraries safely
    const libraries = await Promise.all([
      google.maps.importLibrary("maps"),
      google.maps.importLibrary("marker"),
      google.maps.importLibrary("geometry")
    ]);
    
    return {
      maps: libraries[0],
      marker: libraries[1],
      geometry: libraries[2]
    };
  } catch (error) {
    console.error("Error loading Google Maps libraries:", error);
    return null;
  }
};

// Simple debounce implementation
function debounce(func, wait) {
  let timeout;
  const debouncedFunction = function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
  debouncedFunction.cancel = function() {
    clearTimeout(timeout);
  };
  return debouncedFunction;
}

const MapDisplay = ({ itineraryData, activeDay }) => {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [googleMapsLibraries, setGoogleMapsLibraries] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const infoWindowRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  const currentMarkersDataRef = useRef([]);
  
  // Get markers for the active day
  const markers = itineraryData?.markers?.[activeDay] || [];
  const transportMode = itineraryData?.transportModes || [];
  
  // Calculate map center and zoom based on markers
  const getMapConfig = () => {
    if (markers.length > 0) {
      // Find average lat/lng to center the map
      const sumLat = markers.reduce((sum, marker) => sum + marker.coordinate.lat, 0);
      const sumLng = markers.reduce((sum, marker) => sum + marker.coordinate.lng, 0);
      
      return {
        center: {
          lat: sumLat / markers.length,
          lng: sumLng / markers.length
        },
        zoom: markers.length > 1 ? 11 : 13 // Zoom out if multiple markers
      };
    } else {
      // Default if no markers
      return {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM
      };
    }
  };

  // Fetch API key from server
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/maps-key');
        const data = await response.json();
        setApiKey(data.apiKey);
      } catch (error) {
        console.error("Error fetching API key:", error);
      }
    };
    
    fetchApiKey();
  }, []);

  // Load Google Maps script after API key is available
  useEffect(() => {
    if (!apiKey || scriptLoadedRef.current) return;
    
    console.log("Loading Google Maps script with API key");
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&v=beta&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    window.initMap = async () => {
      console.log("initMap callback triggered");
      try {
        const libraries = await loadGoogleMapsLibraries();
        if (libraries) {
          console.log("Google Maps libraries loaded successfully");
          setGoogleMapsLibraries(libraries);
          scriptLoadedRef.current = true;
        }
      } catch (error) {
        console.error("Error in initMap callback:", error);
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (window.initMap) {
        window.initMap = null;
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey]);

  // Initial map initialization - only runs once when libraries are loaded
  useEffect(() => {
    if (googleMapsLibraries && apiKey && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [googleMapsLibraries, apiKey]);

  // Handle updating the map when activeDay or markers change
  useEffect(() => {
    if (mapInstanceRef.current && googleMapsLibraries) {
      // Store string representation of markers data to compare for changes
      const newMarkersData = JSON.stringify(markers.map(m => m.coordinate));
      const prevMarkersData = JSON.stringify(currentMarkersDataRef.current);
      
      // Only update if markers have actually changed
      if (newMarkersData !== prevMarkersData) {
        currentMarkersDataRef.current = markers.map(m => m.coordinate);
        updateMapWithNewMarkers();
      }
    }
  }, [activeDay, markers]);

  // Clean up map resources
  const cleanupMap = () => {
    // Clear existing markers
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        if (marker) marker.setMap(null);
      });
      markersRef.current = [];
    }

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    
    // Close info window if open
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  };

  // Fetch route from Routes API
  const fetchRoute = async (markers) => {
    if (markers.length < 2 || !apiKey) return null;

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

    try {
      // Make the API request
      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'routes.polyline,routes.legs,routes.duration,routes.distanceMeters'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`Routes API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching route:', error);
      return null;
    }
  };

  // Initialize map once
  const initializeMap = async () => {
    // Prevent concurrent initializations
    if (isInitializing || !apiKey) return;
    setIsInitializing(true);
    
    try {
      if (!googleMapsLibraries || !googleMapsLibraries.maps) {
        console.error("Google Maps libraries not loaded");
        return;
      }
      
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error("Map container element not found");
        return;
      }
      
      // Get current map configuration
      const mapConfig = getMapConfig();
      
      // Create new map instance
      if (!mapInstanceRef.current) {
        // Create new map
        const { Map } = googleMapsLibraries.maps;
        const newMap = new Map(mapElement, {
          center: mapConfig.center,
          zoom: mapConfig.zoom,
          mapId: "itineraryPlanningMap"
        });
        
        mapInstanceRef.current = newMap;
        
        // Create info window only once
        infoWindowRef.current = new google.maps.InfoWindow();
      }
      
      // Add initial markers and routes
      updateMapWithNewMarkers();
      
      setMapLoaded(true);
    } catch (error) {
      console.error('Error in map initialization:', error);
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Update map with new markers and routes without recreating the map
  const updateMapWithNewMarkers = async () => {
    if (!mapInstanceRef.current) return;
    
    try {
      // Update center and zoom
      const mapConfig = getMapConfig();
      mapInstanceRef.current.setCenter(mapConfig.center);
      mapInstanceRef.current.setZoom(mapConfig.zoom);
      
      // Clean up existing markers and polyline
      cleanupMap();
      
      // Add markers
      const newMarkers = [];
      markers.forEach((marker, index) => {
        try {
          // Create marker with label
          const mapMarker = new google.maps.Marker({
            position: marker.coordinate,
            map: mapInstanceRef.current,
            title: marker.name,
            label: {
              text: String(index + 1),
              color: "white",
              fontWeight: "bold"
            }
          });

          // Add click listener to show info window
          mapMarker.addListener("click", async () => {
            // Show basic info immediately
            let content = `
              <div style="padding: 8px; max-width: 250px;">
                <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${marker.name}</h3>
                <p style="font-size: 12px; color: #666; margin-top: 4px;">Stop #${index + 1}</p>
                <p style="font-size: 12px;">Loading details...</p>
              </div>
            `;
            
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(mapInstanceRef.current, mapMarker);
            setSelectedMarker(marker);
            
            // If we have a place_id, fetch additional details
            if (marker.placeId) {
              try {
                const { Place } = await google.maps.importLibrary("places");
                const request = {
                  placeId: marker.placeId,
                  fields: ['rating', 'user_ratings_total', 'opening_hours']
                };
                
                const service = new google.maps.places.PlacesService(mapInstanceRef.current);
                service.getDetails(request, (place, status) => {
                  if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Update content with detailed information
                    content = `
                      <div style="padding: 8px; max-width: 250px;">
                        <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${marker.name}</h3>
                        
                        ${place.rating ? `
                          <div style="display: flex; align-items: center; margin: 8px 0;">
                            <span style="font-weight: bold; margin-right: 4px;">${place.rating}</span>
                            <span style="color: #facc15;">★</span>
                            ${place.user_ratings_total ? `<span style="color: #666; font-size: 12px; margin-left: 4px;">(${place.user_ratings_total} reviews)</span>` : ''}
                          </div>
                        ` : ''}
                        
                        ${place.opening_hours ? `
                          <div style="margin: 8px 0;">
                            <p style="font-size: 14px; font-weight: bold; margin-bottom: 2px;">Hours:</p>
                            <p style="font-size: 13px; margin: 0;">${place.opening_hours.weekday_text.join('<br>')}</p>
                          </div>
                        ` : ''}
                        
                        <p style="font-size: 12px; color: #666; margin-top: 8px;">Stop #${index + 1}</p>
                      </div>
                    `;
                    infoWindowRef.current.setContent(content);
                  }
                });
              } catch (error) {
                console.error('Error fetching place details:', error);
              }
            }
          });

          newMarkers.push(mapMarker);
        } catch (error) {
          console.error(`Error creating marker ${index}:`, error);
        }
      });
      markersRef.current = newMarkers;
      
      // Add route if there are at least 2 markers
      if (markers.length >= 2) {
        try {
          // Fetch route
          const routeResponse = await fetchRoute(markers);
          
          if (routeResponse && routeResponse.routes && routeResponse.routes.length > 0) {
            const route = routeResponse.routes[0];
            
            // Create polyline from encoded path
            if (route.polyline && route.polyline.encodedPolyline) {
              try {
                const path = google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline);
                const polyline = new google.maps.Polyline({
                  path: path,
                  geodesic: true,
                  strokeColor: '#4285F4',
                  strokeOpacity: 0.8,
                  strokeWeight: 4
                });
                
                polyline.setMap(mapInstanceRef.current);
                polylineRef.current = polyline;
              } catch (error) {
                console.error("Error rendering polyline:", error);
                createFallbackPolyline();
              }
            } else {
              createFallbackPolyline();
            }
          } else {
            createFallbackPolyline();
          }
        } catch (error) {
          console.error('Error handling route:', error);
          createFallbackPolyline();
        }
      }
    } catch (error) {
      console.error('Error updating map:', error);
    }
  };
  
  // Create a simple polyline between markers as fallback
  const createFallbackPolyline = () => {
    try {
      // Create simple polyline connecting the markers
      const path = markers.map(marker => marker.coordinate);
      
      const polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 4
      });
      
      polyline.setMap(mapInstanceRef.current);
      polylineRef.current = polyline;
    } catch (error) {
      console.error("Error creating fallback polyline:", error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMap();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* Map container */}
      <div id="map" className="w-full h-full" />
      
      {/* Loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
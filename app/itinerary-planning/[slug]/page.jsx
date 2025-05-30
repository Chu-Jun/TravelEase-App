"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faDownload,
  faChevronRight, 
  faChevronDown,
  faSave,
  faMap
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  getTripById, 
  getItinerary, 
  saveItineraryDay 
} from "@/app/actions";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import LocationPicker from "@/components/LocationPicker";
import MapDisplay from "@/components/MapDisplay";
import RouteOptimizationControls from "@/components/RouteOptimizationControls";
import TimeConstraintsManager from "@/components/TimeConstraintsManager";
import ScheduleDisplay from "@/components/ScheduleDisplay";
import RouteOptimizationLoader from "@/components/RouteOptimizationLoader";

const generateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  
  const days = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push({
      date: new Date(d),
      label: `Day ${days.length + 1}`,
    });
  }

  return days;
};

const TravelEaseItineraryPage = () => {
  const { slug } = useParams();
  
  // State hooks initialized upfront
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState([]);
  const [itinerary, setItinerary] = useState({ places: {}, markers: {} });
  const [editedItinerary, setEditedItinerary] = useState({ places: {}, markers: {} });
  const [collapsedSections, setCollapsedSections] = useState({});
  const [hasChanges, setHasChanges] = useState({});
  const [savingDay, setSavingDay] = useState(null);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [mobileMapVisible, setMobileMapVisible] = useState(false);
  const [optimizationType, setOptimizationType] = useState("time");
  const [transportMode, setTransportMode] = useState("BOTH");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [visitDurationMinutes, setVisitDurationMinutes] = useState(60);
  // New state to track which days have schedules
  const [daysWithSchedules, setDaysWithSchedules] = useState({});

  // Fetch trip and itinerary data
  useEffect(() => {
    if (!slug) return;

    const fetchTripData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get trip details
        let selectedTrip = await getTripById(slug);
        selectedTrip = selectedTrip.data;
        if (!selectedTrip) {
          setError("Trip not found");
          setLoading(false);
          return;
        }
        setTrip(selectedTrip);
        
        // Generate days when trip is available
        const generatedDays = generateDays(selectedTrip.tripstartdate, selectedTrip.tripenddate);
        setDays(generatedDays);
        
        // Set initial active day to Day 1
        if (generatedDays.length > 0) {
          setActiveDay(generatedDays[0].label);
        }
        
        // Fetch itinerary data
        const fetchedItinerary = await getItinerary(slug);
        console.log("Fetched itinerary data:", fetchedItinerary);
        
        if (fetchedItinerary.error) {
          setError(fetchedItinerary.error);
        } else {
          // Initialize empty places for each day if they don't exist
          const initialItinerary = { ...fetchedItinerary };
          if (!initialItinerary.places) initialItinerary.places = {};
          if (!initialItinerary.markers) initialItinerary.markers = {};
          
          // Ensure each day has an entry in places
          generatedDays.forEach(day => {
            if (!initialItinerary.places[day.label]) {
              initialItinerary.places[day.label] = [""];
            }
            if (!initialItinerary.markers[day.label]) {
              initialItinerary.markers[day.label] = [];
            }
            if(day.label != "Day 1"){
              setCollapsedSections((prevState) => ({
                ...prevState,
                [day.label]: true,
              }));
            }
          });
          
          setItinerary(initialItinerary);
          setEditedItinerary(JSON.parse(JSON.stringify(initialItinerary)));
          
          // Initialize daysWithSchedules state based on fetched data
          const scheduledDays = {};
          if (initialItinerary.schedule) {
            Object.keys(initialItinerary.schedule).forEach(day => {
              scheduledDays[day] = true;
            });
          }
          setDaysWithSchedules(scheduledDays);
        }
      } catch (err) {
        setError("Error loading trip data: " + err.message);
        console.error("Error fetching trip data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [slug]);

  useEffect(() => {
    if (itinerary) {
      setEditedItinerary(JSON.parse(JSON.stringify(itinerary)));
    }
  }, [itinerary]);

  // Function to process places from the LocationPicker component
  const handlePlacesChange = (day, updatedPlaces) => {
    setEditedItinerary((prev) => {
      // Create a deep copy of the previous state
      const newItinerary = JSON.parse(JSON.stringify(prev));
      
      // Ensure places object exists
      if (!newItinerary.places) newItinerary.places = {};
      
      // Update places
      newItinerary.places = {
        ...newItinerary.places,
        [day]: updatedPlaces
      };
      
      // Ensure markers object exists
      if (!newItinerary.markers) newItinerary.markers = {};
      
      // Update markers based on place objects
      newItinerary.markers = {
        ...newItinerary.markers,
        [day]: updatedPlaces
          .filter(place => 
            typeof 
            place !== null && 
            place.coordinate &&
            (place.coordinate.lat !== 0 || place.coordinate.lng !== 0)
          )
          .map(place => ({
            name: place.name,
            coordinate: place.coordinate,
            formattedAddress: place.formattedAddress,
            placeId: place.placeId
          }))
      };
      
      // Update has changes status
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: true
      }));
      
      return newItinerary;
    });
  };

  // Function to add a new place
  const addPlace = (day) => {
    setEditedItinerary((prev) => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      
      // Initialize places object if it doesn't exist
      if (!newItinerary.places) newItinerary.places = {};
      
      // Initialize day if it doesn't exist
      if (!newItinerary.places[day]) {
        newItinerary.places[day] = [];
      }
      
      newItinerary.places[day] = [...newItinerary.places[day], ""];
      
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: true
      }));
      
      return newItinerary;
    });
  };

  // Function to remove a place
  const removePlace = (day, index) => {
    setEditedItinerary((prev) => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      
      // Ensure places object exists
      if (!newItinerary.places) newItinerary.places = {};
      
      // Remove the place
      if (newItinerary.places[day]) {
        newItinerary.places[day].splice(index, 1);
        
        // If all places are removed, add an empty one
        if (newItinerary.places[day].length === 0) {
          newItinerary.places[day].push("");
        }
        
        // Ensure markers object exists and update it
        if (!newItinerary.markers) newItinerary.markers = {};
        if (newItinerary.markers[day]) {
          newItinerary.markers[day].splice(index, 1);
        }
      }
      
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: true
      }));
      
      return newItinerary;
    });
  };

  // Function to move a place up
  const moveUp = (day, index) => {
    if (index === 0) return;
    
    setEditedItinerary((prev) => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      
      // Ensure places object exists
      if (!newItinerary.places) newItinerary.places = {};
      
      // Swap places
      if (newItinerary.places[day]) {
        const temp = newItinerary.places[day][index];
        newItinerary.places[day][index] = newItinerary.places[day][index - 1];
        newItinerary.places[day][index - 1] = temp;
      }
      
      // Ensure markers object exists and update it
      if (!newItinerary.markers) newItinerary.markers = {};
      if (newItinerary.markers[day] && 
          newItinerary.markers[day][index] && 
          newItinerary.markers[day][index - 1]) {
        const temp = newItinerary.markers[day][index];
        newItinerary.markers[day][index] = newItinerary.markers[day][index - 1];
        newItinerary.markers[day][index - 1] = temp;
      }
      
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: true
      }));
      
      return newItinerary;
    });
  };

  // Function to move a place down
  const moveDown = (day, index) => {
    setEditedItinerary((prev) => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      
      // Ensure places object exists
      if (!newItinerary.places) newItinerary.places = {};
      
      // Swap places
      if (newItinerary.places[day] && index < newItinerary.places[day].length - 1) {
        const temp = newItinerary.places[day][index];
        newItinerary.places[day][index] = newItinerary.places[day][index + 1];
        newItinerary.places[day][index + 1] = temp;
      }
      
      // Ensure markers object exists and update it
      if (!newItinerary.markers) newItinerary.markers = {};
      if (newItinerary.markers[day] && 
          newItinerary.markers[day][index] && 
          newItinerary.markers[day][index + 1]) {
        const temp = newItinerary.markers[day][index];
        newItinerary.markers[day][index] = newItinerary.markers[day][index + 1];
        newItinerary.markers[day][index + 1] = temp;
      }
      
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: true
      }));
      
      return newItinerary;
    });
  };

  // Function to save changes to database
  const saveChanges = async (day) => {
    try {
      console.log(editedItinerary);
      setSavingDay(day);
      setError(null);
      
      // Ensure places exist for this day
      const placesToSave = editedItinerary.places && editedItinerary.places[day] 
        ? editedItinerary.places[day] 
        : [""];
      
      // Save to database
      const result = await saveItineraryDay(slug, day, placesToSave);
      
      if (result.error) {
        setError(result.error);
      } else {
        // Update local state with data returned from server
        setItinerary(result);
        setEditedItinerary(JSON.parse(JSON.stringify(result)));
        
        setHasChanges(prev => ({
          ...prev,
          [day]: false
        }));
      }
    } catch (err) {
      setError("Error saving changes: " + err.message);
      console.error("Error saving itinerary:", err);
    } finally {
      setSavingDay(null);
    }
  };

  const toggleSection = (dayLabel) => {
    // Set this day as active for the map display
    setActiveDay(dayLabel);
    
    // Toggle collapsed state
    setCollapsedSections((prevState) => ({
      ...prevState,
      [dayLabel]: !prevState[dayLabel],
    }));
  };

  // Function to optimize route
  const optimizeRoute = async (day) => {
    try {
      setOptimizationLoading(true);
      
      // Get markers for the selected day
      const dayMarkers = editedItinerary.markers[day] || [];
      
      if (dayMarkers.length < 2) {
        setError("Need at least 2 locations to optimize a route");
        setOptimizationLoading(false);
        return;
      }
      
      // Find the day object that corresponds to this day label
      const dayObj = days.find(d => d.label === day);
      
      // Format the data for the API
      const requestData = {
        locations: dayMarkers.map(marker => ({
          name: marker.name,
          lat: marker.coordinate.lat,
          lng: marker.coordinate.lng
        })),
        // Use the custom startTime if available, otherwise generate from the day's date
        start_time: (editedItinerary.startTimes && editedItinerary.startTimes[day]) ||
                   (dayObj 
                     ? `${dayObj.date.toISOString().split('T')[0]}T${new Date().toTimeString().split(' ')[0].slice(0, 5)}` 
                     // Fallback to current date if nothing else works
                     : `${new Date().toISOString().split('T')[0]}T${new Date().toTimeString().split(' ')[0].slice(0, 5)}`
                   ),
                 
        location_time_constraints: editedItinerary.timeConstraints?.[day] || [],
        preferred_mode: transportMode,
        optimization_type: optimizationType,
        visit_duration_minutes: editedItinerary.visitDurationMinutes || visitDurationMinutes
      };
      
      // Call the API
      const response = await fetch('https://true-eye-460602-n0.et.r.appspot.com/api/optimize-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Optimization result:", result);
      
      // Store the schedule and update the itinerary
      setEditedItinerary(prev => {
        const newItinerary = JSON.parse(JSON.stringify(prev));
        
        // Create a map of place names to their full place objects
        const placeMap = {};
        dayMarkers.forEach((marker, index) => {
          placeMap[marker.name] = newItinerary.places[day][index];
        });
        
        // Create new arrays in optimized order
        const optimizedPlaces = result.optimized_sequence.map(name => placeMap[name]);
        const optimizedMarkers = result.optimized_sequence.map(name => 
          dayMarkers.find(marker => marker.name === name)
        );
  
        // Store schedule and transportation information
        newItinerary.schedule = {
          ...newItinerary.schedule || {},
          [day]: result.schedule
        };
        
        newItinerary.transportModes = {
          ...newItinerary.transportModes || {},
          [day]: {
            preferredMode: result.preferred_mode,
            travelModes: result.travel_modes
          }
        };
        
        newItinerary.summary = {
          ...newItinerary.summary || {},
          [day]: result.summary
        };
        
        // Update the itinerary with optimized sequences
        newItinerary.places[day] = optimizedPlaces;
        newItinerary.markers[day] = optimizedMarkers;
        
        // Mark as changed
        setHasChanges(prevChanges => ({
          ...prevChanges,
          [day]: true
        }));
        
        return newItinerary;
      });

      // After successful optimization and state update:
      setDaysWithSchedules(prevState => ({
        ...prevState,
        [day]: true  // Set this day as having a schedule
      }));
      
      // Show success message or notification
      setError(null);
      
    } catch (err) {
      setError("Error optimizing route: " + err.message);
      console.error("Error optimizing route:", err);
    } finally {
      setOptimizationLoading(false);
    }
  };

  const handleTimeConstraintsChange = (day, constraints) => {
    setEditedItinerary(prev => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      
      // Initialize timeConstraints object if it doesn't exist
      if (!newItinerary.timeConstraints) {
        newItinerary.timeConstraints = {};
      }
      
      // Update constraints for this day
      newItinerary.timeConstraints[day] = constraints;
      
      // Mark as changed
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: true
      }));
      
      return newItinerary;
    });
  };

  // Add this function to handle start time changes
  const handleStartTimeChange = (day, startTime) => {
    console.log("Setting start time for day:", day, "to:", startTime); // Add logging
    
    setEditedItinerary(prev => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      
      // Initialize startTimes object if it doesn't exist
      if (!newItinerary.startTimes) {
        newItinerary.startTimes = {};
      }
      
      // Update start time for this day
      newItinerary.startTimes[day] = startTime;
      
      // Mark as changed
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: true
      }));
      
      return newItinerary;
    });
  };

  // Add this function to handle visit duration changes
  const handleVisitDurationChange = (duration) => {
    setVisitDurationMinutes(duration);
    
    setEditedItinerary(prev => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      newItinerary.visitDurationMinutes = duration;
      return newItinerary;
    });
  };

  const generateGoogleMapsURL = (locations) => {
    if (!locations || locations.length < 2) return "";
  
    const origin = encodeURIComponent(locations[0]);
    const destination = encodeURIComponent(locations[locations.length - 1]);
    const waypoints = locations.slice(1, -1).map(loc => encodeURIComponent(loc)).join('|');
  
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
  };

  const downloadItineraryPDF = async () => {
    // Show loading state using the correct state function
    setPdfLoading(true);
   
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF("p", "mm", "a4");
      let position = 15; // Starting position for content
     
      // Add title
      pdf.setFontSize(20);
      pdf.text(`Itinerary for ${trip.tripname}`, 105, position, { align: "center" });
      position += 15;
     
      // Add trip details
      pdf.setFontSize(12);
      const tripDateRange = `${new Date(trip.tripstartdate).toLocaleDateString()} - ${new Date(trip.tripenddate).toLocaleDateString()}`;
      pdf.text(`Trip Dates: ${tripDateRange}`, 105, position, { align: "center" });
      position += 15;
     
      // Process each day
      for (const day of days) {
        // Check if we need a new page
        if (position > 270) {
          pdf.addPage();
          position = 15;
        }
       
        // Add day header
        pdf.setFontSize(16);
        pdf.setFont(undefined, "bold");
        const dayTitle = `${day.label} - ${day.date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}`;
        pdf.text(dayTitle, 15, position);
        position += 10;
        
        // Add day summary if available
        if (editedItinerary.summary && editedItinerary.summary[day.label]) {
          const summary = editedItinerary.summary[day.label];
          pdf.setFontSize(10);
          pdf.setFont(undefined, "italic");
          if (summary.total_distance_km) {
            pdf.text(`Total distance: ${summary.total_distance_km} km`, 15, position);
            position += 5;
          }
          if (summary.total_itinerary_time) {
            pdf.text(`Total time: ${summary.total_itinerary_time}`, 15, position);
            position += 5;
          }
          if (summary.total_travel_time) {
            pdf.text(`Travel time: ${summary.total_travel_time}`, 15, position);
            position += 8;
          }
        }
        
        // Add places with schedule for this day
        pdf.setFontSize(12);
        pdf.setFont(undefined, "normal");
       
        const dayPlaces = editedItinerary.places[day.label] || [];
        const daySchedule = editedItinerary.schedule && editedItinerary.schedule[day.label] ? 
                            editedItinerary.schedule[day.label] : [];
        
        // Generate Google Maps link for the day's itinerary
        if (dayPlaces.length > 0) {
          const locationNames = dayPlaces.map(place => place.name).filter(name => !!name);
          if (locationNames.length > 1) {
            const mapsURL = generateGoogleMapsURL(locationNames);
            if (mapsURL) {
              pdf.setFontSize(10);
              pdf.setTextColor(0, 0, 255);
              pdf.setFont(undefined, "normal");
              pdf.textWithLink("View route on Google Maps", 15, position, { url: mapsURL });
              pdf.setTextColor(0, 0, 0);
              position += 8;
            }
          }
        }
       
        if (dayPlaces.length === 0 || (dayPlaces.length === 1 && (!dayPlaces[0] || !dayPlaces[0].name))) {
          pdf.text("No places added for this day", 20, position);
          position += 8;
        } else {
          for (let i = 0; i < dayPlaces.length; i++) {
            const place = dayPlaces[i];
            const scheduleItem = daySchedule.find(item => item.location === place.name);
           
            // Check if we need a new page
            if (position > 270) {
              pdf.addPage();
              position = 15;
            }
           
            if (place && place.name) {
              // Add place number and name
              pdf.setFont(undefined, "bold");
              pdf.text(`${i + 1}. ${place.name}`, 20, position);
              position += 6;
             
              // Add schedule information if available
              if (scheduleItem) {
                pdf.setFont(undefined, "normal");
                pdf.text(`Time: ${scheduleItem.arrival_time} - ${scheduleItem.departure_time}`, 25, position);
                position += 6;
                
                // Add travel information if available
                if (scheduleItem.travel_from_previous) {
                  const travel = scheduleItem.travel_from_previous;
                  pdf.setFont(undefined, "italic");
                  pdf.text(`Travel from previous: ${travel.duration} (${travel.distance_km} km) by ${travel.mode}`, 25, position);
                  position += 6;
                }
              }
             
              // Add place address if available
              if (place.formattedAddress) {
                pdf.setFont(undefined, "normal");
                pdf.text(place.formattedAddress, 25, position);
                position += 6;
              }
              
              // Add Google Maps link for individual location
              if (place.placeId) {
                pdf.setTextColor(0, 0, 255);
                pdf.setFontSize(9);
                const locationMapUrl = `https://www.google.com/maps/place/?q=place_id:${place.placeId}`;
                pdf.textWithLink("View on Google Maps", 25, position, { url: locationMapUrl });
                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(12);
                position += 6;
              }
             
              // Add transportation mode if available
              if (editedItinerary.transportModes &&
                  editedItinerary.transportModes[day.label] &&
                  editedItinerary.transportModes[day.label].travelModes &&
                  i < editedItinerary.transportModes[day.label].travelModes.length) {
                const mode = editedItinerary.transportModes[day.label].travelModes[i];
                if (mode && !scheduleItem?.travel_from_previous) { // Only add if not already added from schedule
                  pdf.setFont(undefined, "italic");
                  pdf.text(`Transportation: ${mode}`, 25, position);
                  position += 8;
                } else {
                  position += 2;
                }
              } else {
                position += 2;
              }
            }
          }
        }
       
        position += 10; // Add space between days
      }
     
      // Save the PDF
      pdf.save(`${trip.tripname}-itinerary.pdf`);
     
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Error generating PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse">Loading trip data...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render error state if trip not found
  if (!trip) {
    return (
      <div className="flex h-screen items-center justify-center">
        Trip not found! Please check the URL and try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row mt-16">
      {/* Sidebar */}
      <div className="hidden md:block w-full md:w-1/4 bg-white p-4">
        <ul className="space-y-4">
          <li><Link className="text-gray-800 font-semibold" href={`/itinerary-planning`}>Overview</Link></li>
          <li className="text-gray-800 font-semibold">
            <span>Itinerary</span>
            <ul className="ml-4 mt-2 space-y-2">
              {days.map((day) => (
                <li
                  key={day.label}
                  className={`cursor-pointer hover:text-blue-500 transition-colors ${
                    day.label === activeDay ? "text-blue-600 font-medium" : ""
                  }`}
                  onClick={() => toggleSection(day.label)}
                >
                  {day.label}
                </li>
              ))}
            </ul>
          </li>
          <li><Link className="text-gray-800 font-semibold" href={`/booking-management/${slug}`}>Booking / Reservation</Link></li>
        </ul>
      </div>

      {/* Main content */}
      <div className="w-full md:w-3/4 flex flex-col">
        <div className="flex justify-between items-center p-6 pb-2">
          <h2 className="text-2xl font-bold">Itinerary for {trip.tripname}</h2>
          <button
            onClick={downloadItineraryPDF}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} />
            {loading ? "Generating..." : "Download PDF"}
          </button>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 mb-2">
            {error}
          </div>
        )}
        
        {/* Split view: itinerary and map */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-visible">
          {/* Left side: Itinerary */}
          <div className="w-full md:w-1/2 p-4 md:p-6">
            {days.map((day) => (
              <div 
                key={day.label} 
                className={`mb-6 bg-white border rounded-lg p-4 shadow-sm ${
                  day.label === activeDay ? "border-blue-500" : ""
                }`}
              >
                <h3
                  className="font-bold text-lg flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection(day.label)}
                >
                  <span>{`${day.label} – ${day.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}`}</span>
                  <FontAwesomeIcon
                    icon={collapsedSections[day.label] ? faChevronRight : faChevronDown}
                    className="text-gray-500"
                  />
                </h3>
                {!collapsedSections[day.label] && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Places to Visit</h4>
                    </div>
                    
                    {/* Time Constraints Manager */}
                    <TimeConstraintsManager
                      dayLabel={day.label}
                      locations={(editedItinerary.markers && editedItinerary.markers[day.label]) || []}
                      timeConstraints={(editedItinerary.timeConstraints && editedItinerary.timeConstraints[day.label]) || []}
                      startTime={
                        (editedItinerary.startTimes && editedItinerary.startTimes[day.label]) ||
                        `${day.date.toISOString().split('T')[0]}T${new Date().toTimeString().split(' ')[0].slice(0, 5)}`
                      }
                      visitDuration={editedItinerary.visitDurationMinutes || visitDurationMinutes}
                      onTimeConstraintsChange={(constraints) => handleTimeConstraintsChange(day.label, constraints)}
                      onStartTimeChange={(time) => handleStartTimeChange(day.label, time)}
                      onVisitDurationChange={handleVisitDurationChange}
                    />
                    
                    <div className="w-full sm:max-w-md lg:max-w-lg overflow-hidden">
                      <RouteOptimizationControls 
                        dayLabel={day.label}
                        onOptimize={optimizeRoute}
                        loading={optimizationLoading}
                        optimizationType={optimizationType}
                        setOptimizationType={setOptimizationType}
                        transportMode={transportMode}
                        setTransportMode={setTransportMode}
                      />
                    </div>
                    
                    <LocationPicker
                      places={(editedItinerary.places && editedItinerary.places[day.label]) || [""]}
                      onPlacesChange={handlePlacesChange}
                      dayLabel={day.label}
                      onMoveUp={moveUp}
                      onMoveDown={moveDown}
                      onRemovePlace={removePlace}
                      onAddPlace={addPlace}
                      transportModes={editedItinerary.transportModes || {}}
                    />

                    <div className="mt-1 flex flex-col lg:flex-row justify-end items-end gap-4">
                      {/* Schedule Display - Only show after optimization */}
                      {(daysWithSchedules[day.label] || 
                        (editedItinerary.schedule && editedItinerary.schedule[day.label])) && (
                        <div className="w-full lg:w-auto">
                          <ScheduleDisplay 
                            schedule={editedItinerary.schedule?.[day.label]}
                            summary={editedItinerary.summary?.[day.label]}
                          />
                        </div>
                      )}

                      {/* Save Changes Button */}
                      {hasChanges[day.label] && (
                        <button 
                          onClick={() => saveChanges(day.label)}
                          disabled={savingDay === day.label}
                          className={`${
                            savingDay === day.label ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                          } text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors`}
                        >
                          <FontAwesomeIcon icon={faSave} />
                          {savingDay === day.label ? 'Saving...' : 'Save Changes'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Right side: Map */}
          <div className={`
            w-full md:w-1/2 p-4 md:p-6
            ${mobileMapVisible ? 'block' : 'hidden'} md:block
            ${mobileMapVisible ? 'h-80' : 'h-0'} md:h-screen
            transition-all duration-300
            md:right-0 md:fixed md:max-h-[80%] md:max-w-[39%]
          `}>
            <div className="border rounded-lg h-full overflow-hidden shadow-sm">
              <MapDisplay
                itineraryData={editedItinerary}
                activeDay={activeDay}
              />
            </div>
          </div>
          <div className="md:hidden w-full mb-4 flex justify-center">
            <button 
              onClick={() => setMobileMapVisible(!mobileMapVisible)}
              className="w-[75%] bg-blue-500 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faMap} className="mr-2" />
              {mobileMapVisible ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>
      </div>
      <RouteOptimizationLoader isVisible={optimizationLoading} />
    </div>
  );
};

export default TravelEaseItineraryPage;
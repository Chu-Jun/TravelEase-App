"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLocationDot, 
  faChevronRight, 
  faChevronDown, 
  faArrowUp, 
  faArrowDown,
  faSave
} from "@fortawesome/free-solid-svg-icons";
import { useParams } from "next/navigation";
import { 
  getTripById, 
  getItinerary, 
  saveItineraryDay 
} from "@/app/actions";

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
  const [itinerary, setItinerary] = useState({});
  const [editedItinerary, setEditedItinerary] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({});
  const [hasChanges, setHasChanges] = useState({});
  const [savingDay, setSavingDay] = useState(null);
  const [error, setError] = useState(null);

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
        
        // Fetch itinerary data
        const fetchedItinerary = await getItinerary(slug);
        console.log(fetchedItinerary);
        if (fetchedItinerary.error) {
          setError(fetchedItinerary.error);
        } else {
          setItinerary(fetchedItinerary);
          setEditedItinerary(JSON.parse(JSON.stringify(fetchedItinerary)));
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

  // Function to handle input field changes
  const handlePlaceChange = (day, index, value) => {
    setEditedItinerary((prev) => {
      const dayPlaces = [...(prev[day] || [""])];
      dayPlaces[index] = value;
      
      // Update has changes status
      const originalValue = itinerary[day]?.[index] || "";
      const dayHasChanges = originalValue !== value || 
        JSON.stringify(prev[day]) !== JSON.stringify(itinerary[day]);
      
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: dayHasChanges
      }));
      
      return {
        ...prev,
        [day]: dayPlaces
      };
    });
  };

  // Function to add a new place
  const addPlace = (day) => {
    setEditedItinerary((prev) => {
      const dayPlaces = [...(prev[day] || []), ""];
      
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: true
      }));
      
      return {
        ...prev,
        [day]: dayPlaces
      };
    });
  };

  // Function to remove a place
  const removePlace = (day, index) => {
    setEditedItinerary((prev) => {
      const dayPlaces = [...(prev[day] || [""])];
      dayPlaces.splice(index, 1);
      
      // If all places are removed, add an empty one
      if (dayPlaces.length === 0) {
        dayPlaces.push("");
      }
      
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: true
      }));
      
      return {
        ...prev,
        [day]: dayPlaces
      };
    });
  };

  // Function to move a place up
  const moveUp = (day, index) => {
    if (index === 0) return;
    
    setEditedItinerary((prev) => {
      const dayPlaces = [...(prev[day] || [""])];
      
      // Safety check for array bounds
      if (index < 1 || index >= dayPlaces.length) return prev;
      
      const temp = dayPlaces[index];
      dayPlaces[index] = dayPlaces[index - 1];
      dayPlaces[index - 1] = temp;
      
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: true
      }));
      
      return {
        ...prev,
        [day]: dayPlaces
      };
    });
  };

  // Function to move a place down
  const moveDown = (day, index) => {
    setEditedItinerary((prev) => {
      const dayPlaces = [...(prev[day] || [""])];
      
      // Safety check for array bounds
      if (index < 0 || index >= dayPlaces.length - 1) return prev;
      
      const temp = dayPlaces[index];
      dayPlaces[index] = dayPlaces[index + 1];
      dayPlaces[index + 1] = temp;
      
      setHasChanges(prevChanges => ({
        ...prevChanges,
        [day]: true
      }));
      
      return {
        ...prev,
        [day]: dayPlaces
      };
    });
  };

  // Function to save changes to database
  const saveChanges = async (day) => {
    try {
      setSavingDay(day);
      setError(null);
      
      // Filter out empty places
      const updatedPlaces = (editedItinerary[day] || []).filter(place => place.trim() !== "");
      
      // If all places were empty, add one empty place back
      const placesToSave = updatedPlaces.length > 0 ? updatedPlaces : [""];
      
      // Save to database
      const result = await saveItineraryDay(slug, day, placesToSave);
      
      if (result.error) {
        setError(result.error);
      } else {
        // Update local state
        setItinerary(prev => ({
          ...prev,
          [day]: result[day] || [""]
        }));
        
        setEditedItinerary(prev => ({
          ...prev,
          [day]: result[day] || [""]
        }));
        
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
    setCollapsedSections((prevState) => ({
      ...prevState,
      [dayLabel]: !prevState[dayLabel],
    }));
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
    <div className="flex h-screen mt-16">
      <div className="w-1/4 bg-gray-100 p-4">
        <ul className="space-y-4">
          <li className="text-gray-800 font-semibold">Overview</li>
          <li className="text-gray-800 font-semibold">
            <span>Itinerary</span>
            <ul className="ml-4 mt-2 space-y-2">
              {days.map((day) => (
                <li
                  key={day.label}
                  className="cursor-pointer hover:text-blue-500 transition-colors"
                  onClick={() => toggleSection(day.label)}
                >
                  {day.label}
                </li>
              ))}
            </ul>
          </li>
          <li className="text-gray-800 font-semibold">Booking / Reservation</li>
        </ul>
      </div>

      <div className="w-3/4 p-6 overflow-y-visible">
        <h2 className="text-2xl font-bold mb-4">Itinerary for {trip.tripname}</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {days.map((day) => (
          <div key={day.label} className="mb-6 border rounded-lg p-4 shadow-sm">
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
                  {hasChanges[day.label] && (
                    <button 
                      onClick={() => saveChanges(day.label)}
                      disabled={savingDay === day.label}
                      className={`${
                        savingDay === day.label ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                      } text-white px-3 py-1 rounded-md flex items-center gap-1 text-sm transition-colors`}
                    >
                      <FontAwesomeIcon icon={faSave} />
                      {savingDay === day.label ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>
                
                {(editedItinerary[day.label] || [""]).map((place, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="text-gray-400 text-lg min-w-4"
                    />
                    <input
                      type="text"
                      value={place}
                      onChange={(e) => handlePlaceChange(day.label, index, e.target.value)}
                      className="flex-grow border rounded-md p-2"
                      placeholder="Add Place"
                      aria-describedby={`place-description-${day.label}-${index}`}
                    />
                    <div className="flex gap-1">
                      <button 
                        onClick={() => moveUp(day.label, index)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-blue-500 hover:bg-blue-100'}`}
                        title="Move Up"
                        aria-label="Move place up"
                      >
                        <FontAwesomeIcon icon={faArrowUp} />
                      </button>
                      <button 
                        onClick={() => moveDown(day.label, index)}
                        disabled={index === (editedItinerary[day.label] || []).length - 1}
                        className={`p-1 rounded ${index === (editedItinerary[day.label] || []).length - 1 ? 'text-gray-300' : 'text-blue-500 hover:bg-blue-100'}`}
                        title="Move Down"
                        aria-label="Move place down"
                      >
                        <FontAwesomeIcon icon={faArrowDown} />
                      </button>
                      <button 
                        onClick={() => removePlace(day.label, index)}
                        className="p-1 rounded text-red-500 hover:bg-red-100"
                        title="Remove"
                        aria-label="Remove place"
                      >
                        ✕
                      </button>
                    </div>
                    <span id={`place-description-${day.label}-${index}`} className="sr-only">
                      Enter place to visit for {day.label}
                    </span>
                  </div>
                ))}
                
                <button 
                  onClick={() => addPlace(day.label)}
                  className="mt-2 text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  + Add another place
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelEaseItineraryPage;
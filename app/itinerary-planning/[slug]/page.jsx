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
import { getTrips } from "@/app/actions";

const generateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  
  const days = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
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
  const [trips, setTrips] = useState([]);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState([]);
  const [itinerary, setItinerary] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({});
  const [editedItinerary, setEditedItinerary] = useState({});
  const [hasChanges, setHasChanges] = useState({});

  // Fetch trips data
  useEffect(() => {
    if (!slug) return;

    const fetchTrips = async () => {
      try {
        setLoading(true);
        const fetchedTrips = await getTrips();
        console.log(fetchedTrips);

        if (fetchedTrips && fetchedTrips.length > 0) {
          setTrips(fetchedTrips);
          const selectedTrip = fetchedTrips.find((trip) => trip.tripid === slug);
          if (selectedTrip) {
            setTrip(selectedTrip);
            // Generate days when trip is available
            const generatedDays = generateDays(selectedTrip.tripstartdate, selectedTrip.tripenddate);
            setDays(generatedDays);
          }
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [slug]);

  // Initialize itinerary from localStorage
  useEffect(() => {
    if (days.length === 0) return;
    
    const initializeItinerary = () => {
      const initialItinerary = Object.fromEntries(
        days.map((day) => [
          day.label,
          JSON.parse(localStorage.getItem(`itinerary_${day.label}`)) || [""],
        ])
      );
      
      return initialItinerary;
    };

    const initialItinerary = initializeItinerary();
    setItinerary(initialItinerary);
    setEditedItinerary(JSON.parse(JSON.stringify(initialItinerary)));
  }, [days]);

  // Function to handle input field changes
  const handlePlaceChange = (day, index, value) => {
    setEditedItinerary((prev) => {
      const dayPlaces = [...prev[day]];
      dayPlaces[index] = value;
      
      // Update has changes status
      const originalValue = itinerary[day][index];
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
      const dayPlaces = [...prev[day], ""];
      
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
      const dayPlaces = [...prev[day]];
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
    if (index === 0 || dayPlaces[index]==null) return;
    
    setEditedItinerary((prev) => {
      const dayPlaces = [...prev[day]];
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
      const dayPlaces = [...prev[day]];
      if (index === dayPlaces.length - 1) return prev;
      
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

  // Function to save changes to localStorage
  const saveChanges = (day) => {
    const updatedPlaces = editedItinerary[day];
    localStorage.setItem(`itinerary_${day}`, JSON.stringify(updatedPlaces));
    
    setItinerary(prev => ({
      ...prev,
      [day]: [...updatedPlaces]
    }));
    
    setHasChanges(prev => ({
      ...prev,
      [day]: false
    }));
    
    // Show a success message (optional)
    alert(`Saved changes for ${day}`);
  };

  const toggleSection = (dayLabel) => {
    setCollapsedSections((prevState) => ({
      ...prevState,
      [dayLabel]: !prevState[dayLabel],
    }));
  };

  // Render loading state
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Render error state if trip not found
  if (!trip) {
    return <div className="flex h-screen items-center justify-center">Trip not found!</div>;
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
                  className="cursor-pointer"
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

      <div className="w-3/4 p-6">
        <h2 className="text-2xl font-bold mb-4">Itinerary</h2>
        {days.map((day) => (
          <div key={day.label} className="mb-6 border rounded-lg p-4 shadow-sm">
            <h3
              className="font-bold text-lg flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection(day.label)}
            >
              {`${day.label} – ${day.date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}`}
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
                      className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1 text-sm"
                    >
                      <FontAwesomeIcon icon={faSave} />
                      Save Changes
                    </button>
                  )}
                </div>
                
                {editedItinerary[day.label]?.map((place, index) => (
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
                      >
                        <FontAwesomeIcon icon={faArrowUp} />
                      </button>
                      <button 
                        onClick={() => moveDown(day.label, index)}
                        disabled={index === editedItinerary[day.label].length - 1}
                        className={`p-1 rounded ${index === editedItinerary[day.label].length - 1 ? 'text-gray-300' : 'text-blue-500 hover:bg-blue-100'}`}
                        title="Move Down"
                      >
                        <FontAwesomeIcon icon={faArrowDown} />
                      </button>
                      <button 
                        onClick={() => removePlace(day.label, index)}
                        className="p-1 rounded text-red-500 hover:bg-red-100"
                        title="Remove"
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
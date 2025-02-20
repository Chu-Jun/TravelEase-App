"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import DynamicInputField from "@/components/ui/dynamic-input";
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
      return Object.fromEntries(
        days.map((day) => [
          day.label,
          JSON.parse(localStorage.getItem(`itinerary_${day.label}`)) || [""],
        ])
      );
    };

    setItinerary(initializeItinerary());
  }, [days]);

  // Store itinerary to localStorage
  useEffect(() => {
    Object.entries(itinerary).forEach(([dayLabel, places]) => {
      localStorage.setItem(`itinerary_${dayLabel}`, JSON.stringify(places));
    });
  }, [itinerary]);

  const handleDayChange = (day, updatedPlaces) => {
    setItinerary((prevItinerary) => ({
      ...prevItinerary,
      [day]: updatedPlaces,
    }));
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
          <div key={day.label} className="mb-6">
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
              <div className="mt-2 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-gray-400 text-lg"
                />
                <DynamicInputField
                  label=""
                  placeholder="Add Place"
                  onChange={(places) => handleDayChange(day.label, places)}
                  initialData={itinerary[day.label]}
                  aria-describedby="place-description"
                />
                <span id="place-description" className="sr-only">Enter places to visit</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelEaseItineraryPage;
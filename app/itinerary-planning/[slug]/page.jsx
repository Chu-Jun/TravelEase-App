"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import DynamicInputField from "@/components/ui/dynamic-input";
import { useParams } from "next/navigation";
import { trip_list } from "@/data/trip_list";

const generateDays = (startDate, endDate) => {
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
  const trip = trip_list.find((trip) => trip.slug === slug);

  if (!trip) {
    return <div>Trip not found!</div>;
  }

  const days = generateDays(trip.startDate, trip.endDate);

  const initializeItinerary = () =>
    Object.fromEntries(
      days.map((day) => [
        day.label,
        JSON.parse(localStorage.getItem(`itinerary_${day.label}`)) || [""],
      ])
    );

  const [itinerary, setItinerary] = useState(initializeItinerary);

  const [collapsedSections, setCollapsedSections] = useState(
    Object.fromEntries(days.map((day) => [day.label, false]))
  );

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
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelEaseItineraryPage;

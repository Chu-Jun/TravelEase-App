"use client";
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useRouter } from "next/navigation";
import { trip_list } from "@/data/trip_list";
import PlannedTripCard from "@/components/PlannedTripCard";

const ItineraryPlanningPage = () => {
  const [selectedTrip, setSelectedTrip] = useState(trip_list[0]);
  const router = useRouter(); // For navigation

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end - start;
    const days = timeDiff / (1000 * 60 * 60 * 24);
    return `${days + 1} Days`; // Including start date
  };

  const handleSeeDetails = () => {
    // Navigate to the slug page for the selected trip
    router.push(`/itinerary-planning/${selectedTrip.slug}`);
  };

  return (
    <div className="flex mt-16">
      {/* Left section for trip list */}
      <div className="w-1/4 p-4 space-y-4 bg-slate-300">
        <h2 className="text-3xl font-bold">My Trip</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6">+ New Trip</button>
        <div className="space-y-4">
          {trip_list.map((trip) => (
            <div key={trip.id} onClick={() => setSelectedTrip(trip)}>
              <PlannedTripCard
                imageSrc={trip.imageSrc}
                tripTitle={trip.tripTitle}
                touristNum={trip.touristNum}
                duration={calculateDuration(trip.startDate, trip.endDate)}
                tag={trip.tag}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right section for overview */}
      <div className="w-3/4 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Overview</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            onClick={handleSeeDetails}
          >
            See Details
          </button>
        </div>
        <div>
          <img
            src={selectedTrip.imageSrc}
            alt={selectedTrip.tripTitle}
            className="rounded-lg w-full h-64 object-cover"
          />
          <h3 className="text-lg font-bold mt-4">{selectedTrip.tripTitle}</h3>
          <p className="text-gray-600">{selectedTrip.tag}</p>
          <h4 className="mt-4 font-semibold">Duration</h4>
          <Calendar
            value={[
              new Date(selectedTrip.startDate),
              new Date(selectedTrip.endDate),
            ]}
            selectRange={true} // Enables range selection
          />
        </div>
      </div>
    </div>
  );
};

export default ItineraryPlanningPage;

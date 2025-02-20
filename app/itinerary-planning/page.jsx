"use client";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useRouter } from "next/navigation";
import PlannedTripCard from "@/components/PlannedTripCard";
import TripCreationDialog from "@/components/TripCreationDialog";
import { getTrips } from "@/app/actions";

const ItineraryPlanningPage = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // For navigation

  useEffect(() => {
    // Fetch trip data on component mount
    const fetchTrips = async () => {
      try {
        setIsLoading(true);
        const fetchedTrips = await getTrips();
        console.log(fetchedTrips);
        if (fetchedTrips && fetchedTrips.length > 0) {
          setTrips(fetchedTrips);
          setSelectedTrip(fetchedTrips[0]); // Set the first trip as selected
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrips();
  }, []);
  
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "No dates specified";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log("Start date:", start);
    console.log("End date:", end);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("Invalid date format:", startDate, endDate);
      return "Invalid dates";
    }
    
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return `${days} Days`;
  };

  const handleSeeDetails = () => {
    // Navigate to the slug page for the selected trip
    if (selectedTrip && selectedTrip.tripid) {
      router.push(`/itinerary-planning/${selectedTrip.tripid}`);
    } else {
      console.error("Selected trip or slug is undefined");
    }
  };

  if (isLoading) {
    return <div className="flex mt-16 justify-center items-center h-screen">Loading trips...</div>;
  }

  if (trips.length === 0) {
    return (
      <div className="flex mt-16 flex-col items-center justify-center h-screen">
        <p className="mb-4">No trips found. Create your first trip!</p>
        <TripCreationDialog />
      </div>
    );
  }
  else{
    console.log("fetched " + trips[0]);
  }

  return (
    <div className="flex mt-16">
      {/* Left section for trip list */}
      <div className="w-1/4 p-4 space-y-4 bg-slate-300">
        <h2 className="text-3xl font-bold">My Trip</h2>
        <TripCreationDialog/>
        <div className="space-y-4">
          {trips.map((trip) => (
            <div 
              key={trip.tripid} 
              onClick={() => setSelectedTrip(trip)}
              className={`cursor-pointer transition-all ${
                selectedTrip && trip.tripid === selectedTrip.tripid 
                  ? "opacity-100 scale-105" 
                  : "opacity-90 hover:opacity-100"
              }`}
            >
              <PlannedTripCard
                imageSrc={trip.imageSrc}
                tripTitle={trip.tripname}
                touristNum={trip.touristnum}
                duration={calculateDuration(trip.tripstartdate, trip.tripenddate)}
                tag={trip.tag}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right section for overview */}
      {selectedTrip && (
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
              src={selectedTrip.imageSrc || "/placeholder-trip-image.jpg"}
              alt={selectedTrip.tripname}
              className="rounded-lg w-full h-64 object-cover mt-4"
            />
            <h3 className="text-lg font-bold mt-4">{selectedTrip.tripname}</h3>
            <p className="text-gray-600">{selectedTrip.tag}</p>
            <h4 className="mt-4 font-semibold">Duration</h4>
            <p className="mb-2">{calculateDuration(selectedTrip.tripstartdate, selectedTrip.tripenddate)}</p>
            <Calendar 
              value={[
                selectedTrip.tripstartdate ? new Date(selectedTrip.tripstartdate) : null,
                selectedTrip.tripenddate ? new Date(selectedTrip.tripenddate) : null
              ]} 
              selectRange={true}
              className="border rounded-md p-2"
              tileDisabled={() => false}
              view="month"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryPlanningPage;
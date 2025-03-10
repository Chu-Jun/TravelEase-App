"use client";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useRouter } from "next/navigation";
import PlannedTripCard from "@/components/PlannedTripCard";
import TripCreationDialog from "@/components/TripCreationDialog";
import { getTrips, getTripDetails, getItinerary } from "@/app/actions";

const ItineraryPlanningPage = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [itineraryData, setItineraryData] = useState({ places: {}, markers: {} });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!selectedTrip) return;
      
      try {
        console.log("selected trip id", selectedTrip.tripid);
        const details = await getTripDetails(selectedTrip.tripid);
        setTripDetails(details);
        
        const itinerary = await getItinerary(selectedTrip.tripid);
        setItineraryData(itinerary);
      } catch (error) {
        console.error("Error fetching trip details:", error);
      }
    };
    
    fetchTripDetails();
    console.log("trip details", tripDetails);
    console.log("itinerary details", itineraryData);
  }, [selectedTrip]);
  
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "No dates specified";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("Invalid date format:", startDate, endDate);
      return "Invalid dates";
    }
    
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Need to also add in the start date
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
  
  const getCompletionStatus = () => {
    if (!tripDetails) return { completedItems: 0, totalItems: 3 };
    
    const hasAccommodation = tripDetails.accommodations && tripDetails.accommodations.length > 0;
    const hasActivities = tripDetails.activities && tripDetails.activities.length > 0;
    const hasFlights = tripDetails.flights && tripDetails.flights.length > 0;
    
    let completedItems = 0;
    let totalItems = 3;
    
    if (hasAccommodation) completedItems++;
    if (hasActivities) completedItems++;
    if (hasFlights) completedItems++;
    
    return { completedItems, totalItems };
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

    // Get days from itinerary data for preview
    const itineraryDays = Object.keys(itineraryData.places || {}).sort();

    return (
      <div className="flex mt-16">
        {/* Left section for trip list */}
        <div className="w-1/4 p-4 space-y-4 bg-white">
          <h2 className="text-3xl font-bold">My Trip</h2>
          <TripCreationDialog />
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
                  tripTitle={trip.tripname}
                  touristNum={trip.touristnum}
                  duration={calculateDuration(trip.tripstartdate, trip.tripenddate)}
                  tag={trip.tag}
                  trip={trip}
                />
              </div>
            ))}
          </div>
        </div>
  
        {/* Right section for overview */}
        {selectedTrip && (
          <div className="w-3/4 p-4 bg-background">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Overview of {selectedTrip.tripname} Trip</h2>
            </div>
  
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
  
              {/* Itinerary preview */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold">Itinerary Preview</h3>
                    <button 
                      className="text-primary text-sm hover:underline"
                      onClick={handleSeeDetails}
                    >
                      View Full Itinerary →
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {itineraryDays.slice(0, 3).map((dayKey) => {
                      const places = itineraryData.places[dayKey] || [];
                      const dayNumber = parseInt(dayKey.replace('Day ', ''));
                      
                      return (
                        <div 
                          key={dayKey} 
                          className={`border-l-2 ${places.length > 0 ? 'border-primary' : 'border-gray-300'} pl-3 py-1`}
                        >
                          <p className="font-medium">{dayKey}</p>
                          <p className="text-sm text-gray-600">
                            {places.length > 0 
                              ? `${places.length} ${places.length === 1 ? 'destination' : 'destinations'} planned` 
                              : 'No destinations yet'}
                          </p>
                          {places.length > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              {places.slice(0, 2).map((place, idx) => (
                                <div key={idx}>{place.name}</div>
                              ))}
                              {places.length > 2 && (
                                <div>+{places.length - 2} more...</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {itineraryDays.length === 0 && (
                      <div className="text-gray-500 text-center py-4">
                        No itinerary data available yet. Start planning your trip!
                      </div>
                    )}
                  </div>
                  
                  <button
                    className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-lg border border-blue-200"
                    onClick={handleSeeDetails}
                  >
                    Plan Your Itinerary
                  </button>
                </div>
                
                {/* Trip planning progress */}
                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold mb-3">Trip Planning Progress</h3>
                  <div className="space-y-3">
                    {/* Planning progress bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Planning Status</span>
                        <span>{getCompletionStatus().completedItems}/{getCompletionStatus().totalItems} Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full" 
                          style={{ 
                            width: `${(getCompletionStatus().completedItems / getCompletionStatus().totalItems) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Planning checklist */}
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 flex items-center justify-center rounded-full mr-2 ${
                          tripDetails?.accommodations?.length > 0 ? "bg-green-500 text-white" : "bg-gray-200"
                        }`}>
                          {tripDetails?.accommodations?.length > 0 && "✓"}
                        </div>
                        <span>Accommodations</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-5 h-5 flex items-center justify-center rounded-full mr-2 ${
                          tripDetails?.activities?.length > 0 ? "bg-green-500 text-white" : "bg-gray-200"
                        }`}>
                          {tripDetails?.activities?.length > 0 && "✓"}
                        </div>
                        <span>Activities</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-5 h-5 flex items-center justify-center rounded-full mr-2 ${
                          tripDetails?.flights?.length > 0 ? "bg-green-500 text-white" : "bg-gray-200"
                        }`}>
                          {tripDetails?.flights?.length > 0 && "✓"}
                        </div>
                        <span>Transportation</span>
                      </div>
                    </div>
                  </div>
                </div>
                

              </div>
              
              {/* Right column - Calendar and itinerary preview */}
              <div className="col-span-1">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold mb-2">Trip Dates</h3>
                  <Calendar 
                    value={[
                      selectedTrip.tripstartdate ? new Date(selectedTrip.tripstartdate) : null,
                      selectedTrip.tripenddate ? new Date(selectedTrip.tripenddate) : null
                    ]} 
                    selectRange={true}
                    className="border rounded-md p-2 w-full"
                    tileDisabled={() => false}
                    view="month"
                  />
                </div>

                {/* Trip budget snapshot - populated with real data */}
                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold mb-3">Budget Snapshot</h3>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="text-xl font-bold">
                        {tripDetails?.budget ? `RM ${tripDetails.budget.toFixed(2)}` : "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expenses</p>
                      <p className="text-xl font-bold">
                        {tripDetails?.expenses ? `RM ${tripDetails.expenses.toFixed(2)}` : "No record"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default ItineraryPlanningPage;
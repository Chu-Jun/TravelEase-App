"use client";
import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import { Menu, X } from "lucide-react";
import PlannedTripCard from "@/components/PlannedTripCard";
import TripCreationDialog from "@/components/TripCreationDialog";
import { getTrips, getActivityBookings, getAccommodationBookings, getFlightBookings } from "@/app/actions";
import BookingsCalendar from "@/components/BookingsCalendar";
import BookingCreationDialog from "@/components/BookingCreationDialog";

import ActivityCard from "@/components/ActivityCard";
import AccommodationCard from "@/components/AccommodationCard";
import FlightCard from "@/components/FlightCard";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

import { useParams } from "next/navigation";

interface Trip {
  tripid: string;
  tripname: string;
  budget: string;
  tripstartdate: string;
  tripenddate: string;
  touristnum: string;
  tag: string;
  imageSrc: string;
}

interface Location {
  id: string;
  locationname: string;
}

interface ActivityBooking {
  activitybookingid: string;
  activitydate: string;
  starttime: string;
  endtime: string;
  activityname: string;
  location: Location;
  tripid: string;
}

interface AccommodationBooking {
  accommodationname: string;
  checkindate: string;
  checkintime: string;
  checkoutdate: string;
  checkouttime: string;
  location: Location;
  tripid: string;
}

interface FlightBooking {
  flightbookingid: string;
  flightcode: string;
  flightdate: string;
  airline: string;
  departairport: string;
  arriveairport: string;
  departtime: string;
  arrivaltime: string;
  tripid: string;
}

const BookingManagementPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Separate states for each booking type
  const [activityBookings, setActivityBookings] = useState<ActivityBooking[]>([]);
  const [accommodationBookings, setAccommodationBookings] = useState<AccommodationBooking[]>([]);
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  
  const [activeTab, setActiveTab] = useState<string>("all");

  const params = useParams();
  const tripidFromUrl = params?.tripid as string | undefined;

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setIsLoading(true);
        const fetchedTrips = await getTrips();
        if (fetchedTrips && fetchedTrips.length > 0) {
          setTrips(fetchedTrips);
          const matchedTrip = fetchedTrips.find((trip) => trip.tripid === tripidFromUrl);
          setSelectedTrip(matchedTrip || fetchedTrips[0]);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTrips();
  }, [tripidFromUrl]);
  

  useEffect(() => {
    // Fetch bookings for the selected trip from separate tables
    const fetchBookings = async () => {
      if (!selectedTrip) return;
      
      try {
        // Fetch data from each table in parallel
        const [activities, accommodations, flights] = await Promise.all([
          getActivityBookings(selectedTrip.tripid),
          getAccommodationBookings(selectedTrip.tripid),
          getFlightBookings(selectedTrip.tripid)
        ]);
        
        console.log("trip id", selectedTrip.tripid);
        console.log("Activities: ", activities);
        console.log("Flights: ", flights);
        console.log("Accomm: ", accommodations);

        setActivityBookings(activities);
        setAccommodationBookings(accommodations);
        setFlightBookings(flights);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    
    fetchBookings();
  }, [selectedTrip]);
  
  const calculateDuration = (startDate: string | number | Date, endDate: string | number | Date) => {
    if (!startDate || !endDate) return "No dates specified";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("Invalid date format:", startDate, endDate);
      return "Invalid dates";
    }
    
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Need to also add in the start date
    return `${days} Days`;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading) {
    return <div className="flex mt-16 justify-center items-center h-screen bg-background">Loading trips...</div>;
  }

  if (trips.length === 0) {
    return (
      <div className="flex mt-16 flex-col items-center justify-center h-screen bg-background">
        <p className="mb-4">No trips found. Create your first trip!</p>
        <TripCreationDialog />
      </div>
    );
  }

  return (
    <div className="flex mt-16 bg-background">
      {/* Left section for trip list */}
        {/* Sidebar for trip list - becomes an overlay on mobile */}
        <div 
          className={`${
            sidebarOpen ? "fixed inset-0 z-50 bg-white overflow-y-scroll" : "hidden"
          } md:relative md:block md:w-1/4 md:overflow-y-auto lg:overflow-y-visible lg:min-h-max p-4 space-y-4 bg-white`}
          style={{ 
            transition: "all 0.3s ease-in-out" 
          }}
        >
          {sidebarOpen && (
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h2 className="text-2xl font-bold">My Trips</h2>
              <button onClick={toggleSidebar} className="p-2">
                <X size={24} />
              </button>
            </div>
          )}
          
          <h2 className="text-3xl font-bold hidden md:block">My Trip</h2>
          <div className="space-y-4">
            {trips.map((trip) => (
              <div 
                key={trip.tripid} 
                onClick={() => {
                  setSelectedTrip(trip);
                  if (sidebarOpen) setSidebarOpen(false);
                }}
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
                  active={trip.tripid === selectedTrip?.tripid}
                />
              </div>
            ))}
          </div>
        </div>

      {/* Right section for bookings overview */}
      {selectedTrip && (
        <div className="w-full md:w-3/4 p-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center md:mb-6 md:w-full mb-4 w-[75%]">
            <h2 className="text-3xl font-bold">Bookings Made for {selectedTrip.tripname}</h2>
            <BookingCreationDialog tripData={selectedTrip}/>
          </div>
          
          <div className="w-full mb-4">
          {/* Dropdown for mobile */}
          <div className="md:hidden">
            <select
              className="w-full p-2 border rounded max-w-screen"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <option value="all">All Bookings</option>
              <option value="accommodation">Accommodations</option>
              <option value="flight">Flights</option>
              <option value="activity">Activities</option>
              <option value="calendar">View in Calendar</option>
            </select>
          </div>

          {/* Tabs for different booking types */}
          <Tabs className="md:w-full lg:w-full" defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="hidden md:block">
            <TabsList className="flex w-full mb-4 text-lg border-b border-gray-300">
              <TabsTrigger className="flex-1" value="all">All Bookings</TabsTrigger>
              <TabsTrigger className="flex-1" value="accommodation">Accommodations</TabsTrigger>
              <TabsTrigger className="flex-1" value="flight">Flights</TabsTrigger>
              <TabsTrigger className="flex-1" value="activity">Activities</TabsTrigger>
              <TabsTrigger className="flex-1" value="calendar">View in Calendar</TabsTrigger>
            </TabsList>
          </div>
            
            <TabsContent value="all" className="space-y-4">
              {activityBookings.length === 0 && accommodationBookings.length === 0 && flightBookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    No bookings found. Create your first booking!
                  </CardContent>
                </Card>
              ) : (
                <>
                  {accommodationBookings.map((booking, index) => (
                    <AccommodationCard key={`accommodation-${index}`} booking={booking} />
                  ))}
                  {flightBookings.map((booking, index) => (
                    <FlightCard key={`flight-${index}`} booking={booking} />
                  ))}
                  {activityBookings.map((booking, index) => (
                    <ActivityCard key={`activity-${index}`} booking={booking} />
                  ))}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="accommodation" className="space-y-4">
              {accommodationBookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    No accommodation bookings found.
                  </CardContent>
                </Card>
              ) : (
                accommodationBookings.map((booking, index) => (
                  <AccommodationCard key={index} booking={booking} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="flight" className="space-y-4">
              {flightBookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    No flight bookings found.
                  </CardContent>
                </Card>
              ) : (
                flightBookings.map((booking, index) => (
                  <FlightCard key={index} booking={booking} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4">
              {activityBookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    No activity bookings found.
                  </CardContent>
                </Card>
              ) : (
                activityBookings.map((booking, index) => (
                  <ActivityCard key={index} booking={booking} />
                ))
              )}
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              {activityBookings.length === 0 && flightBookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    No activity and flight bookings found.
                  </CardContent>
                </Card>
              ) : (
                <BookingsCalendar tripStartDate={selectedTrip.tripstartdate} activityBooking={activityBookings} flightBooking={flightBookings} accommodationBooking={accommodationBookings}/>
              )}
            </TabsContent>
          </Tabs>
          </div>
        </div>
      )}
            {/* Fixed action button for mobile - shows the trips when main view is showing */}
            <div className="md:hidden fixed bottom-4 right-4 z-50">
            <button 
              onClick={toggleSidebar}
              className="bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
            >
              <Menu size={24} />
            </button>
          </div>
    </div>
  );
};

export default BookingManagementPage;
"use client";
import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import { useRouter } from "next/navigation";
import PlannedTripCard from "@/components/PlannedTripCard";
import TripCreationDialog from "@/components/TripCreationDialog";
import { getTrips, getActivityBookings, getAccommodationBookings, getFlightBookings } from "@/app/actions";
import BookingsCalendar from "@/components/BookingsCalendar";
import BookingCreationDialog from "@/components/BookingCreationDialog";

import ActivityCard from "@/components/ActivityCard";
import AccommodationCard from "@/components/AccommodationCard";
import FlightCard from "@/components/FlightCard";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

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
  checkoutdate: string;
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
  tripid: string;
}

const BookingManagementPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Separate states for each booking type
  const [activityBookings, setActivityBookings] = useState<ActivityBooking[]>([]);
  const [accommodationBookings, setAccommodationBookings] = useState<AccommodationBooking[]>([]);
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  
  const [activeTab, setActiveTab] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    // Fetch trip data on component mount
    const fetchTrips = async () => {
      try {
        setIsLoading(true);
        const fetchedTrips = await getTrips();
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

  // Get all bookings for the calendar view
  const allBookings = {
    activities: activityBookings,
    accommodations: accommodationBookings,
    flights: flightBookings
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (e) {
      return dateString;
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

  return (
    <div className="flex mt-16">
      {/* Left section for trip list */}
      <div className="w-1/4 p-4 space-y-4 bg-slate-300 min-h-screen">
        <h2 className="text-3xl font-bold">My Trip</h2>
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
                trip={trip}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right section for bookings overview */}
      {selectedTrip && (
        <div className="w-3/4 p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Bookings Made for {selectedTrip.tripname}</h2>
            <BookingCreationDialog tripData={selectedTrip}/>
          </div>
          
          {/* Calendar view */}
          <div className="mb-8">
            {/* <BookingsCalendar bookings={allBookings} /> */}
          </div>
          
          {/* Tabs for different booking types */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="accommodation">Accommodations</TabsTrigger>
              <TabsTrigger value="flight">Flights</TabsTrigger>
              <TabsTrigger value="activity">Activities</TabsTrigger>
              <TabsTrigger value="calendar">View in Calendar</TabsTrigger>
            </TabsList>
            
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
                    No activity bookings found.
                  </CardContent>
                </Card>
              ) : (
                <BookingsCalendar tripStartDate={selectedTrip.tripstartdate} activityBooking={activityBookings} flightBooking={flightBookings} accommodationBooking={accommodationBookings}/>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default BookingManagementPage;
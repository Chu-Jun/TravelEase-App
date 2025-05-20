"use client"
import { useState, useEffect } from 'react';
import { getTrips } from "@/app/actions";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UpcomingTripDialog() {
  const [open, setOpen] = useState(false);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch upcoming trips data
  useEffect(() => {
    const fetchUpcomingTrips = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get trips from your API
        const fetchedTrips = await getTrips();
        
        if (!fetchedTrips || fetchedTrips.length === 0) {
          setUpcomingTrips([]);
          setIsLoading(false);
          return;
        }
        
        // Filter trips that are coming up in 3 days or less
        const threeDayTrips = fetchedTrips
          .filter(trip => {
            // Ensure the date is properly converted to a Date object
            const startDate = new Date(trip.tripstartdate);
            
            // Calculate difference in days
            const diffTime = startDate.getTime() - new Date().getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            console.log(`Trip: ${trip.tripname}, Days until trip: ${diffDays}`);
            
            // Show dialog for trips that are 3 days away (or 2 or 1)
            // We want trips that are approaching, not past or too far in the future
            return diffDays >= 0 && diffDays <= 3;
          })
          .sort((tripA, tripB) => {
            // Sort by proximity to current date (ascending order)
            const startDateA = new Date(tripA.tripstartdate).getTime();
            const startDateB = new Date(tripB.tripstartdate).getTime();
            
            return startDateA - startDateB; // Earlier dates first
          });
        
        console.log("Upcoming trips (3 days or less):", threeDayTrips);
        setUpcomingTrips(threeDayTrips);
        
        // Automatically open the dialog if we have upcoming trips
        if (threeDayTrips.length > 0) {
          setOpen(true);
        }
        
      } catch (err) {
        console.error("Error fetching trips:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUpcomingTrips();
  }, []);
  
  // If loading or there are no upcoming trips, don't render the dialog
  if (isLoading || upcomingTrips.length === 0) {
    // If there was an error fetching trips, log it but don't show the dialog
    if (error) {
      console.error("Error in UpcomingTripDialog:", error);
    }
    return null;
  }
  
  // Get the first upcoming trip for the dialog
  const trip = upcomingTrips[0];
  
  // Calculate exact days left
  const startDate = new Date(trip.tripstartdate);
  const diffTime = startDate.getTime() - new Date().getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Format trip message based on days left
  let tripMessage = "";
  
  if (daysLeft === 0) {
    tripMessage = `Your trip to ✨ ${trip.tripname} ✨ is TODAY!`;
  } else if (daysLeft === 1) { 
    tripMessage = `Your trip to ✨ ${trip.tripname} ✨ is TOMORROW!`;
  } else {
    tripMessage = `Your trip to ✨ ${trip.tripname} ✨ is in ${daysLeft} days!`;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-blue-50 border-blue-200 w-4/5 rounded-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-title font-bold">Trip Coming Soon!</DialogTitle>
          <DialogDescription className="text-lg font-medium text-title">
            {tripMessage}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-row justify-center">
          <Link href={trip.tripid ? `/itinerary-planning/${trip.tripid}` : "/itinerary-planning"}>
            <Button 
              className="bg-blue-800 hover:bg-blue-900 text-white"
              onClick={() => setOpen(false)}
            >
              View Itinerary
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faCircle,
    faLocationDot,
    faClock,
    faArrowRightLong,
    faCar,
    faBus,
    faTram,
    faWalking
  } from "@fortawesome/free-solid-svg-icons";
  import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Types
type TravelFromPrevious = {
  mode: string;
  duration: string;
  distance_km: number;
};

type ScheduleItem = {
  location: string;
  arrival_time: string;
  departure_time: string;
  travel_from_previous?: TravelFromPrevious;
};

type Summary = {
  total_itinerary_time: string;
  total_travel_time: string;
  total_distance_km: number;
  total_locations: number;
};

type ScheduleDisplayProps = {
  schedule: ScheduleItem[];
  summary?: Summary;
};

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ schedule, summary }) => {

    const [open, setOpen] = useState(false);
  if (!schedule || schedule.length === 0) {
    return null;
  }

  // Helper to format time
  const formatTime = (timeString: string): string => {
    if (!timeString) return "";
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return timeString;
  };

    // Helper to get icon for transportation mode
    const getTransportIcon = (mode: string): IconProp => {
        if (!mode) return faCar;
        if (mode.includes("Bus")) return faBus;
        if (mode.includes("Tram")) return faTram;
        if (mode.includes("Walk")) return faWalking;
        return faCar; // Default
    };

    // Helper for mode color
    const getModeColor = (mode: any) => {
        if (!mode) return "text-gray-500";
        if (mode.includes("Bus")) return "text-blue-600";
        if (mode.includes("Tram")) return "text-green-600";
        if (mode.includes("Walk")) return "text-orange-500";
        return "text-gray-500";
    };

    const generateGoogleMapsURL = (locations: string[]): string => {
      if (!locations || locations.length < 2) return "";
    
      const origin = encodeURIComponent(locations[0]);
      const destination = encodeURIComponent(locations[locations.length - 1]);
      const waypoints = locations.slice(1, -1).map(loc => encodeURIComponent(loc)).join('|');
    
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
    };
    

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button
                className="bg-secondary text-white mt-2 md:w-1/3 md:self-center min-w-fit animate-pulse"
            >
                View Optimized Schedule
            </Button>
        </DialogTrigger>
        <DialogContent className="text-black w-4/5 rounded-lg max-h-[80%] overflow-y-scroll">
            <DialogHeader>
                <DialogTitle>
                <h4 className="font-medium mb-3 flex items-center">
                    <FontAwesomeIcon icon={faClock} className="mr-2 text-blue-600" />
                    Optimized Schedule
                </h4>
                </DialogTitle>
            </DialogHeader>
            <div className="border rounded-lg p-3 bg-white">
            {/* Summary stats */}
            {summary && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                    <span className="font-medium">Total Time:</span> {summary.total_itinerary_time}
                    </div>
                    <div>
                    <span className="font-medium">Travel Time:</span> {summary.total_travel_time}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                    <span className="font-medium">Distance:</span> {summary.total_distance_km} km
                    </div>
                    <div>
                    <span className="font-medium">Locations:</span> {summary.total_locations}
                    </div>
                </div>
                </div>
            )}

            {/* Schedule timeline */}
            <div className="mt-2">
                {schedule.map((item: any, index: any) => (
                <div key={index} className="relative">
                    {/* Location with times */}
                    <div className="flex flex-col md:flex-row md:items-start mb-1 gap-1 md:gap-0">
                        <div className="flex items-start md:items-center md:flex-1">
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faLocationDot} className="text-blue-600 text-lg" />
                            </div>
                            <div className="ml-2 font-medium whitespace-normal break-words">{item.location}</div>
                        </div>

                        <div className="md:ml-auto flex-shrink-0 flex items-center text-sm text-gray-600 whitespace-nowrap">
                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                            <span>Arrive: {item.arrival_time}</span>
                            <FontAwesomeIcon icon={faArrowRightLong} className="mx-2 text-gray-400" />
                            <span>Depart: {item.departure_time}</span>
                        </div>
                    </div>
                    
                    {/* Transportation details for the next item */}
                    {index < schedule.length - 1 && schedule[index + 1].travel_from_previous && (
                    (() => {
                        const { mode, duration, distance_km } = schedule[index + 1].travel_from_previous!;
                        return (
                        <div className="ml-3 pl-3 border-l-2 border-dashed border-gray-300 py-3">
                            <div className="flex items-center text-sm">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                <FontAwesomeIcon 
                                icon={getTransportIcon(mode)} 
                                className={getModeColor(mode)}
                                />
                            </div>
                            <div className="ml-3">
                                <div className="font-medium">{mode}</div>
                                <div className="text-gray-600">{duration} · {distance_km} km</div>
                            </div>
                            </div>
                        </div>
                        );
                    })()
                    )}
                </div>
                ))}
            </div>
            </div>
            <Button
              className="bg-green-600 text-white mt-4 float-right"
              onClick={() => {
                const locations = schedule.map(item => item.location);
                const url = generateGoogleMapsURL(locations);
                if (url) window.open(url, '_blank');
              }}
            >
              Open in Google Maps
          </Button>
        </DialogContent>
    </Dialog>
  );
};

export default ScheduleDisplay;

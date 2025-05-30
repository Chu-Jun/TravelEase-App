import { useState } from "react"; 
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faClock } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TripEditDialog from "@/components/TripEditDialog";
import TripDeletionDialog from "@/components/TripDeletionDialog";

const PlannedTripCard = ({ tripTitle, touristNum, duration, tag, trip, active, startDate }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Check if startDate is before today
  const today = new Date();
  const tripStartDate = new Date(startDate);
  const isPastTrip = tripStartDate < today.setHours(0, 0, 0, 0); // ignore time portion

  // Determine card background color
  const cardBgColor = isPastTrip 
    ? "bg-gray-300" 
    : active 
      ? "bg-lightblue" 
      : "bg-greyblue";
  
    const labelBgColor = isPastTrip 
      ? "bg-gray-500" 
      : "bg-primary";

  return (
    <Card className={`shadow-md rounded-2xl p-4 flex flex-col items-start max-w-lg m-4 ${cardBgColor}`}>
      {/* Tag above trip title */}
      <span className={`text-white text-sm font-semibold px-2 py-1 rounded ${labelBgColor}`}>
        {tag}
      </span>

      {/* Title and Dropdown Trigger */}
      <div className="flex justify-between items-center w-full mt-2">
        <h3 className="text-xl font-semibold text-gray-800">{tripTitle}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="font-extrabold text-gray-800 hover:text-black cursor-pointer">...</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={(e) => {
              e.preventDefault();
              setEditDialogOpen(true);
            }}>
              Edit Trip
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => {
              e.preventDefault();
              setDeleteDialogOpen(true);
            }}>
              Delete Trip
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="flex justify-start items-center gap-6 mt-2 text-gray-700 text-sm">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-gray-500" />
          <span>{touristNum}</span>
        </div>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faClock} className="text-gray-500" />
          <span>{duration}</span>
        </div>
      </div>

      {/* Hidden Dialogs */}
      <div className="invisible absolute bottom-0 left-0">
        <TripEditDialog tripData={trip} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
        <TripDeletionDialog tripData={trip} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
      </div>
    </Card>
  );
};

export default PlannedTripCard;

import Image from "next/image";
import { useState } from "react"; // Add this
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faClock } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TripEditDialog from "@/components/TripEditDialog";
import TripDeletionDialog from "@/components/TripDeletionDialog";

const PlannedTripCard = ({ imageSrc, tripTitle, touristNum, duration, tag, trip }) => {
  // Add state to control dialog visibility
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <Card className="bg-[#F5EFFF] shadow-md rounded-2xl p-4 flex items-center max-w-lg">
      {/* Image on the left */}
      <div className="flex-shrink-0 relative">
        <Image
          src={imageSrc}
          alt={tripTitle}
          width={80}
          height={80}
          className="rounded-lg object-cover border border-gray-200"
          priority
        />
        <span className="absolute top-1 left-1 bg-[#D7BFFF] text-white text-sm font-semibold px-2 py-1 rounded">
          {tag}
        </span>
      </div>

      {/* Content on the right */}
      <div className="ml-4 flex-1">
        <h3 className="text-xl font-semibold text-gray-800">{tripTitle}</h3>
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
      </div>

      {/* Dropdown Menu with click handlers instead of Dialog components */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button className="ml-4 font-extrabold text-gray-800 hover:text-black">...</button>
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
      <div className="invisible absolute bottom-0 left-0">
        {/* Render the dialogs separately, controlled by state */}
        <TripEditDialog tripData={trip} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
        <TripDeletionDialog tripData={trip} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
      </div>
    </Card>
  );
};

export default PlannedTripCard;
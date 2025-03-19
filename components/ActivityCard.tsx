import React, { useState } from "react";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import BookingEditDialog from "@/components/BookingEditDialog";
  import BookingDeletionDialog from "@/components/BookingDeletionDialog";

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

const ActivityCard = ({ booking }: { booking: ActivityBooking }) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const formatDate = (dateString: string) => {
        try {
          return format(new Date(dateString), "dd MMM yyyy");
        } catch (e) {
          console.log(e);
          return dateString;
        }
      };

    return (
      <Card className="rounded-lg">
        <CardHeader className="rounded-lg bg-white pb-2 flex-row justify-between content-center">
          <CardTitle className="text-lg font-medium text-blue-600">
            Activity: {booking.activityname}
          </CardTitle>
          {/* Dropdown Menu with click handlers instead of Dialog components */}
        <DropdownMenu>
            <DropdownMenuTrigger>
            <span className="font-extrabold text-gray-800 hover:text-primary">...</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={(e) => {
                e.preventDefault();
                setEditDialogOpen(true);
            }}>
                Edit Activity
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => {
                e.preventDefault();
                setDeleteDialogOpen(true);
            }}>
                Delete Activity
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <div className="invisible absolute bottom-0 left-0">
            {/* Render the dialogs separately, controlled by state */}
            <BookingEditDialog bookingData={booking} open={editDialogOpen} onOpenChange={setEditDialogOpen} bookingType={"activity"}/>
            <BookingDeletionDialog bookingData={booking} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} bookingType={"activity"}/>
        </div>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p>{formatDate(booking.activitydate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p>{booking.location?.locationname || "Unknown location"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Start Time</p>
            <p>{booking.starttime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">End Time</p>
            <p>{booking.endtime}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  export default ActivityCard;
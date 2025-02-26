import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import BookingEditDialog from "@/components/BookingEditDialog";

interface Location {
    id: string;
    locationname: string;
  }

  interface AccommodationBooking {
    accommodationname: string;
    checkindate: string;
    checkoutdate: string;
    location: Location;
    tripid: string;
  }

  const AccommodationCard = ({ booking }: { booking: AccommodationBooking }) => {

    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const formatDate = (dateString: string) => {
        try {
          return format(new Date(dateString), "dd MMM yyyy");
        } catch (e) {
          return dateString;
        }
      };

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

    return (
      <Card>
        <CardHeader className="bg-green-50 pb-2 flex-row justify-between relative">
        <CardTitle className="text-lg font-medium text-green-600">
            Accommodation: {booking.accommodationname}
        </CardTitle>
        
        {/* Dropdown Menu with click handlers instead of Dialog components */}
        <DropdownMenu>
            <DropdownMenuTrigger>
            <span className="font-extrabold text-gray-800 hover:text-black">...</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={(e) => {
                e.preventDefault();
                setEditDialogOpen(true);
            }}>
                Edit Trip
            </DropdownMenuItem>
            {/* <DropdownMenuItem onSelect={(e) => {
                e.preventDefault();
                setDeleteDialogOpen(true);
            }}>
                Delete Trip
            </DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>

        <div className="invisible absolute bottom-0 left-0">
            {/* Render the dialogs separately, controlled by state */}
            <BookingEditDialog bookingData={booking} open={editDialogOpen} onOpenChange={setEditDialogOpen} bookingType={"accommodation"}/>
            {/* <TripDeletionDialog tripData={trip} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} /> */}
        </div>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-gray-500">Check-in Date</p>
            <p>{formatDate(booking.checkindate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Check-out Date</p>
            <p>{formatDate(booking.checkoutdate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p>{booking.location?.locationname || "Unknown location"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p>{calculateDuration(booking.checkindate, booking.checkoutdate)}</p>
          </div>
        </CardContent>
        
      </Card>
    );
  };

  export default AccommodationCard;
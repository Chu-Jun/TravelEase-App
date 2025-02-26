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

  const FlightCard = ({ booking }: { booking: FlightBooking }) => {

    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const formatDate = (dateString: string) => {
        try {
          return format(new Date(dateString), "dd MMM yyyy");
        } catch (e) {
          return dateString;
        }
      };

    return (
      <Card>
        <CardHeader className="bg-amber-50 pb-2 flex-row justify-between">
          <CardTitle className="text-lg font-medium text-amber-600">
            Flight: {booking.flightcode} - {booking.airline}
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
            <BookingEditDialog bookingData={booking} open={editDialogOpen} onOpenChange={setEditDialogOpen} bookingType={"flight"}/>
            {/* <TripDeletionDialog tripData={trip} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} /> */}
        </div>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p>{formatDate(booking.flightdate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Departure</p>
            <p>{booking.departairport} - {booking.departtime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Arrival</p>
            <p>{booking.arriveairport}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Airline</p>
            <p>{booking.airline}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  export default FlightCard;
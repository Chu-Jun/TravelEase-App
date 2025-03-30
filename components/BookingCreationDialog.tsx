"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as RadioGroup from '@radix-ui/react-radio-group';
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { createAccommodationBookingAction, createFlightBookingAction, createActivityBookingAction } from "@/app/actions";

const compareTimeStrings = (startTime: string, endTime: string): boolean => {
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return parseTime(endTime) > parseTime(startTime);
};

const formSchema = z.object({
  tripid: z.string(),
  flightDate: z.string().optional(),
  flightCode: z.string().optional(),
  airline: z.string().optional(),
  departAirport: z.string().optional(),
  arriveAirport: z.string().optional(),
  departTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  activityLocationName: z.string().optional(),
  activityName: z.string().optional(),
  activityDate: z.string().optional(),
  activityStartTime: z.string().optional(),
  activityEndTime: z.string().optional(),
  accommodationName: z.string().optional(),
  checkInDate: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutDate: z.string().optional(),
  checkOutTime: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate arrival time is later than departure time
  if (data.departTime && data.arrivalTime) {
    if (!compareTimeStrings(data.departTime, data.arrivalTime)) {
      ctx.addIssue({
        code: 'custom',
        path: ['arrivalTime'],
        message: 'Arrival time must be later than departure time'
      });
    }
  }

  // Validate activity end time is later than start time
  if (data.activityStartTime && data.activityEndTime) {
    if (!compareTimeStrings(data.activityStartTime, data.activityEndTime)) {
      ctx.addIssue({
        code: 'custom',
        path: ['activityEndTime'],
        message: 'Activity end time must be later than start time'
      });
    }
  }

  // Validate check-out date is later than check-in date
  if (data.checkInDate && data.checkOutDate) {
    const checkInDate = new Date(data.checkInDate);
    const checkOutDate = new Date(data.checkOutDate);
    
    if (checkOutDate <= checkInDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['checkOutDate'],
        message: 'Check-out date must be later than check-in date'
      });
    }
  }
});

export default function BookingCreationDialog({ tripData }: any) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bookingType, setBookingType] = useState<string | undefined>(undefined);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripid: tripData?.tripid || "",
    },
  });

  useEffect(() => {
    if (tripData && tripData.tripid) {
      form.setValue("tripid", tripData.tripid);
    }
  }, [tripData, form]);

  async function onSubmit(values: any) {
    let result;
    if (bookingType === "accommodation") {
      result = await createAccommodationBookingAction(values);
    } else if (bookingType === "flight") {
      result = await createFlightBookingAction(values);
    } else if (bookingType === "activity") {
      result = await createActivityBookingAction(values);
    } else {
        result = {status: "error", message: "Please select the booking type."}
    }

    if (result.status === "success") {
      setOpen(false);
      router.push("/booking-management");
      window.location.reload();
    } else {
      console.error("Error:", result.message);
    }

    toast({
      variant: result.status === "error" ? "destructive" : "default",
      title: result.status === "error" ? "Error" : "Success",
      description: result.message || "Something went wrong",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-secondary text-white mt-8 md:w-1/3 md:self-center min-w-fit">
          + Add Booking Record
        </Button>
      </DialogTrigger>
      <DialogContent className="text-black w-[90%] max-w-lg rounded-lg max-h-[70%] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle>
            <p className="text-title font-extrabold">Add Booking Record</p>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-6 max-w-full"
          >
            {/* Booking Type Selection */}
            <FormItem>
              <FormLabel>Select Booking Type</FormLabel>
              <FormControl>
              <RadioGroup.Root value={bookingType} onValueChange={setBookingType}>
                <div className="flex space-x-2">
                  <div className="bg-primary rounded-lg p-2 text-white">
                    <RadioGroup.Item value="accommodation" id="accommodation" />
                    <label htmlFor="accommodation">Accommodation</label>
                  </div>
                  <div className="bg-primary rounded-lg p-2 text-white">
                    <RadioGroup.Item value="flight" id="flight" />
                    <label htmlFor="flight">Flight</label>
                  </div>
                  <div className="bg-primary rounded-lg p-2 text-white">
                    <RadioGroup.Item value="activity" id="activity" />
                    <label htmlFor="activity">Activity</label>
                  </div>
                </div>
              </RadioGroup.Root>
              </FormControl>
              <FormMessage />
            </FormItem>

            {/* Common Hidden Field */}
            <FormField
              control={form.control}
              name="tripid"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditionally Render Flight Fields */}
            {bookingType === "flight" && (
              <>
                <FormField control={form.control} name="flightDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Date *</FormLabel>
                    <FormControl><Input type="date" placeholder="Select Date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="flightCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Code *</FormLabel>
                    <FormControl><Input placeholder="Enter Flight Code" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="airline" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Airline *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Airline" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="AirAsia">AirAsia</SelectItem>
                        <SelectItem value="MalaysiaAirline">Malaysia Airline</SelectItem>
                        <SelectItem value="Firefly">Firefly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="departAirport" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depart Airport *</FormLabel>
                    <FormControl><Input placeholder="Enter Depart Airport" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="departTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depart Time *</FormLabel>
                    <FormControl><Input placeholder="Select Depart Time" type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="arriveAirport" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrive Airport *</FormLabel>
                    <FormControl><Input placeholder="Enter Arrive Airport" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="arrivalTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival Time</FormLabel>
                    <FormControl><Input placeholder="Select Arrival Time" type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}

            {/* Conditionally Render Activity Fields */}
            {bookingType === "activity" && (
              <>
                <FormField control={form.control} name="activityName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Name *</FormLabel>
                    <FormControl><Input placeholder="Enter Activity Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityLocationName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl><Input placeholder="Enter Location Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Date *</FormLabel>
                    <FormControl><Input placeholder="Select Activity Date" type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityStartTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Start Time *</FormLabel>
                    <FormControl><Input placeholder="Select Activity Start Time" type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityEndTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity End Time *</FormLabel>
                    <FormControl><Input placeholder="Select Activity End Time" type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}

            {/* Conditionally Render Accommodation Fields */}
            {bookingType === "accommodation" && (
              <>
                <FormField control={form.control} name="accommodationName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Name *</FormLabel>
                    <FormControl><Input placeholder="Enter Hotel Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="checkInDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Date *</FormLabel>
                    <FormControl><Input placeholder="Select Check In Date" type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="checkInTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Time<span className="text-gray-500"> (Default value: 3.00 PM)</span></FormLabel>
                    <FormControl><Input placeholder="Select Check In Time" type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="checkOutDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Date *</FormLabel>
                    <FormControl><Input placeholder="Select Check Out Date" type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="checkOutTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Time<span className="text-gray-500"> (Default value: 12.00 PM)</span></FormLabel>
                    <FormControl><Input placeholder="Select Check Out Time" type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}

            <Button type="submit" className="bg-secondary text-white mt-4">Add Booking</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

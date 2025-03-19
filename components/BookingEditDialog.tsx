"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { editAccommodationBookingAction, editFlightBookingAction, editActivityBookingAction } from "@/app/actions";

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
});

export default function BookingEditDialog({ bookingData, bookingType, open, onOpenChange}: any) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripid: bookingData?.tripid || "",
      flightDate: bookingData?.flightdate || "",
      flightCode: bookingData?.flightcode || "",
      airline: bookingData?.airline || "",
      departAirport: bookingData?.departairport || "",
      arriveAirport: bookingData?.arriveairport || "",
      departTime: bookingData?.departtime || "",
      arrivalTime: bookingData?.arrivaltime || "",
      activityLocationName: bookingData.location?.locationname || "",
      activityName: bookingData?.activityname || "",
      activityDate: bookingData?.activitydate || "",
      activityStartTime: bookingData?.starttime || "",
      activityEndTime: bookingData?.endtime || "",
      accommodationName: bookingData?.accommodationname || "",
      checkInDate: bookingData?.checkindate || "",
      checkInTime: bookingData?.checkintime || "",
      checkOutDate: bookingData?.checkoutdate || "",
      checkOutTime: bookingData?.checkouttime || "",
    },
  });

  async function onSubmit(values: any) {
    // Create merged object with current data and new values
    let mergedObject;

    let result;
    if (bookingType === "accommodation") {
        mergedObject = { ...values, id: bookingData?.accbookingid ?? null }
      result = await editAccommodationBookingAction(mergedObject);
    } else if (bookingType === "flight") {
        mergedObject = { ...values, id: bookingData?.flightbookingid ?? null }
      result = await editFlightBookingAction(mergedObject);
    } else if (bookingType === "activity") {
        mergedObject = { ...values, id: bookingData?.activitybookingid ?? null }
      result = await editActivityBookingAction(mergedObject);
    } else {
        result = {status: "error", message: "Please select the booking type."}
    }

    if (result.status === "success") {
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-secondary text-white mt-8 md:w-1/3 md:self-center min-w-fit">
          Edit Booking Record
        </Button>
      </DialogTrigger>
      <DialogContent className="text-black w-4/5 rounded-lg">
        <DialogHeader>
          <DialogTitle>
            <p className="text-title font-extrabold">Edit Booking Record</p>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-6"
          >

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
                    <FormLabel>Flight Date</FormLabel>
                    <FormControl><Input type="date" placeholder="Select Date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="flightCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Code</FormLabel>
                    <FormControl><Input placeholder="Enter Flight Code" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="airline" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Airline</FormLabel>
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
                    <FormLabel>Depart Airport</FormLabel>
                    <FormControl><Input placeholder="Enter Depart Airport" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="departTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depart Time</FormLabel>
                    <FormControl><Input placeholder="Select Depart Time" type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="arriveAirport" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrive Airport</FormLabel>
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
                    <FormLabel>Activity Name</FormLabel>
                    <FormControl><Input placeholder="Enter Activity Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityLocationName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="Enter Location Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Date</FormLabel>
                    <FormControl><Input placeholder="Select Activity Date" type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityStartTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Start Time</FormLabel>
                    <FormControl><Input placeholder="Select Activity Start Time" type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityEndTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity End Time</FormLabel>
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
                    <FormLabel>Hotel Name</FormLabel>
                    <FormControl><Input placeholder="Enter Hotel Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="checkInDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Date</FormLabel>
                    <FormControl><Input placeholder="Select Check In Date" type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="checkInTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Time</FormLabel>
                    <FormControl><Input placeholder="Select Check In Time" type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="checkOutDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Date</FormLabel>
                    <FormControl><Input placeholder="Select Check Out Date" type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="checkOutTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Time</FormLabel>
                    <FormControl><Input placeholder="Select Check Out Time" type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}

            <Button type="submit" className="bg-secondary text-white mt-4">Edit Booking Record</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import BestPlaceCarousel from "@/components/BestPlaceCarousel";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { ibm_plex_mono } from "./fonts";

import { createTripAction } from "@/app/actions";

const formSchema = z.object({
  tripName: z.string().min(2, {
    message: "Trip name must be at least 2 characters."
  }),
  tripStartDate: z.string(),
  tripEndDate: z.string(),
  tag: z.string(),
  touristNum: z.string()
}).refine(data => new Date(data.tripEndDate) > new Date(data.tripStartDate), {
  message: "Trip end date must be later than start date.",
  path: ["tripEndDate"], // ensures the error is attached to tripEndDate
});

export default function Home() {
  const { toast } = useToast();
  const router = useRouter();
  const [isMobileFormExpanded, setIsMobileFormExpanded] = useState(false);

  const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
          tripName: "",
          tripStartDate: "",
          tripEndDate: "",
          tag: "N/A",
          touristNum: "1",
      },
  });

  useEffect(() => {
    if (isMobileFormExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFormExpanded]);

  async function onSubmit(values: any) {
    const result = await createTripAction(values);

    const status = result.status;
    const message = result.message;

    if (status === "success") {
        router.push("/itinerary-planning");
    } else {
        console.error("Error:", message);
    }

    toast({
        variant: status === "error" ? "destructive" : "default",
        title: status === "error" ? "Error" : "Success",
        description: message || "Something went wrong",
    });
  }

  return (
    <div className="App">
      <div
        className="h-[60vh] md:h-[40vh] lg:h-screen bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url('/assets/landing-page-bg.png')` }}
      >
        <div className="relative top-[27vh] md:top-[27vh] lg:top-[20vh] w-full px-4 md:mt-12">
          <p
            className={`${ibm_plex_mono.className} text-white text-3xl md:text-4xl font-bold leading-tight lg:w-[35%] lg:text-6xl lg:leading-snug drop-shadow-2xl text-center md:text-left md:ml-12`}
          >
            Start Planning Your Next Trip
          </p>
          
          {/* Mobile View: Collapsed Form Initially */}
          <div className="md:hidden">
            <Button 
              onClick={() => setIsMobileFormExpanded(!isMobileFormExpanded)}
              className="w-full bg-secondary text-white my-4"
            >
              {isMobileFormExpanded ? "Hide Planning Form" : "Plan Your Trip"}
            </Button>
            
            {isMobileFormExpanded && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setIsMobileFormExpanded(false)}>
                <div
                  className="bg-blue-50/90 rounded-xl p-4 w-11/12 max-w-md shadow-lg relative"
                  onClick={(e) => e.stopPropagation()} // prevents dialog click from closing
                >
                  <button 
                    className="absolute top-2 right-2 text-black"
                    onClick={() => setIsMobileFormExpanded(false)}
                  >
                    X
                  </button>
                  <Form {...form}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)(e);
                    }}>
                      <div className="flex flex-col gap-4 w-full">
                        <FormField
                          control={form.control}
                          name="tripName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-title font-medium">Destination</FormLabel>
                              <FormControl>
                                <Input className="bg-white" placeholder="Plan a new trip to:" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex flex-row gap-4">
                          <FormField
                            control={form.control}
                            name="tripStartDate"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-title font-medium">Start Date</FormLabel>
                                <FormControl>
                                  <Input className="bg-white" type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="tripEndDate"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-title font-medium">End Date</FormLabel>
                                <FormControl>
                                  <Input className="bg-white" type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex flex-row gap-4">
                          <FormField
                            control={form.control}
                            name="tag"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-title font-medium">Trip Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Tag" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-white text-black">
                                    <SelectItem value="N/A">Select Tag</SelectItem>
                                    <SelectItem value="Local">Local</SelectItem>
                                    <SelectItem value="Abroad">Abroad</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="touristNum"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-title font-medium">Travelers</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Travelers" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-white text-black">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" className="w-full bg-secondary text-white mt-2" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? "Creating Trip..." : "Start Planning"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                 </div>
              </div>
            )}
          </div>
          
          {/* Desktop/Tablet View: Horizontal Form */}
          <div className="hidden md:block bg-blue-50/70 rounded-xl p-4 m-8 mt-36 sticky">
            <div className="flex items-center w-full">
              <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                }} className="w-full">
                  <div className="grid grid-cols-12 gap-2 items-end w-full">
                    <FormField
                      control={form.control}
                      name="tripName"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormLabel className="text-title font-medium">Destination</FormLabel>
                          <FormControl>
                            <Input className="bg-white" placeholder="Plan a new trip to:" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tripStartDate"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-title font-medium">Start Date</FormLabel>
                          <FormControl>
                            <Input className="bg-white" type="date" placeholder="Start Date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tripEndDate"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-title font-medium">End Date</FormLabel>
                          <FormControl>
                            <Input className="bg-white" type="date" placeholder="End Date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tag"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormLabel className="text-title font-medium">Tag</FormLabel>
                            <FormControl>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Tag" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white text-title">
                              <SelectItem value="N/A">Select Tag</SelectItem>
                              <SelectItem value="Local">Local</SelectItem>
                              <SelectItem value="Abroad">Abroad</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="touristNum"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormLabel className="text-title font-medium">Number of Tourist</FormLabel>
                            <FormControl>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Num of Travelers" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white text-title">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="col-span-1 bg-primary text-white h-10 self-end" 
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? "Creating Trip..." : "Start Planning"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Must Visit Section - Mobile Optimized */}
      <div className="w-full flex flex-col text-title text-center items-center gap-y-4 md:justify-center mt-8 px-4">
        <p
          className={`${ibm_plex_mono.className} text-3xl md:text-4xl font-extrabold leading-none drop-shadow-xl`}
        >
          Must Visit
        </p>
        <p className="text-sm md:text-base mb-4">
          A list of the top 25 Best Tourist Places to See in the world for a perfect trip.
        </p>
        
        <BestPlaceCarousel />
      </div>
      
      <Footer />
    </div>
  );
}
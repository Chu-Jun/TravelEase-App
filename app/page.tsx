"use client";

import React, { useState } from "react";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { faMapPin } from "@fortawesome/free-solid-svg-icons";
import MustVisitCard from "@/components/MustVisitCard";
import { mustVisitList } from "@/data/mustvisit_list";
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
          tag: "",
          touristNum: "",
      },
  });

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

  function closeForm(){
    setIsMobileFormExpanded(false);
    return true;
  }

  return (
    <div className="App">
      <div
        className="h-[60vh] md:h-[40vh] lg:h-screen bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url('/assets/landing-page-bg.png')` }}
      >
        <div className="absolute top-[27vh] md:top-[27vh] lg:top-[20vh] w-full px-4 md:mt-44">
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
              <div className="absolute -top-20 mx-4 z-50 bg-blue-50/90 rounded-xl p-4">
                <button 
                  className="float-right"
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
            )}
          </div>
          
          {/* Desktop/Tablet View: Horizontal Form */}
          <div className="hidden md:block bg-blue-50/70 rounded-xl p-4 m-8 mt-36 sticky">
            <div className="flex gap-0 items-center w-full">
              <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                }}>
                  <div className="flex flex-wrap md:flex-nowrap gap-0 items-center w-full">
                    <FormField
                      control={form.control}
                      name="tripName"
                      render={({ field }) => (
                        <FormItem className="w-full md:w-[40%] p-2 rounded-l">
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
                        <FormItem className="w-full md:w-[20%] p-2">
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
                        <FormItem className="w-full md:w-[20%] p-2">
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
                        <FormItem className="w-full md:w-[15%] p-2">
                          <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Tag" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white text-primary">
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
                        <FormItem className="w-full md:w-[15%] p-2 rounded-r">
                          <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Travelers" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white text-primary">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="bg-primary text-white mt-0 ml-4" disabled={form.formState.isSubmitting}>
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
          A list of the top 75 Best Tourist Places to See in the world for a perfect trip.
        </p>
        
        {/* Mobile-friendly grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 md:grid-cols-2 md:gap-x-4 lg:grid-cols-4 lg:gap-x-4 mb-12 w-full">
          {mustVisitList.map((mustVisit, index) => (
            <MustVisitCard key={index} imageSrc={mustVisit.imageSrc} locationName={mustVisit.locationName}
            country={mustVisit.country}/>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
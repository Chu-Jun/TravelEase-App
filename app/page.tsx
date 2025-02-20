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

  return (
    <div className="App">
      <div
        className="h-screen md:h-[40vh] lg:h-screen bg-fixed"
        style={{ backgroundImage: `url('/assets/landing-page-bg.png')` }}
      >
        <div className="absolute top-[20vh] md:top-[13vh] lg:top-[20vh] w-full mt-44">
          <p
            className={`${ibm_plex_mono.className} ml-12 text-white text-4xl font-bold leading-tight lg:w-[35%] lg:text-6xl lg:leading-snug drop-shadow-2xl`}
            >
            Start Planning Your Next Trip
          </p>
            <div className="bg-blue-50/70 rounded-xl p-4 m-8 mt-36">
              <div className="flex gap-0 items-center w-full">
                <Form {...form}>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)(e);
                  }}>
                    <div className="flex gap-0 items-center w-full">
                      <FormField
                        control={form.control}
                        name="tripName"
                        render={({ field }) => (
                            <FormItem className="w-[40%] p-2 rounded-l">
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
                            <FormItem className="w-[20%] p-2">
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
                            <FormItem className="w-[20%] p-2">
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
                            <FormItem className="w-[15%] p-2">
                                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger className="bg-white" >
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
                            <FormItem className="w-[15%] p-2 rounded-r">
                                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Number of Tourist" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-white text-primary">
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="4">4</SelectItem>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="6">6</SelectItem>
                                        <SelectItem value="7">7</SelectItem>
                                        <SelectItem value="8">8</SelectItem>
                                        <SelectItem value="9">9</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                      />
                      <Button type="submit" className="bg-secondary text-white mt-0 ml-4" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (
                            <span>Creating Trip...</span>
                        ) : (
                            <span>Start Planning</span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
        </div>
      </div>
      <div className="w-full flex flex-col text-primary text-center items-center gap-y-4 md:justify-center lg:mt-8">
        <p
          className={`${ibm_plex_mono.className} text-4xl font-extrabold leading-none drop-shadow-xl`}
        >
          Must visit
        </p>
        <p>
          A list of the top 75 Best Tourist Places to See in the world for a perfect trip.
        </p>
        <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-4 lg:grid-cols-4 lg:gap-x-4 mb-12">
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

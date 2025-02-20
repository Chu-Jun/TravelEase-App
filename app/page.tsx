"use client"

import React from "react";
import Footer from "@/components/Footer";
import Image from "next/image";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { faMapPin } from "@fortawesome/free-solid-svg-icons";
import MustVisitCard from "@/components/MustVisitCard"
import { mustVisitList } from "@/data/mustvisit_list";

import { ibm_plex_mono } from "./fonts";

function Home() {
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
            <div className="bg-blue-50/70 rounded-xl p-4 m-8 mt-36 flex gap-8">
              <div className="space-x-0 w-[85%] pl-8 divide-x-2">
                <input type="text" className="rounded-l w-1/2 p-2" placeholder="Plan a new trip to:" />
                <input type="date" className="w-[15%] p-2" placeholder="Start Date" />
                <input type="date" className="w-[15%] p-2" placeholder="End Date" />
                <select className="rounded-r p-2 h-full">
                  <option>1 adult</option>
                  <option>2 adults</option>
                  <option>3 adults</option>
                  <option>4 adults</option>
                </select>
              </div>
              <button className="bg-secondary rounded-xl p-2 text-white">Start Planning</button>
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

export default Home;

"use client"
import React, { useState } from "react";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription, 
  DialogClose 
} from "@/components/ui/dialog";

function ExpenseTracker() {
    return (
        <div className="p-4">
          {/* Header Section */}
          <div className="flex flex-col mb-6">
            <p className="text-black font-bold text-lg lg:text-3xl">Job Applications</p>
            <p className="text-gray-600 font-semibold lg:text-lg">Manage Applied Jobs</p>
          </div>
      
          {/* Cards Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Applied Jobs Count Card */}
            <div className="flex items-center justify-center bg-white shadow-md rounded-md p-6 border">
              <div>
                <p className="text-gray-600 font-medium text-md">Jobs Applied</p>
                <p className="text-primary font-bold text-3xl">{appliedJobsList.length}</p>
              </div>
            </div>
      
            {/* Career Page Button Card */}
            <div className="flex items-center justify-between bg-red-50 shadow-md rounded-md p-6 w-full">
              <div className="flex items-center gap-4">
                {/* Icon/Image */}
                <img
                  src="/mockImages/career_icon.png" // Replace with the correct path to the image
                  alt="Career Icon"
                  className="w-16 h-16"
                />
                <div>
                  <p className="text-gray-800 font-semibold text-lg">Look for more jobs!</p>
                  <p className="text-gray-600 text-sm">
                    Unlock your potential! Join us for a rewarding career—growth, innovation, and success await.
                  </p>
                </div>
              </div>
              {/* Button */}
              <a
                href="/careers"
                className="bg-red-400 text-white px-3 py-2 rounded-md font-medium hover:bg-red-600"
              >
                Explore Career
              </a>
            </div>
          </div>
      
          {/* Applied Jobs List */}
          {appliedJobsList.map((job, index) => (
            <AppliedJobsCard
              key={index}
              slug={job.slug}
              imageSrc={job.imgSrc.thumbnail}
              jobTitle={job.jobTitle}
              workMode={job.workMode}
              category={job.category}
            />
          ))}
        </div>
      );
}

export default ExpenseTracker;

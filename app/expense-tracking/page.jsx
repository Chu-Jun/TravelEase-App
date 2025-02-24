"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTrips, getExpenses } from "@/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import BudgetCreationDialog from "@/components/BudgetCreationDialog";
import ExpenseCreationDialog from "@/components/ExpenseCreationDialog";
import ExpenseRecordCard from "@/components/ExpenseRecordCard";

const ExpenseTrackingPage = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [expenses, setExpenses] = useState([]); // Store expenses
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch trip data on component mount
    const fetchTrips = async () => {
      try {
        setIsLoading(true);
        const fetchedTrips = await getTrips();
        if (fetchedTrips?.length > 0) {
          setTrips(fetchedTrips);
          setSelectedTrip(fetchedTrips[0]); // Set the first trip as selected
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrips();
  }, []);

  // Fetch expenses when selectedTrip changes
  useEffect(() => {
    const fetchExpenses = async () => {
      if (selectedTrip) {
        try {
          const retrievedExpenses = await getExpenses(selectedTrip.tripid);
          setExpenses(retrievedExpenses);
          console.log("Fetched expenses:", retrievedExpenses);
        } catch (error) {
          console.error("Error fetching expenses:", error);
        }
      }
    };

    fetchExpenses();
  }, [selectedTrip]);

  if (isLoading) {
    return <div className="flex mt-16 justify-center items-center h-screen">Loading trips...</div>;
  }

  if (trips.length === 0) {
    return (
      <div className="flex mt-16 flex-col items-center justify-center h-screen">
        <p className="mb-4">No trips found. Create your first trip!</p>
      </div>
    );
  }

  return (
    <div className="flex mt-16">
      {/* Left section for trip list */}
      <div className="w-1/4 p-4 space-y-4 bg-slate-300 min-h-screen">
        <h2 className="text-3xl font-bold">My Trip</h2>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="px-12 py-1 font-medium text-gray-800 hover:text-black bg-gray-400 rounded-md">
              {selectedTrip?.tripname}
              <FontAwesomeIcon className="ml-4" icon={faCaretDown} />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="text-black">
            {trips.map((trip) => (
              <DropdownMenuItem
                key={trip.tripid}
                onSelect={() => setSelectedTrip(trip)}
              >
                {trip.tripname}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center justify-between bg-red-50 shadow-md rounded-md p-6 w-full">
          {selectedTrip?.budget ? (
            <div>
              <p className="text-gray-600 text-sm">Current Balance</p>
              <p className="text-gray-800 font-semibold text-lg">
                {selectedTrip.budget}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-800 font-semibold text-lg">Set Your Budget Now!</p>
              <BudgetCreationDialog tripData={selectedTrip} />
            </div>
          )}
        </div>

        <ExpenseCreationDialog tripData={selectedTrip} />
        <div className="mt-4">
  <h3 className="text-lg font-bold text-gray-700">Latest Activity</h3>
  {expenses.length > 0 ? (
    <div className="space-y-4 mt-2">
      {/* Group expenses by date if needed */}
      {expenses.map((expense) => (
        <div key={expense.expensesRecordId} className="">
          <ExpenseRecordCard
                expenseRecord={expense}
              />
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">No expenses recorded for this trip.</p>
  )}
</div>

      </div>

      {/* Right section for expense tracking */}
      {selectedTrip && (
        <div className="w-3/5 p-4">
          <h2 className="text-3xl font-bold">Expense Tracking</h2>
          
        </div>
      )}
    </div>
  );
};

export default ExpenseTrackingPage;

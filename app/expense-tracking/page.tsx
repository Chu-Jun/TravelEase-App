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
import ExpensePieChart from "@/components/ExpensePieChart"; // Import the Pie Chart component
import ExpenseBarChart from "@/components/ExpenseBarChart"; // Import the Bar Chart component
import { format, isToday, isYesterday } from "date-fns";

// Define interfaces for type safety
interface Trip {
  tripid: string;
  tripname: string;
  budget: string;
}

interface Expense {
  expensesrecordid: string;
  tripid: string;
  category: string;
  amountspent: string;
  date: string;
  remarks: string;
  // Add other expense properties as needed
}

const ExpenseTrackingPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

          // Calculate balance
          const tempTotalExpenses = retrievedExpenses
            .map(expense => parseFloat(expense.amountspent))
            .reduce((acc, curr) => acc + curr, 0);

          const tempBalance = parseFloat(selectedTrip.budget) - tempTotalExpenses;
          setBalance(tempBalance);
          setTotalExpense(tempTotalExpenses);
        } catch (error) {
          console.error("Error fetching expenses:", error);
        }
      }
    };

    fetchExpenses();
  }, [selectedTrip]);

  if (isLoading) {
    return <div className="flex mt-16 justify-center items-center h-screen bg-background">Loading trips...</div>;
  }

  if (trips.length === 0) {
    return (
      <div className="flex mt-16 flex-col items-center justify-center h-screen bg-background">
        <p className="mb-4">No trips found. Create your first trip!</p>
      </div>
    );
  }

  const groupExpensesByDate = (expenses: Expense[]) => {
    // First sort expenses by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Then group them
    return sortedExpenses.reduce<{ [key: string]: Expense[] }>((groups, expense) => {
      const expenseDate = new Date(expense.date);
      let dateGroup: string;
      
      if (isToday(expenseDate)) {
        dateGroup = "Today";
      } else if (isYesterday(expenseDate)) {
        dateGroup = "Yesterday";
      } else {
        dateGroup = format(expenseDate, "MMM d, yyyy");
      }
      
      if (!groups[dateGroup]) {
        groups[dateGroup] = [];
      }
      groups[dateGroup].push(expense);
      return groups;
    }, {});
  };
  

  return (
    <div className="flex mt-16 bg-background">
      {/* Left section for trip list */}
      <div className="w-1/4 p-4 space-y-4 bg-white min-h-screen">
        <h2 className="text-3xl font-bold">My Trip</h2>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="px-12 py-1 font-medium text-gray-800 hover:text-black bg-gray-300 rounded-md">
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

        <div className="flex items-center justify-between bg-blue-100 shadow-md rounded-md p-6 w-full">
          {selectedTrip?.budget ? (
            <div>
              <p className="text-gray-600 text-sm">Current Balance</p>
              <p className="text-gray-800 font-semibold text-lg">
                {balance}
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
    <div className="space-y-6 mt-2">
      {Object.entries(groupExpensesByDate(expenses)).map(([dateGroup, groupExpenses]) => (
        <div key={dateGroup} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">{dateGroup}</h4>
          <div className="space-y-2">
            {groupExpenses.map((expense) => (
              <div key={expense.expensesrecordid}>
                <ExpenseRecordCard expenseRecord={expense} />
              </div>
            ))}
          </div>
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
        <div className="w-3/4 p-4">
          <h2 className="text-3xl font-bold mb-6">Expense Tracking for {selectedTrip.tripname}</h2>
          
          {expenses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="p-4 rounded-lg">
                <ExpensePieChart expenses={expenses} />
              </div>
              
              {/* Bar Chart */}
              <div className="p-4 rounded-lg">
                <ExpenseBarChart expenses={expenses} totalExpense={totalExpense} />
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-lg text-gray-600">
                No expense data available. Add some expenses to see charts.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseTrackingPage;
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
import { faCaretDown, faChartPie, faList } from "@fortawesome/free-solid-svg-icons";
import BudgetCreationDialog from "@/components/BudgetCreationDialog";
import BudgetEditDialog from "@/components/BudgetEditDialog";
import ExpenseCreationDialog from "@/components/ExpenseCreationDialog";
import ExpenseRecordCard from "@/components/ExpenseRecordCard";
import ExpensePieChart from "@/components/ExpensePieChart";
import ExpenseBarChart from "@/components/ExpenseBarChart";
import { format, isToday, isYesterday } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}

const ExpenseTrackingPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadMoreCount, setLoadMoreCount] = useState<number>(5);
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
  
  const groupedExpenses = groupExpensesByDate(expenses);
  const dateGroups = Object.keys(groupedExpenses);
  
  // For limiting the number of expense items shown on mobile
  const visibleDateGroups = dateGroups.slice(0, loadMoreCount);

  // Mobile view with tabs
  const MobileView = () => (
    <div className="md:hidden w-full mt-16">
      <div className="p-4 bg-white">
        <h2 className="text-2xl font-bold">My Trip</h2>
        
        {/* Trip selection dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="mt-2 w-full px-4 py-2 font-medium text-gray-800 hover:text-black bg-gray-300 rounded-md flex items-center justify-between">
            <span className="truncate">{selectedTrip?.tripname}</span>
            <FontAwesomeIcon className="ml-2" icon={faCaretDown} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="text-black w-full">
            {trips.map((trip) => (
              <DropdownMenuItem
                key={trip.tripid}
                onSelect={() => setSelectedTrip(trip)}
                className="py-3 w-full"
              >
                {trip.tripname}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Balance card */}
        <div className="flex items-center justify-between bg-blue-100 shadow-md rounded-md p-4 w-full mt-4">
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
          
          <div>
            <p className="text-gray-600 text-sm text-right">Total Spend</p>
            <p className="text-gray-800 font-semibold text-lg text-right">
              RM {totalExpense}
            </p>
          </div>
        </div>

        {/* Expense creation button - larger for mobile */}
        <div className="w-full mt-4 flex flex-col">
          <ExpenseCreationDialog tripData={selectedTrip} />
          <BudgetEditDialog tripData={selectedTrip} />
        </div>
      </div>
      
      {/* Tabs for mobile */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-2">
          <TabsTrigger value="charts" className="py-3">
            <FontAwesomeIcon icon={faChartPie} className="mr-2" />
            <span>Charts</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="py-3">
            <FontAwesomeIcon icon={faList} className="mr-2" />
            <span>Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Charts Tab Content */}
        <TabsContent value="charts" className="p-4">
          <h2 className="text-xl font-bold mb-4">Expense Tracking for {selectedTrip?.tripname}</h2>
          
          {expenses.length > 0 ? (
            <div className="space-y-6">
              {/* Pie Chart */}
              <div className="bg-white p-4 pt-1 rounded-lg shadow">
                <div className="h-64">
                  <ExpensePieChart expenses={expenses} />
                </div>
              </div>
              
              {/* Bar Chart */}
              <div className="bg-white p-4 rounded-lg shadow mt-6">
                <h3 className="text-lg font-medium mb-2">Daily Expenses</h3>
                <div className="h-64">
                  <ExpenseBarChart expenses={expenses} totalExpense={totalExpense} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-lg text-gray-600">
                No expense data available. Add some expenses to see charts.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Activity Tab Content */}
        <TabsContent value="activity" className="p-4">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Latest Activity</h3>
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {visibleDateGroups.map((dateGroup) => (
                <div key={dateGroup} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 sticky top-0 bg-gray-50 p-2 rounded">{dateGroup}</h4>
                  <div className="space-y-2">
                    {groupedExpenses[dateGroup].map((expense) => (
                      <div key={expense.expensesrecordid}>
                        <ExpenseRecordCard expenseRecord={expense} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Load more button */}
              {loadMoreCount < dateGroups.length && (
                <button 
                  onClick={() => setLoadMoreCount(prev => prev + 5)}
                  className="w-full py-2 mt-4 bg-gray-200 text-gray-700 rounded-md"
                >
                  Load More
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-4 bg-white rounded-lg shadow">No expenses recorded for this trip.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  // Desktop view (original layout)
  const DesktopView = () => (
    <div className="hidden md:flex md:flex-row mt-16 bg-background">
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
        <BudgetEditDialog tripData={selectedTrip} />
        
        <div className="mt-4">
          <h3 className="text-lg font-bold text-gray-700">Latest Activity</h3>
          {expenses.length > 0 ? (
            <div className="space-y-6 mt-2">
              {Object.entries(groupedExpenses).map(([dateGroup, groupExpenses]) => (
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
              <div className="p-4 bg-white rounded-lg shadow">
                <ExpensePieChart expenses={expenses} />
              </div>
              
              {/* Bar Chart */}
              <div className="p-4 bg-white rounded-lg shadow">
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

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
};

export default ExpenseTrackingPage;
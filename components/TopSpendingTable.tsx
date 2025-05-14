"use client";
import * as React from "react";
import { TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Expense {
  expensesrecordid?: string;
  tripid?: string;
  category: string;
  amountspent: string | number;
  date: string;
  remarks?: string;
}

interface TopSpendingTableProps {
  expenses: Expense[];
}

// Map category codes to user-friendly labels - same as in ExpensePieChart
const categoryLabelsMap: Record<string, string> = {
  "fnb": "Food & Beverage",
  "transportation": "Transportation",
  "accommodation": "Accommodation",
  "shopping": "Shopping",
  "activities": "Activities",
  "others": "Others"
};

const TopSpendingTable: React.FC<TopSpendingTableProps> = ({ expenses }) => {
  // Process expenses data for display
  const [topExpenses, setTopExpenses] = React.useState<Expense[]>([]);
  
  // Calculate date range from expense data - using same logic as in ExpensePieChart
  const dateRange = React.useMemo(() => {
    if (!expenses || expenses.length === 0) return "No date range";
    
    // Parse all valid dates
    const validDates = expenses
      .map(expense => expense.date)
      .filter(dateStr => dateStr && !isNaN(Date.parse(dateStr)))
      .map(dateStr => new Date(dateStr));
    
    if (validDates.length === 0) return "Invalid date range";
    
    // Find min and max dates
    const minDate = new Date(Math.min(...validDates.map(date => date.getTime())));
    const maxDate = new Date(Math.max(...validDates.map(date => date.getTime())));
    
    // Format the date range
    const formatOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    // If dates are in the same month and year
    if (minDate.getMonth() === maxDate.getMonth() && 
        minDate.getFullYear() === maxDate.getFullYear()) {
      return `${minDate.toLocaleDateString('en-US', formatOptions)} - ${maxDate.getDate()}`;
    }
    
    return `${minDate.toLocaleDateString('en-US', formatOptions)} - ${maxDate.toLocaleDateString('en-US', formatOptions)}`;
  }, [expenses]);

  // Format date for display in table
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Process expenses data when it changes
  React.useEffect(() => {
    if (expenses && expenses.length > 0) {
      // Sort expenses by amount (highest first)
      const sortedExpenses = [...expenses].sort((a, b) => {
        const amountA = typeof a.amountspent === 'string' ? parseFloat(a.amountspent) : a.amountspent;
        const amountB = typeof b.amountspent === 'string' ? parseFloat(b.amountspent) : b.amountspent;
        return amountB - amountA;
      });
      
      // Take top 10
      setTopExpenses(sortedExpenses.slice(0, 5));
    } else {
      setTopExpenses([]);
    }
  }, [expenses]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-2">
        <div className="flex items-center space-x-2">
          <TrendingDown className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Top 5 Expenses</CardTitle>
        </div>
        <CardDescription>{dateRange}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topExpenses.length > 0 ? (
              topExpenses.map((expense, index) => (
                <TableRow key={expense.expensesrecordid || index}>
                  <TableCell className="font-medium">{formatDate(expense.date)}</TableCell>
                  <TableCell>{categoryLabelsMap[expense.category.toLowerCase()] || expense.category}</TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {expense.remarks || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'MYR'
                    }).format(Number(expense.amountspent))}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No expense records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopSpendingTable;
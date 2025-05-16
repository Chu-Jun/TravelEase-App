import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { format, isAfter, isBefore, parseISO, addDays, isSameDay } from "date-fns";
import { DateRange } from "react-day-picker";

interface Expense {
  expensesrecordid?: string;
  tripid?: string;
  category: string;
  amountspent: string | number;
  date: string;
  remarks?: string;
}

interface ExpenseBarChartProps {
  expenses: Expense[];
  totalExpense: number;
}

// Map category codes to user-friendly labels
const categoryLabelsMap: Record<string, string> = {
  "fnb": "Food & Beverage",
  "transportation": "Transportation",
  "accommodation": "Accommodation",
  "shopping": "Shopping",
  "activities": "Activities",
};

// Color mapping for categories
const categoryColors: Record<string, string> = {
  "fnb": "hsl(var(--chart-1))",
  "transportation": "hsl(var(--chart-5))",
  "accommodation": "hsl(var(--chart-3))",
  "shopping": "hsl(var(--chart-4))",
  "activities": "hsl(var(--chart-5))",
};

const ExpenseBarChart: React.FC<ExpenseBarChartProps> = ({ expenses, totalExpense }) => {
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [chartConfig, setChartConfig] = useState<any>({});
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(expenses);
  
  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(Object.keys(categoryColors));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  useEffect(() => {
    if (expenses.length > 0) {
      const sortedExpenses = [...expenses].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const oldest = new Date(sortedExpenses[0].date);
      const latest = new Date(sortedExpenses[sortedExpenses.length - 1].date);
      setDateRange({ from: oldest, to: latest });
    }
  }, [expenses]);
  
  
  // Update filtered expenses when filters change
  useEffect(() => {
    let filtered = [...expenses];
    
    // Apply date filter
    if (dateRange?.from) {
      filtered = filtered.filter(expense => 
        isAfter(new Date(expense.date), new Date(dateRange.from.setHours(0, 0, 0, 0)))
      );
    }
    
    if (dateRange?.to) {
      filtered = filtered.filter(expense => 
        isBefore(new Date(expense.date), new Date(addDays(dateRange.to, 1).setHours(0, 0, 0, 0)))
      );
    }
    
    // Apply category filter
    if (selectedCategories.length < Object.keys(categoryColors).length) {
      filtered = filtered.filter(expense => 
        selectedCategories.includes(expense.category.toLowerCase())
      );
    }
    
    setFilteredExpenses(filtered);
    setFilterActive(
      !!dateRange?.from || !!dateRange?.to || selectedCategories.length < Object.keys(categoryColors).length
    );
  }, [expenses, dateRange, selectedCategories]);

  // Process expense data for chart
  useEffect(() => {
    if (!filteredExpenses || filteredExpenses.length === 0) {
      setBarChartData([]);
      return;
    }

    const groupedByDate: Record<string, Record<string, number>> = {};

    filteredExpenses.forEach(({ date, category, amountspent }) => {
      const parsedDate = new Date(date).toISOString().split("T")[0];
      const cat = category.toLowerCase();
      if (!groupedByDate[parsedDate]) groupedByDate[parsedDate] = {};
      if (!groupedByDate[parsedDate][cat]) groupedByDate[parsedDate][cat] = 0;
      groupedByDate[parsedDate][cat] += Number(amountspent);
    });

    const dates = Object.keys(groupedByDate).sort();
    const chartData = dates.map((date) => ({ date, ...groupedByDate[date] }));

    const config: any = {};
    Object.keys(categoryColors).forEach((key) => {
      if (selectedCategories.includes(key)) {
        config[key] = {
          label: categoryLabelsMap[key] || key,
          color: categoryColors[key],
        };
      }
    });

    setBarChartData(chartData);
    setChartConfig(config);
  }, [filteredExpenses, selectedCategories]);

  const resetFilters = () => {
    setDateRange(undefined);
    setSelectedCategories(Object.keys(categoryColors));
    setFilterActive(false);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prevSelected => 
      prevSelected.includes(category) 
        ? prevSelected.filter(c => c !== category)
        : [...prevSelected, category]
    );
  };

  if (!expenses || expenses.length === 0) return <div>No expense data available</div>;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="mb-2">Total Categorized Daily Spending</CardTitle>
        <div className="mt-2 flex flex-wrap gap-2 justify-end">
          {filterActive && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              className="h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
          
          {/* Date Range Filter */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`h-8 ${(dateRange?.from || dateRange?.to) ? "border-primary" : ""}`}
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                {dateRange?.from && dateRange?.to 
                  ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` 
                  : dateRange?.from 
                    ? `From ${format(dateRange.from, "LLL dd, y")}`
                    : dateRange?.to
                      ? `Until ${format(dateRange.to, "LLL dd, y")}`
                      : "Date Range"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 border-b">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Select date range</h4>
                  <p className="text-xs text-muted-foreground">
                    Filter expenses by date range
                  </p>
                </div>
              </div>
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from ?? new Date()}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
              />
              <div className="p-3 border-t flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setDateRange(undefined);
                  }}
                >
                  Clear
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setCalendarOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`h-8 ${selectedCategories.length < Object.keys(categoryColors).length ? "border-primary" : ""}`}
              >
                <Filter className="h-4 w-4 mr-1" />
                Categories
                {selectedCategories.length < Object.keys(categoryColors).length && (
                  <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center">
                    {selectedCategories.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {Object.keys(categoryColors).map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  <span className="flex items-center">     
                    {categoryLabelsMap[category]}
                  </span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {barChartData.length > 0 ? (
          <ChartContainer className="mx-auto w-full h-[420px] sm:h-[200px] md:h-[420px] xl:h-[420px]" config={chartConfig}>
            <ResponsiveContainer width="100%" height="150px">
              <BarChart data={barChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {Object.keys(categoryColors).map((key) => (
                  selectedCategories.includes(key) && (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="a"
                      fill={categoryColors[key]}
                      radius={[4, 4, 0, 0]}
                    />
                  )
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[150px] text-muted-foreground">
            No data available for the selected filters
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          {barChartData.length > 0 && (
            <>From {barChartData[0]?.date} to {barChartData.at(-1)?.date}</>
          )}
        </div>
        <div className="text-muted-foreground">
          {filteredExpenses.length} of {expenses.length} expenses shown
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExpenseBarChart;
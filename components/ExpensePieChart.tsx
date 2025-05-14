"use client";
import * as React from "react";
import { Label, Pie, PieChart, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface Expense {
  expensesrecordid?: string;
  tripid?: string;
  category: string;
  amountspent: string | number;
  date: string;
  remarks?: string;
}

interface ExpenseChartProps {
  expenses: Expense[];
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

const ExpensePieChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  // Process expenses data for chart
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>({});
  
  // Calculate total spent
  const totalSpent = React.useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [chartData]);
  
  // Calculate actual date range from expense data
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

  // Process expenses data when it changes
  React.useEffect(() => {
    if (expenses && expenses.length > 0) {
      // Group expenses by category
      const categoryGrouped = Object.values(
        expenses.reduce<Record<string, { category: string; amount: number }>>((acc, { amountspent, category }) => {
          const key = category.toLowerCase();
          acc[key] = acc[key] || { category: key, amount: 0 };
          acc[key].amount += Number(amountspent);
          return acc;
        }, {})
      );
      
      // Format data for Recharts
      const formattedData = categoryGrouped.map(item => ({
        category: item.category,
        amount: item.amount,
        fill: categoryColors[item.category] || "hsl(var(--chart-8))"
      }));
      
      // Create chart config object
      const config: ChartConfig = {
        amount: {
          label: "Amount",
        }
      };
      
      // Add category configs
      categoryGrouped.forEach(item => {
        const key = item.category;
        config[key] = {
          label: categoryLabelsMap[key] || key,
          color: categoryColors[key] || "hsl(var(--chart-8))"
        };
      });
      
      setChartData(formattedData);
      setChartConfig(config);
    }
  }, [expenses]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>{dateRange}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full h-[330px] sm:h-[320px] md:h-[330px] xl:h-[330px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const { name, value } = payload[0];
                  const categoryLabel = (name && categoryLabelsMap[name]) || name || "Unknown";
                  return (
                    <div className="rounded bg-background px-3 py-2 shadow">
                      <div className="text-sm font-medium text-foreground">
                        {categoryLabel}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'MYR',
                        }).format(Number(value))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={80}
              strokeWidth={5}
              paddingAngle={2}
              labelLine={false}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy ? viewBox.cy - 10 : viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'MYR',
                            maximumFractionDigits: 2
                          }).format(totalSpent)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 16}
                          className="fill-muted-foreground text-sm"
                        >
                          Total Spent
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ExpensePieChart;
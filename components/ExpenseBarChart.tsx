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

  useEffect(() => {
    if (!expenses || expenses.length === 0) return;

    const groupedByDate: Record<string, Record<string, number>> = {};

    expenses.forEach(({ date, category, amountspent }) => {
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
      config[key] = {
        label: categoryLabelsMap[key] || key,
        color: categoryColors[key],
      };
    });

    setBarChartData(chartData);
    setChartConfig(config);
  }, [expenses]);

  if (!barChartData.length) return <div>Loading chart data...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Categorized Daily Spending</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer className="mx-auto w-full h-[420px] sm:h-[200px] md:h-[420px] xl:h-[420px]" config={chartConfig}>
          <ResponsiveContainer width="100%" height={"150px"}>
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
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={categoryColors[key]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          From {barChartData[0].date} to {barChartData.at(-1)?.date}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExpenseBarChart;

"use client";
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define expense type
interface Expense {
  expensesrecordid?: string;
  tripid?: string;
  category: string;
  amountspent: string | number;
  date: string;
  remarks?: string;
}

interface ExpensePieChartProps {
  expenses: Expense[];
}

const colorsList = [
  "rgba(255, 99, 132, 0.2)",
  "rgba(54, 162, 235, 0.2)",
  "rgba(255, 206, 86, 0.2)",
  "rgba(75, 192, 192, 0.2)",
  "rgba(73, 12, 212, 0.2)",
  "rgba(175, 2, 81, 0.2)",
  "rgba(23, 31, 92, 0.2)",
  "rgba(46, 123, 166, 0.2)",
  "rgba(35, 222, 177, 0.2)",
  "rgba(91, 129, 188, 0.2)",
  "rgba(88, 113, 199, 0.2)",
  "rgba(66, 211, 200, 0.2)",
  "rgba(23, 19, 201, 0.2)",
  "rgba(22, 92, 122, 0.2)",
  "rgba(70, 12, 222, 0.2)",
];

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenses }) => {
  const [pieChartData, setPieChartData] = useState<any>(null);

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      generatePieChartData();
    }
  }, [expenses]);

  const generatePieChartData = () => {
    // Group expenses by category and sum up the amounts
    const categoryGrouped = Object.values(
      expenses.reduce<Record<string, { category: string; totalAmount: number }>>((acc, { amountspent, category }) => {
        const key = category;
        acc[key] = acc[key] || { category, totalAmount: 0 };
        acc[key].totalAmount += Number(amountspent);
        return acc;
      }, {})
    );

    // Extract labels (categories) and data (amounts)
    const labels = categoryGrouped.map(item => item.category);
    const data = categoryGrouped.map(item => item.totalAmount);

    // Create the chart data object
    const chartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colorsList.slice(0, labels.length),
          borderColor: colorsList.slice(0, labels.length).map(color => 
            color.replace("0.2", "1")
          ),
          borderWidth: 1,
        },
      ],
    };

    setPieChartData(chartData);
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  if (!pieChartData) {
    return <div>Loading chart data...</div>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">Expenses by Category</h3>
      <div className="w-full max-w-md">
        <Pie data={pieChartData} options={options} />
      </div>
    </div>
  );
};

export default ExpensePieChart;
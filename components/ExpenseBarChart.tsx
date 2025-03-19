"use client";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define expense type
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

const ExpenseBarChart: React.FC<ExpenseBarChartProps> = ({ expenses, totalExpense }) => {
  const [barChartData, setBarChartData] = useState<any>(null);

  const generateBarChartData = useCallback(() => {
    const dateGroupedExpenses = Object.values(
      expenses.reduce<Record<string, { date: string; totalAmount: number }>>((acc, { amountspent, date }) => {
        const key = date;
        acc[key] = acc[key] || { date, totalAmount: 0 };
        acc[key].totalAmount += Number(amountspent);
        return acc;
      }, {})
    );
  
    dateGroupedExpenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
    const labels = dateGroupedExpenses.map(item => item.date);
    const data = dateGroupedExpenses.map(item => item.totalAmount);
  
    setBarChartData({
      labels,
      datasets: [
        {
          label: "Daily Expenses",
          data,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    });
  }, [expenses]); // Depend on `expenses`
  
  useEffect(() => {
    if (expenses && expenses.length > 0) {
      generateBarChartData();
    }
  }, [expenses, generateBarChartData]);

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount Spent'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  if (!barChartData) {
    return <div>Loading chart data...</div>;
  }

  return (
    <div className="mt-6">
        <div className="justify-content: space-between">
            <h3 className="text-xl font-semibold mb-2">This Trip Spend</h3>
            <h2 className="text-xxl font-semibold mb-2">RM {totalExpense}</h2>
        </div>
      <div className="w-full h-80">
        <Bar data={barChartData} options={options} />
      </div>
    </div>
  );
};

export default ExpenseBarChart;
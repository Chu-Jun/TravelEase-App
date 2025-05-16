import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBill, faCar, faHome, faUtensils, faBasketShopping, faUmbrellaBeach } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExpenseEditDialog from "@/components/ExpenseEditDialog";
import ExpenseDeletionDialog from "@/components/ExpenseDeletionDialog";

// Map for full category names
const categoryLabelsMap: Record<string, string> = {
  "fnb": "Food & Beverage",
  "transportation": "Transportation",
  "accommodation": "Accommodation",
  "shopping": "Shopping",
  "activities": "Activities",
};

const ExpenseRecordCard = ({ expenseRecord }: any) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  let icon = null;

  switch (expenseRecord.category) {
    case 'fnb':
      icon = faUtensils;
      break;
    case 'accommodation':
      icon = faHome;
      break;
    case 'transportation':
      icon = faCar;
      break;
    case 'shopping':
      icon = faBasketShopping;
      break;
    case 'activities':
        icon = faUmbrellaBeach;
        break;
    default:
      icon = faMoneyBill;
  }

  // Get full label from map (fallback to raw category if not found)
  const categoryLabel = categoryLabelsMap[expenseRecord.category] || expenseRecord.category;

  return (
    <Card className="shadow-md">
      <div key={expenseRecord.expensesRecordId} className="flex items-center p-4 bg-white border-b-2 border-gray-200 rounded-t-lg">
        {/* Category Icon */}
        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-500 rounded-full mr-4">
          <FontAwesomeIcon icon={icon} />
        </div>

        {/* Expense Details */}
        <div className="flex-1">
          <p className="text-md font-semibold text-gray-800">{categoryLabel}</p>
          <p className="text-sm text-gray-500">{expenseRecord.remarks}</p>
        </div>

        {/* Amount */}
        <p className={`text-lg font-semibold ${expenseRecord.amountspent > 0 ? "text-green-500" : "text-red-500"}`}>
          - RM {expenseRecord.amountspent}
        </p>
      </div>

      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <span className="ml-4 font-extrabold text-gray-800 hover:text-black">...</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            setEditDialogOpen(true);
          }}>
            Edit Record
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            setDeleteDialogOpen(true);
          }}>
            Delete Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <div className="invisible absolute bottom-0 left-0">
        <ExpenseEditDialog expenseData={expenseRecord} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
        <ExpenseDeletionDialog expenseData={expenseRecord} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
      </div>
    </Card>
  );
};

export default ExpenseRecordCard;

import { useState } from "react"; // Add this
import { Card } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBill, faCar, faHome, faUtensils } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExpenseEditDialog from "@/components/ExpenseEditDialog";
import ExpenseDeletionDialog from "@/components/ExpenseDeletionDialog";

const ExpenseRecordCard = ({ expenseRecord }: any) => {
  // Add state to control dialog visibility
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  let icon = null;
  
    switch (expenseRecord.category) {
      case 'FnB':
        icon = faUtensils;
        break;
      case 'Accommodation':
        icon = faHome;
        break;
      case 'Transportation':
        icon = faCar;
        break;
      default:
        icon = faMoneyBill;
    }

  return (
    <Card className="shadow-md">
      <div key={expenseRecord.expensesRecordId} className="flex items-center p-4 bg-white border-b-2 border-gray-200 rounded-t-lg">
          {/* Category Icon (Example: You can use dynamic icons for each category) */}
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-500 rounded-full mr-4">
            <FontAwesomeIcon icon={icon}></FontAwesomeIcon>
          </div>
          
          {/* Expense Details */}
          <div className="flex-1">
            <p className="text-md font-semibold text-gray-800">{expenseRecord.category}</p>
            <p className="text-sm text-gray-500">{expenseRecord.remarks}</p>
          </div>
          
          {/* Amount */}
          <p className={`text-lg font-semibold ${expenseRecord.amountspent > 0 ? "text-green-500" : "text-red-500"}`}>
            - RM {expenseRecord.amountspent}
          </p>
        </div>
      {/* Dropdown Menu with click handlers instead of Dialog components */}
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
      <div className="invisible absolute bottom-0 left-0">
        {/* Render the dialogs separately, controlled by state */}
        <ExpenseEditDialog expenseData={expenseRecord} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
        <ExpenseDeletionDialog expenseData={expenseRecord} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
      </div>
    </Card>
  );
};

export default ExpenseRecordCard;
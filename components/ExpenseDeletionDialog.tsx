"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons"

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"

import { deleteExpenseAction } from "@/app/actions"

export default function ExpenseDeletionDialog({expenseData, open, onOpenChange}: any) {
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteTrip = async () => {
        try {
            setIsDeleting(true)
            const result = await deleteExpenseAction(expenseData.expensesrecordid)

            if (result.status === "success") {
                toast({
                    title: "Success",
                    description: "Expense record deleted successfully",
                })
                window.location.reload();
                onOpenChange(false);
                router.refresh();
            } else {
                throw new Error(result.message)
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete expense record",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
            <Button variant="outline" className="bg-secondary text-white md:w-1/3 md:self-center min-w-fit">
                Delete Record
            </Button>
        </DialogTrigger>
        <DialogContent className="text-black flex flex-col items-center justify-center rounded-md bg-white shadow-xl fixed w-[90%]">
            <DialogHeader>
                <div className="text-yellow-500 text-7xl text-center mb-2">
                    <FontAwesomeIcon icon={faExclamationCircle}/>
                </div>
                <DialogTitle className="text-xl font-semibold text-center text-title">
                    Delete Expense Record?
                </DialogTitle>
                <p className="text-sm text-center text-gray-500">
                    Do you want to delete this expense record?
                </p>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-center gap-4 mt-3">
                <Button
                    onClick={handleDeleteTrip}
                    className="bg-secondary text-white hover:bg-red-700"
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Yes"}
                </Button>
                <Button
                    onClick={() => onOpenChange(false)}
                    className="bg-white text-secondary border border-secondary hover:bg-gray-400 hover:text-white hover:border-none"
                    disabled={isDeleting}
                >
                    Cancel
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    );
}

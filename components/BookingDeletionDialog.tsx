"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons"

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"

import { deleteFlightAction, deleteAccommodationAction, deleteActivityAction } from "@/app/actions"

export default function BookingDeletionDialog({bookingData, open, onOpenChange, bookingType}: any) {
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleDeleteTrip = async () => {
        try {
            setIsDeleting(true)
            let result;
            if (bookingType === "accommodation") {
                result = await deleteAccommodationAction(bookingData.accbookingid);
            } else if (bookingType === "flight") {
                result = await deleteFlightAction(bookingData.flightbookingid);
            } else if (bookingType === "activity") {
                result = await deleteActivityAction(bookingData.activitybookingid);
            } else {
                result = {status: "error", message: "Failure to delete booking record."}
            }

            if (result.status === "success") {
                toast({
                    title: "Success",
                    description: "Booking record deleted successfully",
                })
                window.location.reload();
                setIsDialogOpen(false);
                router.refresh();
            } else {
                throw new Error(result.message)
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete booking record",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
            <Button variant="outline" className="bg-secondary text-white md:w-1/3 md:self-center min-w-fit">
                Delete Booking Record
            </Button>
        </DialogTrigger>
        <DialogContent className="text-black flex flex-col items-center justify-center rounded-md bg-white shadow-xl fixed">
            <DialogHeader>
                <div className="text-yellow-500 text-7xl text-center mb-2">
                    <FontAwesomeIcon icon={faExclamationCircle}/>
                </div>
                <DialogTitle className="text-xl font-semibold text-center text-primary">
                    Delete Booking?
                </DialogTitle>
                <p className="text-sm text-center text-gray-500">
                    Do you want to delete this booking record?
                </p>
            </DialogHeader>
            <DialogFooter className="flex justify-center gap-4 mt-3">
                <Button
                    onClick={handleDeleteTrip}
                    className="bg-primary text-white hover:bg-red-700"
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Yes"}
                </Button>
                <Button
                    onClick={() => setIsDialogOpen(false)}
                    className="bg-secondary text-white hover:bg-gray-400"
                    disabled={isDeleting}
                >
                    Cancel
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    );
}

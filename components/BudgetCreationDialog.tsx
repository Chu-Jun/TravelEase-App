"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"

import { editTripBudgetAction } from "@/app/actions"

const formSchema = z.object({
    tripName: z.string().min(2, {
        message: "Trip name must be at least 2 characters."
    }),
    tripStartDate: z.string(),
    tripEndDate: z.string(),
    budget: z.string(),
})

export default function BudgetCreationDialog({tripData, open, onOpenChange}: any) {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tripName: tripData?.tripname,
            tripStartDate: tripData?.tripstartdate,
            tripEndDate: tripData?.tripenddate,
            budget: "",
        },
    });

    async function onSubmit(values: any) {
        // Create merged object with current data and new values
        const mergedObject = { ...values, id: tripData?.tripid ?? null }
    
        const result = await editTripBudgetAction(mergedObject);

        const status = result.status;
        const message = result.message;

        if (status === "success") {
            window.location.reload();
            onOpenChange(false); // Close dialog on successful submission
            router.refresh();
        } else {
            console.error("Error:", message);
        }

        toast({
            variant: status === "error" ? "destructive" : "default",
            title: status === "error" ? "Error" : "Success",
            description: message || "Something went wrong",
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    className="bg-secondary text-white md:w-1/3 md:self-center min-w-fit md:mt-2"
                >
                    Create Budget
                </Button>
            </DialogTrigger>
            <DialogContent className="text-black w-4/5 rounded-lg">
                <DialogHeader>
                    <DialogTitle>
                        <p className="text-title font-extrabold">Create Budget For Trip To {tripData?.tripname}</p>
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        console.log("Form submitted"); // Should log on submit
                        form.handleSubmit(onSubmit)(e);
                    }} className="space-y-8">
                        <FormField
                        disabled
                            control={form.control}
                            name="tripName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trip Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Trip Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                        disabled
                            control={form.control}
                            name="tripStartDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trip Start Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" placeholder="Select Date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                        disabled
                            control={form.control}
                            name="tripEndDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trip End Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" placeholder="Select Date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="budget"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trip Budget</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Add Budget ..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="bg-secondary text-white mt-8" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? (
                                <span>Creating...</span>
                            ) : (
                                <span>Create</span>
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

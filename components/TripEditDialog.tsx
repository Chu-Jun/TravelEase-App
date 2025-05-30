"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"

import { editTripAction } from "@/app/actions"

const formSchema = z.object({
    tripName: z.string().min(2, {
      message: "Trip name must be at least 2 characters."
    }),
    tripStartDate: z.string(),
    tripEndDate: z.string(),
    tag: z.string(),
    touristNum: z.string()
  }).refine(data => new Date(data.tripEndDate) > new Date(data.tripStartDate), {
    message: "Trip end date must be later than start date.",
    path: ["tripEndDate"], // ensures the error is attached to tripEndDate
  });

export default function TripEditDialog({tripData, open, onOpenChange}: any) {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tripName: tripData?.tripname,
            tripStartDate: tripData?.tripstartdate,
            tripEndDate: tripData?.tripenddate,
            tag: tripData?.tag,
            touristNum: (tripData?.touristnum).toString(),
        },
    });

    async function onSubmit(values: any) {
        // Create merged object with current data and new values
        const mergedObject = { ...values, id: tripData?.tripid ?? null }
    
        const result = await editTripAction(mergedObject);

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
                    className="bg-secondary text-white md:w-1/3 md:self-center min-w-fit"
                >
                    Edit Trip
                </Button>
            </DialogTrigger>
            <DialogContent className="text-black w-4/5 rounded-lg">
                <DialogHeader>
                    <DialogTitle>
                        <p className="text-title font-extrabold">Edit Trip For {tripData?.tripname}</p>
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        console.log("Form submitted"); // Should log on submit
                        form.handleSubmit(onSubmit)(e);
                    }} className="space-y-8">
                        <FormField
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
                            name="tag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tag</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Tag" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white text-title">
                                            <SelectItem value="N/A">Select Tag</SelectItem>
                                            <SelectItem value="Local">Local</SelectItem>
                                            <SelectItem value="Abroad">Abroad</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="touristNum"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number of Tourist</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Number of Tourist" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white text-primary">
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="6">6</SelectItem>
                                            <SelectItem value="7">7</SelectItem>
                                            <SelectItem value="8">8</SelectItem>
                                            <SelectItem value="9">9</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="bg-secondary text-white mt-8" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? (
                                <span>Updating...</span>
                            ) : (
                                <span>Update</span>
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

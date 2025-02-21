"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"

import { createTripAction } from "@/app/actions"

const formSchema = z.object({
    tripName: z.string().min(2, {
        message: "Trip name must be at least 2 characters."
    }),
    tripStartDate: z.string(),
    tripEndDate: z.string(),
    tag: z.string(),
    touristNum: z.string()
})

export default function TripCreationDialog() {
    const { toast } = useToast();
    const router = useRouter();

    const [open, setOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tripName: "",
            tripStartDate: "",
            tripEndDate: "",
            tag: "",
            touristNum: "1",
        },
    });

    async function onSubmit(values: any) {
        const result = await createTripAction(values);

        const status = result.status;
        const message = result.message;

        if (status === "success") {
            setOpen(false); // Close dialog on successful submission
            router.push("/itinerary-planning");
            window.location.reload();
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="bg-secondary text-white mt-8 md:w-1/3 md:self-center min-w-fit"
                >
                    Create New Trip
                </Button>
            </DialogTrigger>
            <DialogContent className="text-black w-4/5 rounded-lg">
                <DialogHeader>
                    <DialogTitle>
                        <p className="text-primary font-extrabold">Create New Trip</p>
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
                                        <SelectContent className="bg-white text-primary">
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

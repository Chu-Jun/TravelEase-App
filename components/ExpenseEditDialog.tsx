"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react";

import { editExpenseAction } from "@/app/actions"

const formSchema = z.object({
    expenserecordid: z.string(),
    date: z.string(),
    amountspent: z.string(),
    category: z.string(),
    remarks: z.string()
})

export default function ExpenseEditDialog({expenseData, open, onOpenChange}: any) {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            expenserecordid: expenseData.expensesrecordid,
            date: expenseData.date,
            amountspent: (expenseData.amountspent).toString(),
            category: expenseData.category,
            remarks: expenseData.remarks,
        },
    });

    useEffect(() => {
        if (expenseData) {
            form.reset({
                expenserecordid: expenseData.expensesrecordid || "",
                date: expenseData.date || "",
                amountspent: (expenseData.amountspent).toString() || "",
                category: expenseData.category || "",
                remarks: expenseData.remarks || "",
            });
        }
    }, [expenseData, form]);

    async function onSubmit(values: any) {
        // Create merged object with current data and new values
        const mergedObject = { ...values, id: expenseData?.expensesrecordid ?? null }
    
        const result = await editExpenseAction(mergedObject);

        const status = result.status;
        const message = result.message;

        if (status === "success") {
            router.push(`/expense-tracking/${expenseData.tripid}`);
            onOpenChange(false); // Close dialog on successful submission
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    className="bg-secondary text-white mt-8 md:w-1/3 md:self-center min-w-fit"
                >
                    Edit Expense Record
                </Button>
            </DialogTrigger>
            <DialogContent className="text-black w-4/5 rounded-lg">
                <DialogHeader>
                    <DialogTitle>
                        <p className="text-title font-extrabold">Edit Expense Record</p>
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
                            name="expenserecordid"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="hidden" placeholder="Expense Record Id" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date *</FormLabel>
                                    <FormControl>
                                        <Input type="date" placeholder="Select Date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amountspent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount Spent *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Amount Spent" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white text-title">
                                            <SelectItem value="fnb">Food & Beverage</SelectItem>
                                            <SelectItem value="accommodation">Accommodation</SelectItem>
                                            <SelectItem value="transportation">Transportation</SelectItem>
                                            <SelectItem value="shopping">Shopping</SelectItem>
                                            <SelectItem value="activities">Activities</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Remarks"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
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

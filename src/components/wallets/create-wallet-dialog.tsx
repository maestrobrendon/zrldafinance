
"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Separator } from "../ui/separator";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Wallet } from "@/lib/data";
import { categories } from "@/lib/data";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type WalletType = "budget" | "goal";

const budgetWalletSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  limit: z.coerce.number().positive("Amount must be positive."),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  status: z.enum(["open", "locked"]).default("open"),
  categories: z.array(z.string()).optional(),
  rollover: z.boolean().default(false),
});

const goalWalletSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  goalAmount: z.coerce.number().positive("Amount must be positive."),
  deadline: z.date().optional(),
  lockOption: z.enum(["locked", "open"]).default("locked"),
});

type CreateWalletDialogProps = {
  trigger: React.ReactNode;
};

export function CreateWalletDialog({ trigger }: CreateWalletDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WalletType>("budget");

  const budgetForm = useForm<z.infer<typeof budgetWalletSchema>>({
    resolver: zodResolver(budgetWalletSchema),
    defaultValues: {
      name: "",
      frequency: "monthly",
      status: "open",
      categories: [],
      rollover: false,
    },
  });

  const goalForm = useForm<z.infer<typeof goalWalletSchema>>({
    resolver: zodResolver(goalWalletSchema),
    defaultValues: {
      name: "",
      lockOption: "locked",
    },
  });

  const onSubmit = async (values: any) => {
    const user = auth.currentUser;
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to create a wallet." });
        return;
    }

    try {
        let walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'> = {
            userId: user.uid,
            balance: 0,
            type: activeTab,
            name: values.name,
            status: values.status || values.lockOption,
        };

        if (activeTab === 'budget') {
            walletData = {
                ...walletData,
                limit: values.limit,
                frequency: values.frequency,
                // categories: values.categories, // Add to your Wallet type if needed
                // rollover: values.rollover, // Add to your Wallet type if needed
            };
        } else { // goal
            walletData = {
                ...walletData,
                goalAmount: values.goalAmount,
                deadline: values.deadline ? Timestamp.fromDate(values.deadline) : undefined,
            };
        }

        const walletsCollection = collection(db, 'wallets');
        await addDoc(walletsCollection, {
            ...walletData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        toast({
            title: "Wallet Created!",
            description: `Your new ${activeTab} wallet "${values.name}" has been created.`,
        });

        setOpen(false);
        budgetForm.reset();
        goalForm.reset();

    } catch (error) {
        console.error("Error creating wallet: ", error);
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: "There was an error creating your wallet. Please try again."
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Create New Wallet</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WalletType)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 mx-6 rounded-md">
            <TabsTrigger value="budget" className="rounded-sm">
                <Icons.calendar className="mr-2 h-4 w-4"/> Budget
            </TabsTrigger>
            <TabsTrigger value="goal" className="rounded-sm">
                <Icons.target className="mr-2 h-4 w-4"/> Goal
            </TabsTrigger>
          </TabsList>
          <TabsContent value="budget" className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            <Form {...budgetForm}>
              <form onSubmit={budgetForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={budgetForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Weekly Groceries" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={budgetForm.control}
                  name="limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Limit</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="$200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={budgetForm.control}
                    name="frequency"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Budget Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a frequency" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                 <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button variant="link" className="p-0 text-primary">
                            <Icons.settings className="mr-2 h-4 w-4" />
                            Advanced Options
                            <Icons.chevronDown className="ml-1 h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 pt-4 animate-in fade-in-0">
                         <FormField
                            control={budgetForm.control}
                            name="categories"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Tracked Categories</FormLabel>
                                        <FormDescription>
                                        Select which spending categories will count towards this budget.
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                        {categories.map((category) => (
                                        <FormField
                                            key={category}
                                            control={budgetForm.control}
                                            name="categories"
                                            render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={category}
                                                    className="flex flex-row items-center space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(category)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                ? field.onChange([...(field.value || []), category])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                        (value) => value !== category
                                                                    )
                                                                    )
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {category}
                                                    </FormLabel>
                                                </FormItem>
                                            )
                                            }}
                                        />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Separator />
                        <FormField
                            control={budgetForm.control}
                            name="rollover"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Enable Rollover
                                    </FormLabel>
                                    <FormDescription>
                                        Carry over unused funds to the next budget period.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </CollapsibleContent>
                </Collapsible>

                <DialogFooter className="pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create Budget</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="goal" className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            <Form {...goalForm}>
              <form onSubmit={goalForm.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={goalForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New iPhone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={goalForm.control}
                  name="goalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="$1200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={goalForm.control}
                    name="deadline"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Deadline (Optional)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                 />

                <FormField
                    control={goalForm.control}
                    name="lockOption"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Wallet Lock</FormLabel>
                            <FormDescription>
                                Control access to the funds in this wallet.
                            </FormDescription>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-2"
                                >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="locked" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Lock until goal is reached or deadline passes
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="open" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Keep wallet open for withdrawals
                                    </FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                 <DialogFooter className="pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create Goal</Button>
                 </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

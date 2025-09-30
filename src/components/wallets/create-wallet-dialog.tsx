
"use client";

import * as React from "react";
import { useState, useMemo } from "react";
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
import { Wallet } from "@/lib/data";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Separator } from "../ui/separator";

type WalletType = "budget" | "goal";

const budgetWalletSchema = z.object({
  walletName: z.string().min(2, "Name must be at least 2 characters."),
  totalBudget: z.coerce.number().positive("Amount must be positive."),
  frequency: z.enum(["daily", "weekly", "bi-weekly", "monthly"]),
  lock: z.boolean().default(false),
  lockDuration: z.coerce.number().positive().optional(),
  carryOver: z.boolean().default(false),
  autoDisburse: z.boolean().default(false),
  disbursementAmount: z.coerce.number().optional(),
  disbursementFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  disbursementDay: z.string().optional(),
});


const goalWalletSchema = z.object({
  goalName: z.string().min(2, "Name must be at least 2 characters."),
  targetAmount: z.coerce.number().positive("Amount must be positive."),
  deadline: z.date().optional(),
  fundingSource: z.enum(["manual", "auto"]),
  autoSchedule: z.string().optional(), // e.g., "weekly", "monthly"
  lockUntilTarget: z.boolean().default(true),
});

type CreateWalletDialogProps = {
  trigger: React.ReactNode;
  onWalletCreated?: (wallet: Omit<Wallet, 'id' | 'currency' | 'color'>) => void;
};

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthDays = Array.from({ length: 31 }, (_, i) => (i + 1).toString());


export function CreateWalletDialog({ trigger, onWalletCreated }: CreateWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WalletType>("budget");

  const budgetForm = useForm<z.infer<typeof budgetWalletSchema>>({
    resolver: zodResolver(budgetWalletSchema),
    defaultValues: {
      walletName: "",
      frequency: "monthly",
      lock: false,
      carryOver: false,
      autoDisburse: false,
    },
  });

  const goalForm = useForm<z.infer<typeof goalWalletSchema>>({
    resolver: zodResolver(goalWalletSchema),
    defaultValues: {
      goalName: "",
      fundingSource: "manual",
      lockUntilTarget: true,
    },
  });

  const onSubmit = (values: any) => {
    if(onWalletCreated) {
        if(activeTab === 'budget') {
            onWalletCreated({
                name: values.walletName,
                balance: values.totalBudget,
            })
        } else {
             onWalletCreated({
                name: values.goalName,
                balance: 0, // Goal wallets start empty
                goal: values.targetAmount,
            })
        }
    }
    setOpen(false); // Close dialog on success
    // Reset forms after submission
    budgetForm.reset();
    goalForm.reset();
  };

  const totalBudget = budgetForm.watch("totalBudget");
  const frequency = budgetForm.watch("frequency");
  const allocationAmount = useMemo(() => {
    if (!totalBudget) return 0;
    switch (frequency) {
        case 'daily': return totalBudget / 30;
        case 'weekly': return totalBudget / 4;
        case 'bi-weekly': return totalBudget / 2;
        case 'monthly': return totalBudget;
        default: return 0;
    }
  }, [totalBudget, frequency]);
  
  const disbursementFrequency = budgetForm.watch("disbursementFrequency");


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
                  name="walletName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Weekly Groceries" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={budgetForm.control}
                  name="totalBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Budget Amount</FormLabel>
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
                        <FormLabel>Frequency of Allocation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a frequency" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="text-sm">
                    <p className="text-muted-foreground">Amount per Allocation</p>
                    <p className="font-medium">~{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(allocationAmount)} / {frequency.replace('-', ' ')}</p>
                </div>

                <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-4">
                        <FormField
                            control={budgetForm.control}
                            name="lock"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                    Lock Wallet
                                    </FormLabel>
                                    <FormDescription>
                                        Lock funds for a set period.
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
                        {budgetForm.watch("lock") && (
                             <FormField
                                control={budgetForm.control}
                                name="lockDuration"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Lock Duration (in days)</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="e.g., 30" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                            />
                        )}
                    </CardContent>
                </Card>

                 <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button variant="link" className="p-0">
                            Advanced Settings <Icons.chevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-2">
                       <Card className="bg-muted/50">
                            <CardContent className="p-4 space-y-4">
                                <FormField
                                    control={budgetForm.control}
                                    name="carryOver"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg">
                                        <div className="space-y-0.5">
                                            <FormLabel>Carry-over</FormLabel>
                                            <FormDescription>
                                                Roll over unspent funds.
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
                                <Separator />
                                 <FormField
                                    control={budgetForm.control}
                                    name="autoDisburse"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg">
                                        <div className="space-y-0.5">
                                            <FormLabel>Auto-Disbursement</FormLabel>
                                            <FormDescription>
                                                Automatically send funds to your main wallet.
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
                                {budgetForm.watch("autoDisburse") && (
                                    <div className="space-y-4 pl-2 pt-2 border-l-2 ml-2">
                                        <FormField
                                            control={budgetForm.control}
                                            name="disbursementAmount"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Disbursement Amount</FormLabel>
                                                <FormControl>
                                                <Input type="number" placeholder="$50" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={budgetForm.control}
                                            name="disbursementFrequency"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Disbursement Frequency</FormLabel>
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
                                        {disbursementFrequency === 'weekly' && (
                                              <FormField
                                                control={budgetForm.control}
                                                name="disbursementDay"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Day of the Week</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a day" />
                                                        </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {weekDays.map(day => <SelectItem key={day} value={day.toLowerCase()}>{day}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        {disbursementFrequency === 'monthly' && (
                                             <FormField
                                                control={budgetForm.control}
                                                name="disbursementDay"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Day of the Month</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a day" />
                                                        </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {monthDays.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>
                                )}
                            </CardContent>
                       </Card>
                    </CollapsibleContent>
                 </Collapsible>

                <DialogFooter className="px-6 pb-6 pt-0">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create Budget Wallet</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="goal" className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            <Form {...goalForm}>
              <form onSubmit={goalForm.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={goalForm.control}
                  name="goalName"
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
                  name="targetAmount"
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
                        <FormLabel>Deadline / Goal Date</FormLabel>
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

                <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-4">
                         <div className="flex items-center justify-between">
                            <FormLabel>Motivation</FormLabel>
                            <Button variant="ghost" size="sm">
                                <Icons.image className="mr-2 h-4 w-4" /> Add Image
                            </Button>
                        </div>
                        <FormField
                            control={goalForm.control}
                            name="lockUntilTarget"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg pt-4 border-t">
                                <div className="space-y-0.5">
                                    <FormLabel>Lock Period</FormLabel>
                                    <FormDescription>
                                        Lock until target is reached.
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
                    </CardContent>
                </Card>

                 <DialogFooter className="px-6 pb-6 pt-0">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create Goal Wallet</Button>
                 </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

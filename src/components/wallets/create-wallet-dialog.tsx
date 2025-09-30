
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Wallet } from "@/lib/data";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "@/components/ui/label";

type WalletType = "budget" | "goal";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const daysOfMonth = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

const budgetWalletSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  limit: z.coerce.number().positive("Total budget amount must be positive."),
  spendLimit: z.coerce.number().optional(),
  
  // Locking
  isLocked: z.boolean().default(false),
  lockDuration: z.coerce.number().optional(),
  disbursementFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  disbursementDayOfWeek: z.string().optional(),
  disbursementDayOfMonth: z.coerce.number().optional(),

  // Advanced
  automaticAllocation: z.boolean().default(false),
  allocationFrequency: z.enum(["daily", "weekly", "bi-weekly", "monthly"]).optional(),
  allocationDayOfWeek: z.string().optional(),
  allocationDayOfMonth: z.coerce.number().optional(),
  rollover: z.boolean().default(false),
  customNotifications: z.boolean().default(false),
});

const goalWalletSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  goalAmount: z.coerce.number().positive("Target amount must be positive."),
  deadline: z.date().optional(),
  fundingSource: z.enum(["manual", "auto"]).default("manual"),
  contributionAmount: z.coerce.number().optional(),
  contributionFrequency: z.string().optional(),
  lockOption: z.enum(["until-target", "until-date"]).default("until-target"),
  goalImage: z.string().optional(),
  smartReminders: z.boolean().default(false),
  flexContributions: z.boolean().default(false),
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
      limit: '' as any,
      spendLimit: '' as any,
      isLocked: false,
      lockDuration: '' as any,
      automaticAllocation: false,
      rollover: false,
      customNotifications: false,
    },
  });

  const goalForm = useForm<z.infer<typeof goalWalletSchema>>({
    resolver: zodResolver(goalWalletSchema),
    defaultValues: {
      name: "",
      fundingSource: "manual",
      lockOption: "until-target",
      smartReminders: false,
      flexContributions: false,
    },
  });

  const isBudgetWalletLocked = budgetForm.watch("isLocked");
  const disbursementFrequency = budgetForm.watch("disbursementFrequency");
  const isAutoAllocationEnabled = budgetForm.watch("automaticAllocation");
  const allocationFrequency = budgetForm.watch("allocationFrequency");


   const onSubmit = async (values: any) => {
    const user = auth.currentUser;
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to create a wallet." });
        return;
    }

    try {
        let walletData: Partial<Wallet> = {
            userId: user.uid,
            balance: 0,
            type: activeTab,
            name: values.name,
            status: 'open',
        };

        if (activeTab === 'budget') {
            walletData = {
                ...walletData,
                limit: values.limit,
                spendLimit: values.spendLimit,
                isLocked: values.isLocked,
                lockDuration: values.isLocked ? values.lockDuration : undefined,
                disbursementFrequency: values.isLocked ? values.disbursementFrequency : undefined,
                disbursementDayOfWeek: values.isLocked && values.disbursementFrequency === 'weekly' ? values.disbursementDayOfWeek : undefined,
                disbursementDayOfMonth: values.isLocked && values.disbursementFrequency === 'monthly' ? values.disbursementDayOfMonth : undefined,
                automaticAllocation: values.automaticAllocation,
                allocationFrequency: values.automaticAllocation ? values.allocationFrequency : undefined,
                allocationDayOfWeek: values.automaticAllocation && (values.allocationFrequency === 'weekly' || values.allocationFrequency === 'bi-weekly') ? values.allocationDayOfWeek : undefined,
                allocationDayOfMonth: values.automaticAllocation && values.allocationFrequency === 'monthly' ? values.allocationDayOfMonth : undefined,
                rollover: values.rollover,
                customNotifications: values.customNotifications,
            };
             if (values.isLocked) {
                walletData.status = 'locked';
            }
        } else { // goal
            walletData = {
                ...walletData,
                goalAmount: values.goalAmount,
                deadline: values.deadline ? Timestamp.fromDate(values.deadline) : undefined,
                fundingSource: values.fundingSource,
                contributionAmount: values.contributionAmount,
                contributionFrequency: values.contributionFrequency,
                lockOption: values.lockOption,
                goalImage: values.goalImage,
                smartReminders: values.smartReminders,
                flexContributions: values.flexContributions,
            };
            if (values.lockOption) { // Simplified locking logic for goals
                walletData.status = 'locked';
            }
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
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-md">
                <TabsTrigger value="budget" className="rounded-sm">
                    <Icons.calendar className="mr-2 h-4 w-4"/> Budget
                </TabsTrigger>
                <TabsTrigger value="goal" className="rounded-sm">
                    <Icons.target className="mr-2 h-4 w-4"/> Goal
                </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="budget" className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            <Form {...budgetForm}>
              <form onSubmit={budgetForm.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={budgetForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Name <span className="text-destructive">*</span></FormLabel>
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
                      <FormLabel>Total Budget Amount <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="$200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={budgetForm.control}
                  name="spendLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spend Limit (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. $50 per transaction" {...field} />
                      </FormControl>
                      <FormDescription>Set a maximum amount for any single transaction.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                    control={budgetForm.control}
                    name="isLocked"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Lock Wallet</FormLabel>
                            <FormDescription>Lock funds and set a disbursement schedule.</FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange}/>
                        </FormControl>
                        </FormItem>
                    )}
                />

                {isBudgetWalletLocked && (
                    <div className="space-y-6 rounded-md border p-4 animate-in fade-in-0">
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
                        <FormField
                            control={budgetForm.control}
                            name="disbursementFrequency"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Disbursement Frequency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a schedule" />
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
                                name="disbursementDayOfWeek"
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
                                            {daysOfWeek.map(day => <SelectItem key={day} value={day.toLowerCase()}>{day}</SelectItem>)}
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
                                name="disbursementDayOfMonth"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Day of the Month</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a date" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {daysOfMonth.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                )}
                
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
                            name="automaticAllocation"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Automatic Allocation</FormLabel>
                                    <FormDescription>Automatically fund this budget from your main wallet.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                </FormControl>
                                </FormItem>
                            )}
                        />
                        {isAutoAllocationEnabled && (
                             <div className="space-y-4 rounded-md border p-4 animate-in fade-in-0">
                                <FormField
                                    control={budgetForm.control}
                                    name="allocationFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Allocation Frequency</FormLabel>
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
                                        <FormDescription>The budget amount will be debited automatically.</FormDescription>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {(allocationFrequency === 'weekly' || allocationFrequency === 'bi-weekly') && (
                                    <FormField
                                        control={budgetForm.control}
                                        name="allocationDayOfWeek"
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
                                                    {daysOfWeek.map(day => <SelectItem key={day} value={day.toLowerCase()}>{day}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {allocationFrequency === 'monthly' && (
                                    <FormField
                                        control={budgetForm.control}
                                        name="allocationDayOfMonth"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Day of the Month</FormLabel>
                                            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a date" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {daysOfMonth.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                             </div>
                        )}


                        <FormField
                            control={budgetForm.control}
                            name="rollover"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Enable Rollover</FormLabel>
                                    <FormDescription>Carry over unspent allocation to the next period.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={budgetForm.control}
                            name="customNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Custom Notifications</FormLabel>
                                    <FormDescription>Get a reminder before each allocation.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange}/>
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
                        <Input placeholder="e.g., New iPhone, Vacation" {...field} />
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
                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
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
                    name="fundingSource"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Funding Source</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                <FormItem>
                                    <RadioGroupItem value="manual" id="manual" className="sr-only peer" />
                                    <Label htmlFor="manual" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                        Manual Top-up
                                    </Label>
                                </FormItem>
                                <FormItem>
                                    <RadioGroupItem value="auto" id="auto" className="sr-only peer" />
                                    <Label htmlFor="auto" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                        Auto-schedule
                                    </Label>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                  control={goalForm.control}
                  name="goalImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Image (Optional)</FormLabel>
                       <FormDescription>Add an image for goal visualization.</FormDescription>
                      <FormControl>
                        <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0]?.name)} />
                      </FormControl>
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
                            control={goalForm.control}
                            name="smartReminders"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Smart Reminders</FormLabel>
                                    <FormDescription>Get intelligent reminders to fund your goal.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={goalForm.control}
                            name="flexContributions"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Flex Contributions</FormLabel>
                                    <FormDescription>Auto-adjust contributions if you miss one.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange}/>
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

"use client";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";

export const adjustmentFormSchema = z.object({
  transactionDate: z.coerce
    .date()
    .max(addDays(new Date(), 1), "Transaction date cannot be in the future"),
  walletId: z.coerce.number().positive("Please select an account"),
  newBalance: z.coerce.number("New balance must be a number"),
  note: z.string().max(500, "Note must contain a maximum of 500 characters"),
});

type Wallet = {
  id: number;
  name: string;
  currency: string;
  balance: number;
};

type Props = {
  wallets: Wallet[];
  onSubmit: (data: z.infer<typeof adjustmentFormSchema>) => Promise<void>;
  onSaveAndAddMore?: (data: z.infer<typeof adjustmentFormSchema>) => Promise<void>;
};

export default function AdjustmentForm({
  wallets,
  onSubmit,
  onSaveAndAddMore,
}: Props) {
  const router = useRouter();

  const form = useForm<z.infer<typeof adjustmentFormSchema>>({
    resolver: zodResolver(adjustmentFormSchema) as Resolver<
      z.infer<typeof adjustmentFormSchema>
    >,
    defaultValues: {
      walletId: 0,
      newBalance: 0,
      note: "",
      transactionDate: new Date(),
    },
  });

  const selectedWalletId = form.watch("walletId");
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const currentBalance = selectedWallet?.balance ?? 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Back button and title */}
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">
              Add new adjustment transaction
            </h1>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd-MM-yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={{
                            after: new Date(),
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="walletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cash account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Cash account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id.toString()}>
                          {wallet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedWallet && (
                    <p className="text-sm text-muted-foreground">
                      Current balance: {selectedWallet.balance.toFixed(2)}{" "}
                      {selectedWallet.currency}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New account balance</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="New account balance"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  {selectedWallet && (
                    <p className="text-sm text-muted-foreground">
                      Adjustment:{" "}
                      {(form.watch("newBalance") - currentBalance).toFixed(2)}{" "}
                      {selectedWallet.currency}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Note"
                      rows={4}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            {onSaveAndAddMore && (
              <Button
                type="button"
                variant="outline"
                onClick={form.handleSubmit(onSaveAndAddMore)}
                disabled={form.formState.isSubmitting}
              >
                Save and add more
              </Button>
            )}
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Add transaction
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}


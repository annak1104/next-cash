"use client";

import { cn } from "@/lib/utils";
import { type Category } from "@/types/Category";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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

export const transferFormSchema = z
  .object({
    transactionDate: z.coerce
      .date()
      .max(addDays(new Date(), 1), "Transaction date cannot be in the future"),
    categoryId: z.coerce
      .number()
      .positive("Please select a category")
      .optional(),
    fromWalletId: z.coerce.number().positive("Please select a source account"),
    toWalletId: z.coerce
      .number()
      .positive("Please select a destination account"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    fee: z.coerce.number().min(0, "Fee cannot be negative").optional(),
    note: z.string().max(500, "Note must contain a maximum of 500 characters"),
  })
  .refine((data) => data.fromWalletId !== data.toWalletId, {
    message: "Source and destination accounts must be different",
    path: ["toWalletId"],
  });

type Wallet = {
  id: number;
  name: string;
  currency: string;
};

type Props = {
  categories: Category[];
  wallets: Wallet[];
  onSubmit: (data: z.infer<typeof transferFormSchema>) => Promise<void>;
  onSaveAndAddMore?: (
    data: z.infer<typeof transferFormSchema>,
  ) => Promise<void>;
};

export default function TransferForm({
  categories,
  wallets,
  onSubmit,
  onSaveAndAddMore,
}: Props) {
  const router = useRouter();

  const form = useForm<z.infer<typeof transferFormSchema>>({
    resolver: zodResolver(transferFormSchema) as Resolver<
      z.infer<typeof transferFormSchema>
    >,
    defaultValues: {
      amount: 0,
      fee: 0,
      categoryId: 0,
      fromWalletId: 0,
      toWalletId: 0,
      note: "",
      transactionDate: new Date(),
    },
  });

  const fromWalletId = form.watch("fromWalletId");

  // Filter out the selected "from" wallet from "to" wallet options
  const availableToWallets = wallets.filter(
    (wallet) => wallet.id !== fromWalletId,
  );

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
              Add new transfer transaction
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(
                        value === "none" ? undefined : Number(value),
                      )
                    }
                    value={field.value ? field.value.toString() : "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fromWalletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From account</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      // Reset toWalletId if it's the same as fromWalletId
                      if (form.getValues("toWalletId") === Number(value)) {
                        form.setValue("toWalletId", 0);
                      }
                    }}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="From account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem
                          key={wallet.id}
                          value={wallet.id.toString()}
                        >
                          {wallet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toWalletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value.toString()}
                    disabled={!fromWalletId || fromWalletId === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="To account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableToWallets.map((wallet) => (
                        <SelectItem
                          key={wallet.id}
                          value={wallet.id.toString()}
                        >
                          {wallet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="Fee (optional)"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
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

"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_CURRENCY_OPTIONS } from "@/lib/supportedCurrencies";
import { walletSchema } from "@/validation/walletSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";

const walletFormSchema = walletSchema;
type WalletFormInput = z.input<typeof walletFormSchema>;
type WalletFormOutput = z.output<typeof walletFormSchema>;

type Props = {
  onSubmit: (data: WalletFormOutput) => Promise<void>;
  onCancel?: () => void;
};

export default function CreateWalletForm({ onSubmit, onCancel }: Props) {
  const form = useForm<WalletFormInput, unknown, WalletFormOutput>({
    resolver: zodResolver(walletFormSchema) as Resolver<
      WalletFormInput,
      unknown,
      WalletFormOutput
    >,
    defaultValues: {
      name: "",
      currency: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account name</FormLabel>
                <FormControl>
                  <Input placeholder="Account name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SUPPORTED_CURRENCY_OPTIONS.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}

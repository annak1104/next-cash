"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronDown,
  Search,
  SwitchCamera,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { tradeSchema } from "@/validation/tradeSchema";
import { toast } from "sonner";
import { createAssetTrade } from "./actions";

type Portfolio = {
  id: string;
  name: string;
  currency: string;
};

type Wallet = {
  id: number;
  name: string;
  currency: string;
};

type CryptoOption = {
  id: string;
  symbol: string;
  name: string;
  image: string;
};

type Props = {
  portfolios: Portfolio[];
  wallets: Wallet[];
};

type FormValues = z.infer<typeof tradeSchema>;

export default function NewTradeForm({ portfolios, wallets }: Props) {
  const router = useRouter();
  const [cryptoOptions, setCryptoOptions] = useState<CryptoOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(
    null,
  );
  const [isTickerPopoverOpen, setIsTickerPopoverOpen] = useState(false);
  const [apiPrice, setApiPrice] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      type: "buy",
      portfolioId: portfolios[0] ? Number(portfolios[0].id) : 0,
      ticker: "",
      tickerId: undefined,
      tickerName: undefined,
      tickerImage: undefined,
      assetType: "crypto",
      transactionDate: new Date(),
      amount: 1,
      price: 0,
      fee: undefined,
      entryType: "single",
      updateCash: false,
      walletId: wallets[0]?.id,
      exchangeRate: 1,
    },
  });

  const watchAmount = form.watch("amount");
  const watchPrice = form.watch("price");
  const watchFee = form.watch("fee") ?? 0;
  const watchExchangeRate = form.watch("exchangeRate");
  const watchUpdateCash = form.watch("updateCash");
  const watchType = form.watch("type");
  const watchEntryType = form.watch("entryType");
  const watchAssetType = form.watch("assetType");

  const totalAmount = useMemo(
    () => watchAmount * watchPrice + (watchFee || 0),
    [watchAmount, watchPrice, watchFee],
  );

  const cashChange = useMemo(
    () => totalAmount * (watchExchangeRate || 1),
    [totalAmount, watchExchangeRate],
  );

  // Disable cash update when entry type is multiple
  useEffect(() => {
    if (watchEntryType === "multiple" && watchUpdateCash) {
      form.setValue("updateCash", false);
    }
  }, [watchEntryType, watchUpdateCash, form]);

  // When switching to stocks, clear crypto-specific fields
  useEffect(() => {
    if (watchAssetType === "stock") {
      setSelectedCrypto(null);
      setSearchQuery("");
      setApiPrice(null);
      form.setValue("tickerId", undefined);
      form.setValue("tickerName", undefined);
      form.setValue("tickerImage", undefined);
    }
  }, [watchAssetType, form]);

  // Search crypto
  useEffect(() => {
    if (!searchQuery) {
      setCryptoOptions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/crypto/search?q=${encodeURIComponent(searchQuery)}`,
        );
        if (res.ok) {
          const data: CryptoOption[] = await res.json();
          setCryptoOptions(data.slice(0, 30));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Fetch price when crypto selected
  const fetchPrice = async (id: string) => {
    try {
      const res = await fetch(`/api/crypto/price?id=${encodeURIComponent(id)}`);
      if (!res.ok) return;
      const data: { price: number } = await res.json();
      setApiPrice(data.price);
      form.setValue("price", data.price);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCryptoSelect = (crypto: CryptoOption) => {
    setSelectedCrypto(crypto);
    form.setValue("ticker", crypto.symbol);
    form.setValue("tickerId", crypto.id);
    form.setValue("tickerName", crypto.name);
    form.setValue("tickerImage", crypto.image);
    setIsTickerPopoverOpen(false);
    setSearchQuery("");
    fetchPrice(crypto.id);
  };

  const handleSubmit = async (values: FormValues, stayOnPage: boolean) => {
    const result = await createAssetTrade(values);

    if (result.error) {
      toast.error(result.message ?? "Failed to save transaction");
      return;
    }

    toast.success("Transaction saved");

    if (stayOnPage) {
      // Reset for next entry, keep portfolio and wallet
      const currentPortfolioId = values.portfolioId;
      const currentWalletId = values.walletId;
      const entryType = values.entryType;
      form.reset({
        ...values,
        amount: 1,
        price: apiPrice ?? 0,
        fee: undefined,
        ticker: "",
        tickerId: undefined,
        tickerName: undefined,
        tickerImage: undefined,
        portfolioId: currentPortfolioId,
        walletId: currentWalletId,
        entryType,
      });
      setSelectedCrypto(null);
      setApiPrice(null);
    } else {
      router.push("/portfolio");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold">Add new buy transaction</h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => handleSubmit(values, false))}
          className="space-y-6"
        >
          {/* Entry type toggle */}
          <div className="bg-muted inline-flex rounded-full p-1 text-xs">
            <Button
              type="button"
              size="sm"
              variant={watchEntryType === "single" ? "default" : "ghost"}
              className={cn(
                "rounded-full px-4",
                watchEntryType === "single" && "shadow-sm",
              )}
              onClick={() => form.setValue("entryType", "single")}
            >
              Single entry
            </Button>
            {/* <Button
              type="button"
              size="sm"
              variant={watchEntryType === "multiple" ? "default" : "ghost"}
              className={cn(
                "rounded-full px-4",
                watchEntryType === "multiple" && "shadow-sm",
              )}
              onClick={() => form.setValue("entryType", "multiple")}
            >
              Multiple entry (no cash)
            </Button> */}
          </div>

          {/* Main grid */}
          <div className="bg-background space-y-4 rounded-2xl border p-4 sm:p-6">
            {/* Asset type */}
            <FormField
              control={form.control}
              name="assetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset type</FormLabel>
                  <FormControl>
                    <div className="bg-muted inline-flex rounded-full p-1 text-xs">
                      <Button
                        type="button"
                        size="sm"
                        variant={field.value === "crypto" ? "default" : "ghost"}
                        className={cn(
                          "rounded-full px-4",
                          field.value === "crypto" && "shadow-sm",
                        )}
                        onClick={() => field.onChange("crypto")}
                      >
                        Crypto
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={field.value === "stock" ? "default" : "ghost"}
                        className={cn(
                          "rounded-full px-4",
                          field.value === "stock" && "shadow-sm",
                        )}
                        onClick={() => field.onChange("stock")}
                      >
                        Stock
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                        <SelectItem value="revaluation">Revaluation</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Portfolio */}
            <FormField
              control={form.control}
              name="portfolioId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value ? String(field.value) : ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select portfolio" />
                      </SelectTrigger>
                      <SelectContent>
                        {portfolios.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
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
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? format(field.value, "dd-MM-yyyy")
                            : "Pick a date"}
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={{ after: new Date() }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ticker */}
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticker</FormLabel>
                  <FormControl>
                    {watchAssetType === "crypto" ? (
                      <Popover
                        open={isTickerPopoverOpen}
                        onOpenChange={setIsTickerPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {selectedCrypto ? (
                              <div className="flex items-center gap-2">
                                {selectedCrypto.image && (
                                  <Image
                                    src={selectedCrypto.image}
                                    alt={selectedCrypto.symbol}
                                    className="h-4 w-4 rounded-full"
                                    width={26}
                                    height={26}
                                  />
                                )}
                                <span>
                                  {selectedCrypto.symbol} — {selectedCrypto.name}
                                </span>
                              </div>
                            ) : field.value ? (
                              field.value
                            ) : (
                              <span className="text-muted-foreground">
                                Search cryptocurrency…
                              </span>
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[420px] p-0">
                          <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 opacity-50" />
                            <Input
                              placeholder="Search crypto…"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="border-0 focus-visible:ring-0"
                            />
                          </div>
                          <ScrollArea className="h-[280px]">
                            {isSearching ? (
                              <div className="text-muted-foreground p-4 text-center text-sm">
                                Searching…
                              </div>
                            ) : cryptoOptions.length === 0 ? (
                              <div className="text-muted-foreground p-4 text-center text-sm">
                                Start typing to search
                              </div>
                            ) : (
                              <div className="p-1">
                                {cryptoOptions.map((coin) => (
                                  <Button
                                    key={coin.id}
                                    type="button"
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => handleCryptoSelect(coin)}
                                  >
                                    <div className="flex items-center gap-2">
                                      {coin.image && (
                                        <Image
                                          src={coin.image}
                                          alt={coin.symbol}
                                          className="h-5 w-5 rounded-full"
                                          width={26}
                                          height={26}
                                        />
                                      )}
                                      <div className="flex flex-col items-start">
                                        <span className="font-medium">
                                          {coin.symbol}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                          {coin.name}
                                        </span>
                                      </div>
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Input
                        placeholder="Enter stock ticker (e.g. NVDA)"
                        {...field}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                      {apiPrice && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title="Set last market price"
                          onClick={() => form.setValue("price", apiPrice)}
                        >
                          <SwitchCamera className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  {apiPrice && (
                    <p className="text-muted-foreground text-xs">
                      Price ${apiPrice.toFixed(2)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee */}
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Cash section */}
          <div className="bg-background space-y-4 rounded-2xl border p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Update cash balance</p>
                <p className="text-muted-foreground text-xs">
                  When enabled, the corresponding cash account will be updated.
                </p>
              </div>
              <Controller
                control={form.control}
                name="updateCash"
                render={({ field }) => (
                  <Switch
                    checked={
                      field.value &&
                      watchEntryType === "single" &&
                      watchType !== "revaluation"
                    }
                    disabled={
                      watchEntryType === "multiple" ||
                      watchType === "revaluation"
                    }
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                )}
              />
            </div>

            {watchUpdateCash &&
              watchEntryType === "single" &&
              watchType !== "revaluation" && (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Wallet */}
                  <FormField
                    control={form.control}
                    name="walletId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cash account</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(val) => field.onChange(Number(val))}
                            value={field.value ? String(field.value) : ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select cash account" />
                            </SelectTrigger>
                            <SelectContent>
                              {wallets.map((w) => (
                                <SelectItem key={w.id} value={String(w.id)}>
                                  {w.name} : {w.currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Exchange rate */}
                  <FormField
                    control={form.control}
                    name="exchangeRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exchange rate</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

            {watchUpdateCash && (
              <p className="text-muted-foreground text-xs">
                Currency rate:{" "}
                <span className="underline">
                  {watchExchangeRate ? watchExchangeRate.toFixed(3) : "—"}
                </span>
              </p>
            )}
          </div>

          {/* Summary + buttons */}
          <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground text-right text-sm sm:text-left">
              <div>
                Total amount:{" "}
                <span className="font-semibold">
                  ${Number.isFinite(totalAmount) ? totalAmount.toFixed(2) : "0"}
                </span>
              </div>
              {watchUpdateCash && (
                <div>
                  Cash balance change:{" "}
                  <span className="font-semibold">
                    {watchType === "buy" ? "-" : "+"}
                    {Number.isFinite(cashChange) ? cashChange.toFixed(2) : "0"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={form.formState.isSubmitting}
                onClick={form.handleSubmit((values) =>
                  handleSubmit(values, true),
                )}
              >
                Save and add more
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Add transaction
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

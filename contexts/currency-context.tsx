"use client";

import {
  convertCurrencyFromRates,
  ExchangeRates,
} from "@/lib/currency-converter";
import {
  isSupportedCurrency,
  SUPPORTED_CURRENCIES,
  SupportedCurrencyCode,
} from "@/lib/supportedCurrencies";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CurrencyContextValue = {
  selectedCurrency: SupportedCurrencyCode;
  setSelectedCurrency: (currency: SupportedCurrencyCode) => void;
  rates: ExchangeRates;
  isLoadingRates: boolean;
  convertAmount: (amount: number, fromCurrency: string) => number;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);
const STORAGE_KEY = "fintrack:selected-currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] =
    useState<SupportedCurrencyCode>("USD");
  const [rates, setRates] = useState<ExchangeRates>({ USD: 1 });
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isSupportedCurrency(saved)) {
      setSelectedCurrencyState(saved);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadRates() {
      try {
        const response = await fetch("/api/rates");
        const data = await response.json();
        if (!isMounted) return;

        if (response.ok && data?.conversion_rates) {
          setRates({
            USD: 1,
            ...(data.conversion_rates as ExchangeRates),
          });
        }
      } catch (error) {
        console.error("Failed to load exchange rates:", error);
      } finally {
        if (isMounted) {
          setIsLoadingRates(false);
        }
      }
    }

    loadRates();
    return () => {
      isMounted = false;
    };
  }, []);

  const setSelectedCurrency = useCallback((currency: SupportedCurrencyCode) => {
    setSelectedCurrencyState(currency);
    localStorage.setItem(STORAGE_KEY, currency);
  }, []);

  const convertAmount = useCallback(
    (amount: number, fromCurrency: string) =>
      convertCurrencyFromRates(amount, fromCurrency, selectedCurrency, rates),
    [rates, selectedCurrency],
  );

  const value = useMemo(
    () => ({
      selectedCurrency,
      setSelectedCurrency,
      rates,
      isLoadingRates,
      convertAmount,
    }),
    [
      selectedCurrency,
      setSelectedCurrency,
      rates,
      isLoadingRates,
      convertAmount,
    ],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}

export { SUPPORTED_CURRENCIES };

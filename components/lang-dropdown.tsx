"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const localeFlags: Record<string, string> = {
  en: "🇬🇧",
  uk: "🇺🇦",
  ru: "🏳️",
};

export function LanguageDropdown() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
      router.refresh();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center justify-center" variant="outline">
          <span className="text-3xl">{localeFlags[locale] || "🏳️"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={locale} onValueChange={switchLocale}>
          <DropdownMenuRadioItem value="en">
            <span className="text-2xl">🇬🇧</span> EN
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="uk">
            <span className="text-2xl">🇺🇦</span> UK
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ru">
            <span className="text-2xl">🏳️</span> RU
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NavbarMenu() {
  const t = useTranslations("navbar");
  return (
    <Menubar className="border-none bg-transparent">
      {/* Portfolios */}
      <MenubarMenu>
        <MenubarTrigger className="text-primary cursor-pointer">
          {t("portfolios")}
        </MenubarTrigger>

        <MenubarContent>
          <MenubarItem asChild>
            <Link href="/portfolio">{t("dashboard")}</Link>
          </MenubarItem>

          <MenubarItem asChild>
            <Link href="/portfolio/trades">{t("trades")}</Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* Net Worth */}
      <MenubarMenu>
        <MenubarTrigger className="text-primary cursor-pointer">
          {t("net-worth")}
        </MenubarTrigger>

        <MenubarContent>
          <MenubarItem asChild>
            <Link href="/net-worth/dashboard">Dashboard</Link>
          </MenubarItem>

          <MenubarItem asChild>
            <Link href="/net-worth/budget">{t("budget")}</Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

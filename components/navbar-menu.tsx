import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NavbarMenu() {
  const t = useTranslations("navbar");
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem className="relative">
          <NavigationMenuTrigger className="text-primary">
            {t("portfolios")}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink asChild>
              <Link href="/portfolio">{t("dashboard")}</Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link href="/portfolio/trades">{t("trades")}</Link>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="relative">
          <NavigationMenuTrigger className="text-primary">
            {t("net-worth")}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink asChild>
              <Link href="/net-worth/dashboard">Dashboard</Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link href="/net-worth/budget">{t("budget")}</Link>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

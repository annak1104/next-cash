"use client";

import { UserButton } from "@clerk/nextjs";
import { ChartColumnBigIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function UserDropdown() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <UserButton
      showName
      appearance={{
        elements: {
          userButtonOuterIdentifier: {
            color: "var(--primary)",
          },
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Action
          label="Change theme"
          labelIcon={theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          onClick={handleToggleTheme}
        />
      </UserButton.MenuItems>
      <UserButton.MenuItems>
        <UserButton.Action
          label="Dashboard"
          labelIcon={<ChartColumnBigIcon size={16} />}
          onClick={() => router.push("/portfolio")}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}

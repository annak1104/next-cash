"use client";

import { UserButton } from "@clerk/nextjs";
import { useTheme } from "@wrksz/themes/client";
import { ChartColumnBigIcon, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserDropdown() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <UserButton
      appearance={{
        elements: {
          userButtonOuterIdentifier: {
            color: "var(--primary)",
          },
          userButtonAvatarBox: {
            width: "2.5rem",
            height: "2.5rem",
            border: "1px solid var(--glass-border)",
            boxShadow: "var(--glass-shadow-soft)",
          },
          userButtonPopoverCard: {
            background: "var(--glass-strong)",
            border: "1px solid var(--glass-border)",
            borderRadius: "1.5rem",
            boxShadow: "var(--glass-shadow)",
            backdropFilter: "blur(var(--glass-blur)) saturate(180%)",
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

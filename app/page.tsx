import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ChartColumnBigIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex h-[calc(100vh-80px)] min-h-[400px] items-center justify-center bg-white">
      <div className="relative z-10 flex flex-col gap-4 text-center">
        <h1 className="flex items-center justify-center gap-1 text-5xl font-bold">
          <ChartColumnBigIcon className="text-lime-500" size={60} /> NextCash
        </h1>
        <p className="text-2xl">Track your finances with ease</p>
        <SignedIn>
          <Button asChild size="lg">
            <Link href="/dashboard">Go To Your Dashboard</Link>
          </Button>
        </SignedIn>
        <SignedOut>
          <div className="flex items-center justify-center gap-2">
            <Button asChild size="lg" className="bg-lime-600 hover:bg-lime-500">
              <SignInButton />
            </Button>
            <Button asChild size="lg">
              <SignUpButton />
            </Button>
          </div>
        </SignedOut>
      </div>
    </main>
  );
}

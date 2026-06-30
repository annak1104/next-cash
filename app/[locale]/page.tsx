import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ChartColumnBigIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("home");

  return (
    <div className="relative flex min-h-[calc(100vh-7rem)] items-center justify-center overflow-hidden">
      <div className="glass-card relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6 px-8 py-10 text-center sm:px-12">
        <h1 className="flex items-center justify-center gap-3 text-5xl font-bold tracking-[-0.06em] sm:text-6xl">
          <span className="glass-control text-primary flex size-16 items-center justify-center rounded-[1.4rem]">
            <ChartColumnBigIcon className="text-primary size-9" />
          </span>
          NextCash
        </h1>
        <p className="text-muted-foreground max-w-lg text-xl leading-relaxed sm:text-2xl">
          {t("header")}
        </p>
        <Show when="signed-in">
          <Button asChild size="lg">
            <Link href="/portfolio">{t("btn")}</Link>
          </Button>
        </Show>
        <Show when="signed-out">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <SignInButton />
            </Button>
            <Button asChild size="lg" variant="outline">
              <SignUpButton />
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
}

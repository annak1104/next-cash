CREATE TABLE "trades" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trades_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"portfolio_id" integer NOT NULL,
	"type" text NOT NULL,
	"assetType" text NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"quantity" numeric NOT NULL,
	"price" numeric NOT NULL,
	"fee" numeric,
	"total_value" numeric NOT NULL,
	"trade_date" date NOT NULL,
	"coin_gecko_id" text,
	"entryType" text DEFAULT 'single' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;
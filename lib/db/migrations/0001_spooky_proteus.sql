CREATE TABLE "farm_history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"plot_id" bigint,
	"year" integer NOT NULL,
	"tree_count" integer,
	"production_kg" numeric,
	"income" numeric,
	"expense" numeric,
	"fertilizer_cost" numeric,
	"chemical_cost" numeric,
	"labor_cost" numeric,
	"roi" numeric,
	"created_at" timestamp
);

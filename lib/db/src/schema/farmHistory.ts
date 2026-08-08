import {
  pgTable,
  bigserial,
  bigint,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

export const farmHistoryTable = pgTable("farm_history", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  plotId: bigint("plot_id", { mode: "number" }),

  year: integer("year").notNull(),

  treeCount: integer("tree_count"),

  productionKg: numeric("production_kg"),

  income: numeric("income"),

  expense: numeric("expense"),

  fertilizerCost: numeric("fertilizer_cost"),

  chemicalCost: numeric("chemical_cost"),

  laborCost: numeric("labor_cost"),

  roi: numeric("roi"),

  createdAt: timestamp("created_at"),
});
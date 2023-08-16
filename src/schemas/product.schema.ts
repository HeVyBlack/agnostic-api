import { z } from "zod";
import { Basic } from "./basic.schema.ts";

export const Product = Basic.extend({
  owner: z.string(),
  name: z.string(),
  price: z.string(),
  brand: z.string(),
});

export type Product = z.infer<typeof Product>;

export const Products = z.array(Product);

export type Products = z.infer<typeof Products>;

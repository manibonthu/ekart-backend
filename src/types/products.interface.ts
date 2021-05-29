import { model, Schema, Model, Document } from "mongoose";

export interface Product extends Document {
  name: string;
  category: string;
  description: number;
  available_quantity: number;
  store: string;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    available_quantity: { type: Number, required: true },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },
  },
  { versionKey: false }
);

export const ProductModel: Model<Product> = model("Product", ProductSchema);

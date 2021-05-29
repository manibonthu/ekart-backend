import { model, Schema, Model, Document } from "mongoose";
import { Product } from "./products.interface";
import { SubUser } from "./sub-user.intreface";

export interface Store extends Document {
  name: string;
  location: string;
  phone: number;
  products: Product[];
  users: SubUser[];
}

const StoreSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: Number, required: true },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    users: [
      {
        type: Schema.Types.String,
        ref: "User",
      },
    ],
  },
  { versionKey: false }
);

export const StoreModel: Model<Store> = model("Store", StoreSchema);

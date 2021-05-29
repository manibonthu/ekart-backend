import { Roles } from "./roles.interface";
import { IUser } from "./user.interface";
import { model, Schema, Model, Document } from "mongoose";
import validator from "validator";
import { genSalt, hash, compare } from "bcrypt";
import { Store } from "./store.interface";

export interface SubUser extends IUser, Document {
  role: Roles.USER;
  store?: string;
}

const SubUserSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, "Invalid Email"],
    },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: Roles.USER },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },
  },
  { _id: false, versionKey: false }
);

SubUserSchema.pre<SubUser>("save", async function save(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

SubUserSchema.methods.comparePassword = function (candidatePassword, cb) {
  // @ts-expect-error
  compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

// export const UserModel: Model<SubUser> = model('User', SubUserSchema);

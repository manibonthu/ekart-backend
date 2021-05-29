import { Roles } from "./roles.interface";
import { IUser } from "./user.interface";
import { model, Schema, Model, Document } from "mongoose";
import validator from "validator";
import { compare, genSalt, hash } from "bcrypt";

export interface AdminUser extends IUser, Document {
  role?: Roles;
  comparePassword(password: string, cb: any): boolean;
  store: string;
}

const AdminSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, "Invalid Email"],
      createIndexes: { unique: true },
    },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    store: { type: String },
  },
  { _id: false, versionKey: false }
);

AdminSchema.pre<AdminUser>("save", async function save(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

AdminSchema.methods.comparePassword = function (candidatePassword, cb) {
  // @ts-expect-error
  compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

export const UserModel: Model<AdminUser> = model("User", AdminSchema);

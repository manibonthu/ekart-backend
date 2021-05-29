import { Unauthorized } from "http-errors";
import { sign, verify } from "jsonwebtoken";
import { AdminUser } from "../types/admin.interface";
import { Roles } from "../types/roles.interface";

const secret = process.env.SECRET || "mytestsecret";
export const generateToken = (data: any): string => {
  return sign(data, secret, { expiresIn: "1h" });
};

export const validateToken = (token: string): any => {
  try {
    return verify(token, secret);
  } catch (e) {
    throw new Unauthorized("Session Expired");
  }
};

export const isAdmin = (user: AdminUser): boolean => {
  return user.role === Roles.ADMIN;
};

export const isAdminOrUser = (user: AdminUser): boolean => {
  return user.role === Roles.ADMIN || user.role === Roles.USER;
};

import { AdminUser, UserModel } from "../types/admin.interface";
import { logger } from "../utils/logger";
import "reflect-metadata";
import { injectable } from "inversify";
import { BadRequest } from "http-errors";
import { StoreModel } from "../types/store.interface";
import { Roles } from "../types/roles.interface";

export interface AdminService {
  createAdmin(admin: AdminUser): Promise<AdminUser>;
  login(data: { email: string; password: string }): Promise<AdminUser>;
  createSubUser(user: AdminUser): Promise<AdminUser>;
  deleteSubUser(id: string): Promise<AdminUser | null>;
  updateSubUser(id: string, body: AdminUser): Promise<AdminUser | null>;
  getUsers(): Promise<AdminUser[] | null>;
}

@injectable()
export class AdminServiceImpl implements AdminService {
  public login(data: { email: string; password: string }): Promise<AdminUser> {
    return new Promise(async (resolve, reject) => {
      try {
        const user: any = await UserModel.findOne({ email: data.email });
        if (!user) {
          reject(new BadRequest("The username does not exist"));
        }
        user.comparePassword(data.password, (error: Error, match: any) => {
          if (!match) {
            reject(new BadRequest("The password is invalid"));
          } else {
            const data = user.toJSON();
            delete data.password;
            resolve(data);
          }
        });
      } catch (e) {
        logger.error("Error occured while login", e);
      }
    });
  }

  public createAdmin(admin: AdminUser): Promise<AdminUser> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = new UserModel({
          _id: admin.email,
          role: Roles.ADMIN,
          ...admin,
        });

        resolve(await result.save());
      } catch (e) {
        logger.error("Error occured while creating admin user", e);
        reject(e);
      }
    });
  }

  public createSubUser(user: AdminUser): Promise<AdminUser> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = new UserModel({
          _id: user.email,
          role: Roles.USER,
          ...user,
        });
        if (result.store) {
          await StoreModel.findByIdAndUpdate(
            user.store,
            {
              $push: { users: result.id },
            },
            { new: true, useFindAndModify: false }
          );
        }
        resolve(await result.save());
      } catch (e) {
        logger.error("Error occured while creating usb user", e);
        reject(e);
      }
    });
  }

  public deleteSubUser(id: string): Promise<AdminUser | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await UserModel.findByIdAndDelete(id);
        await StoreModel.updateMany(
          { users: { $in: [result?.id] } },
          { $pull: { users: result?.id } }
        );
        resolve(result);
      } catch (e) {
        logger.error(`Error occured while deleting sub user ${id}`, e);
        reject(e);
      }
    });
  }

  public updateSubUser(id: string, body: AdminUser): Promise<AdminUser | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const intialUser = await UserModel.findById(id);
        const result = await UserModel.findByIdAndUpdate(id, body);
        if (intialUser?.store !== body.store) {
          await StoreModel.updateMany(
            { users: { $in: [result?.id] } },
            { $pull: { users: result?.id } }
          );
          await StoreModel.findByIdAndUpdate(
            body.store,
            {
              $push: { users: id },
            },
            { new: true, useFindAndModify: false }
          );
        }

        resolve(result);
      } catch (e) {
        logger.error(`Error occured while updating sub user ${id}`, e);
        reject(e);
      }
    });
  }

  public getUsers(): Promise<AdminUser[] | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await UserModel.find(
          { role: Roles.USER },
          { password: 0 }
        );
        resolve(result);
      } catch (e) {
        logger.error("Error occured while reading users", e);
        reject(e);
      }
    });
  }
}

import { logger } from "../utils/logger";
import "reflect-metadata";
import { injectable } from "inversify";
import { ProductModel } from "../types/products.interface";
import { Store, StoreModel } from "../types/store.interface";

export interface StoreService {
  createStore(store: Store): Promise<Store>;
  getStoreById(id: string): Promise<Store | null>;
  getStore(): Promise<Store[]>;
  deleteStoreById(id: string): Promise<Store | null>;
  updateStore(id: string, store: Store): Promise<Store | null>;
}

@injectable()
export class StoreServiceImpl implements StoreService {
  public createStore(store: Store): Promise<Store> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = new StoreModel(store);
        logger.debug("Added new store");
        resolve(await result.save());
      } catch (e) {
        logger.debug("error occured while creating store", e);
        reject(e);
      }
    });
  }

  public getStore(): Promise<Store[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await StoreModel.find({})
          .populate("products")
          .populate("users", "email")
          .exec();
        resolve(result);
      } catch (e) {
        logger.debug("error occured while reading stores", e);
        reject(e);
      }
    });
  }

  public getStoreById(id: string): Promise<Store | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await StoreModel.findById(id)
          .populate("products")
          .populate("users", "email")
          .exec();
        resolve(result);
      } catch (e) {
        logger.debug(`error occured while reading store ${id}`, e);
        reject(e);
      }
    });
  }

  public deleteStoreById(id: string): Promise<Store | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await StoreModel.findByIdAndDelete(id);
        await ProductModel.deleteMany({ store: id });
        resolve(result);
      } catch (e) {
        logger.debug(`error occured while deleting store ${id}`, e);
        reject(e);
      }
    });
  }

  public updateStore(id: string, store: Store): Promise<Store | null> {
    return new Promise((resolve, reject) => {
      try {
        const result = StoreModel.findByIdAndUpdate(id, store);
        resolve(result);
      } catch (err) {
        logger.debug(`error occured while updating store ${id}`, err);
        reject(err);
      }
    });
  }
}

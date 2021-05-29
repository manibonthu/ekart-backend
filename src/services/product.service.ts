import { Request, Response, NextFunction } from "express";
import { AdminUser, UserModel } from "../types/admin.interface";
import { logger } from "../utils/logger";
import "reflect-metadata";
import { injectable } from "inversify";
import { Product, ProductModel } from "../types/products.interface";
import { StoreModel } from "../types/store.interface";

export interface ProductService {
  createProduct(product: Product): Promise<Product>;
  getProducts(): Promise<Product[]>;
  getProductsById(id: string): Promise<Product | null>;
  deleteProductById(id: string): Promise<Product | null>;

  updateProduct(id: string, product: Product): Promise<Product | null>;
  hasAccessToProduct(id: string, user: AdminUser): Promise<boolean>;
}

@injectable()
export class ProductServiceImpl implements ProductService {
  public createProduct(product: Product): Promise<Product> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = new ProductModel(product);
        await StoreModel.findByIdAndUpdate(
          result.store,
          {
            $push: { products: result.id },
          },
          { new: true, useFindAndModify: false }
        );
        logger.debug("New product created");
        resolve(await result.save());
      } catch (e) {
        logger.debug("error occured while creating new product", e);
        reject(e);
      }
    });
  }

  public getProducts(): Promise<Product[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await ProductModel.find({}).populate("store");
        resolve(result);
      } catch (e) {
        logger.debug("error occured while reading products from DB", e);
        reject(e);
      }
    });
  }

  public getProductsById(id: string): Promise<Product | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await ProductModel.findById(id);
        resolve(result);
      } catch (e) {
        logger.debug(`error occured while reading productid ${id} from DB`, e);
        reject(e);
      }
    });
  }

  public deleteProductById(id: string): Promise<Product | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await ProductModel.findByIdAndDelete(id);
        await StoreModel.updateMany(
          { _id: result?.store },
          { $pull: { products: result?.id } }
        );
        resolve(result);
      } catch (e) {
        logger.debug(`error occured while deleting product ${id} from DB`, e);
        reject(e);
      }
    });
  }

  public updateProduct(id: string, product: Product): Promise<Product | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await ProductModel.findByIdAndUpdate(id, product);
        resolve(result);
      } catch (e) {
        logger.debug(`error occured while updating product ${id} from DB`, e);
        reject(e);
      }
    });
  }

  public hasAccessToProduct(id: string, user: AdminUser): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const result = ProductModel.find({
          _id: id,
          store: user.store,
        });
        if (result) {
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        logger.debug("you dont have access to view this products", err);
        reject(err);
      }
    });
  }
}

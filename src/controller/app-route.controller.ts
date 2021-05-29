import { Router, Request, Response, NextFunction, Application } from "express";
import { inject, injectable } from "inversify";
import { RoutesController } from "./routes.controller";
import "reflect-metadata";
import TYPES from "../types/type";
import { AdminServiceImpl } from "../services/admin.service";
import { logger } from "../utils/logger";
import {
  generateToken,
  isAdmin,
  isAdminOrUser,
  validateToken,
} from "../utils/auth.utils";
import { InternalServerError, Unauthorized } from "http-errors";
import { Roles } from "../types/roles.interface";
import { AdminUser } from "../types/admin.interface";
import { ProductServiceImpl } from "../services/product.service";
import { StoreServiceImpl } from "../services/store.service";

@injectable()
export class AppRouteController implements RoutesController {
  constructor(
    @inject(TYPES.AdminService)
    private adminServiceImpl: AdminServiceImpl,
    @inject(TYPES.ProductService)
    private productServiceImpl: ProductServiceImpl,
    @inject(TYPES.StoreService)
    private storeServiceImpl: StoreServiceImpl
  ) {}
  public register(app: Application): void {
    app
      .route("/admin/signup")
      .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
          await this.adminServiceImpl.createAdmin(req.body);
          res.json({ msg: "Admin User Created" });
        } catch (e) {
          logger.error(e);
          next(e);
        }
      });

    app
      .route("/login")
      .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
          let result = await this.adminServiceImpl.login(req.body);
          const token = generateToken(result);
          res.setHeader("token", token);
          res.cookie("token", token, {
            domain: "127.0.0.1:4200",
            maxAge: Math.floor(Date.now() / 1000) + 60 * 60,
            httpOnly: true,
          });
          res.json({ token: token, ...result });
        } catch (e) {
          next(e);
        }
      });

    app.use((req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers["authorization"];
      const token: any = authHeader && authHeader.split(" ")[1];
      const result = validateToken(token);
      res.locals.user = result;
      next();
    });

    app
      .route("/product")
      .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const hasAccess = isAdmin(res.locals.user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          let result = await this.productServiceImpl.createProduct(req.body);
          res.json(result);
        } catch (e) {
          next(e);
        }
      })
      .get(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const user: AdminUser = res.locals.user;
          const hasAccess = isAdminOrUser(user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          if (user.role === Roles.ADMIN) {
            let result = await this.productServiceImpl.getProducts();
            res.json(result);
          } else {
            if (!user.store) {
              throw new Unauthorized("You dont have access to stores");
            }
            let accesstoProduct =
              await this.productServiceImpl.hasAccessToProduct(
                req.params.id,
                user
              );
            if (accesstoProduct) {
              const result = this.productServiceImpl.updateProduct(
                req.params.id,
                req.body
              );
              res.json(result);
            } else {
              throw new Unauthorized("you dont have access to this Product");
            }
          }
          let result = await this.productServiceImpl.getProducts();
          res.json(result);
        } catch (e) {
          next(e);
        }
      });
    app
      .route("/product/:id")
      .get(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const hasAccess = isAdminOrUser(res.locals.user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          let result = await this.productServiceImpl.getProductsById(
            req.params.id
          );
          res.json(result);
        } catch (e) {
          next(e);
        }
      })
      .delete(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const hasAccess = isAdmin(res.locals.user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          let result = await this.productServiceImpl.deleteProductById(
            req.params.id
          );
          res.json(result);
        } catch (e) {
          next(e);
        }
      })
      .put(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const user: AdminUser = res.locals.user;
          const hasAccess = isAdminOrUser(user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          if (user.role === Roles.ADMIN) {
            let result = await this.productServiceImpl.updateProduct(
              req.params.id,
              req.body
            );
            res.json(result);
          } else {
            if (!user.store) {
              throw new Unauthorized("You dont have access to stores");
            }
            let accesstoProduct =
              await this.productServiceImpl.hasAccessToProduct(
                req.params.id,
                user
              );
            if (accesstoProduct) {
              const result = this.productServiceImpl.updateProduct(
                req.params.id,
                req.body
              );
              res.json(result);
            } else {
              throw new Unauthorized("you dont have access to this Product");
            }
          }
        } catch (e) {
          next(e);
        }
      });
    /* store routes */
    app
      .route("/store")
      .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const hasAccess = isAdmin(res.locals.user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          let result = await this.storeServiceImpl.createStore(req.body);
          res.json(result);
        } catch (e) {
          next(e);
        }
      })
      .get(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const user: AdminUser = res.locals.user;
          const hasAccess = isAdminOrUser(user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          if (user.role === Roles.ADMIN) {
            let result = await this.storeServiceImpl.getStore();
            res.json(result);
          } else {
            if (!user.store) {
              throw new Unauthorized("You dont have access to stores");
            }
            let result = await this.storeServiceImpl.getStoreById(user.store);
            if (result) {
              res.json([result]);
            } else {
              res.json([]);
            }
          }
        } catch (e) {
          next(e);
        }
      });
    app
      .route("/store/:id")
      .get(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const hasAccess = isAdminOrUser(res.locals.user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }

          let result = await this.storeServiceImpl.getStoreById(req.params.id);
          res.json(result);
        } catch (e) {
          next(e);
        }
      })
      .delete(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const hasAccess = isAdmin(res.locals.user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          let result = await this.storeServiceImpl.deleteStoreById(
            req.params.id
          );
          res.json(result);
        } catch (e) {
          next(e);
        }
      })
      .put(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const user: AdminUser = res.locals.user;
          const hasAccess = isAdmin(user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }

          let result = await this.storeServiceImpl.updateStore(
            req.params.id,
            req.body
          );
          res.json(result);
        } catch (e) {
          next(e);
        }
      });
    /* User routes */
    app
      .route("/user/signup")
      .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const hasAccess = isAdmin(res.locals.user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          let result: any = (
            await this.adminServiceImpl.createSubUser(req.body)
          ).toJSON();
          delete result.password;
          res.json(result);
        } catch (e) {
          next(e);
        }
      });

    app
      .route("/user")
      .get(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const hasAccess = isAdmin(res.locals.user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          let result = await this.adminServiceImpl.getUsers();
          res.json(result);
        } catch (e) {
          next(e);
        }
      });

    app
      .route("/user/:id")
      .delete(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const hasAccess = isAdmin(res.locals.user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          let result = await this.adminServiceImpl.deleteSubUser(req.params.id);
          res.send({ msg: "User deleted" });
        } catch (e) {
          next(e);
        }
      })
      .put(async (req: Request, res: Response, next: NextFunction) => {
        try {
          const hasAccess = isAdmin(res.locals.user);
          if (!hasAccess) {
            throw new Unauthorized("You dont have access to this operation");
          }
          let result = await this.adminServiceImpl.updateSubUser(
            req.params.id,
            req.body
          );
          res.send({ msg: "User Updated " });
        } catch (e) {
          next(e);
        }
      });
  }
}

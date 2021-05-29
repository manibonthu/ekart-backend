import { Container } from "inversify";
import { AppRouteController } from "./controller/app-route.controller";
import { AdminServiceImpl, AdminService } from "./services/admin.service";
import { ProductService, ProductServiceImpl } from "./services/product.service";
import { StoreService, StoreServiceImpl } from "./services/store.service";
import TYPES from "./types/type";

const container = new Container();
container
  .bind<AppRouteController>(TYPES.Controller)
  .to(AppRouteController)
  .inRequestScope();
container
  .bind<AdminService>(TYPES.AdminService)
  .to(AdminServiceImpl)
  .inSingletonScope();
container
  .bind<ProductService>(TYPES.ProductService)
  .to(ProductServiceImpl)
  .inSingletonScope();
container
  .bind<StoreService>(TYPES.StoreService)
  .to(StoreServiceImpl)
  .inSingletonScope();

export default container;

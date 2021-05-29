import * as express from "express";

export interface RoutesController {
  register(app: express.Application): void;
}

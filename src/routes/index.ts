import { Router } from "express";
import msgCode from "../compoents/msgcode";
import apiRouter from "../routes/api";
import serverRouter from "../routes/server";
import systemRouter from "../routes/system";

/**
 * 基础路由
 *
 * @class BaseRouter
 */
class BaseRouter {
  public router: Router = Router();
  constructor() {
    this.init();
  }
  private init() {
    this.router.get("/", (req, res, next) => {
      res.json(msgCode.invalidRequest);
    });
    this.router.use("/admin/server", serverRouter);
    this.router.use("/admin/system", systemRouter);
    this.router.use("/api", apiRouter);
  }
}

export default new BaseRouter().router;

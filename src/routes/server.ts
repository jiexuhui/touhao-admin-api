import { Router } from "express";
import server from "../controller/server";

/**
 * 与服务端交互
 *
 * @class UserRouter
 */
class ServerRouter {
  public router: Router = Router();
  constructor() {
    this.init();
  }
  private init() {
    this.router.post("/tags", server.tags)
    .post("/addtag", server.addtag)
    .post("/deltag", server.deltag);
  }
}

export default new ServerRouter().router;

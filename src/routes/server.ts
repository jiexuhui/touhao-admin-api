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
    this.router.post("/cards_order", server.cardsOrder);
  }
}

export default new ServerRouter().router;

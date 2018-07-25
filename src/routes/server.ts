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
    this.router
      .post("/tags", server.tags)
      .post("/addtag", server.addtag)
      .post("/deltag", server.deltag)
      .post("/goodstypes", server.goodstypes)
      .post("/addgoodstype", server.addgoodstype)
      .post("/editgoodstype", server.editgoodstype)
      .post("/delgoodstype", server.delgoodstype)
      .post("/goods", server.goods)
      .post("/addgoods", server.addgoods)
      .post("/editgoods", server.editgoods)
      .post("/delgoods", server.delgoods)
      .post("/upload", server.upload)
      .post("/applys", server.applys)
      .post("/updateapply", server.updateapply)
      .post("/reports", server.reports)
      .post("/addreport", server.addreport)
      .post("/anchors", server.anchors)
      .post("/anchorreview", server.anchorreview)
      .post("/classify", server.classify)
      .post("/addclassify", server.addclassify)
      .post("/editclassify", server.editclassify)
      .post("/delclassify", server.delclassify)
      .post("/goodsdetail", server.goodsdetail);
  }
}

export default new ServerRouter().router;

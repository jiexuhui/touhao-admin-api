import { Router } from "express";
import api from "../controller/api";

/**
 * 与服务端交互
 *
 * @class UserRouter
 */
class ApiRouter {
  public router: Router = Router();
  constructor() {
    this.init();
  }
  private init() {
    this.router
      .post("/loginByWeixin", api.loginByWeixin)
      .post("/saveuserinfo", api.saveuserinfo)
      .post("/userreports", api.userreports)
      .post("/reportdetail", api.reportdetail)
      .post("/goodslist", api.goodslist)
      .post("/addcheckedlist", api.addcheckedlist)
      .post("/checkedgoods", api.checkedgoods)
      .post("/delcheckedgoods", api.delcheckedgoods)
      .post("/applyprogram", api.applyprogram)
      .post("/cateloglist", api.cateloglist)
      .post("/userprograms", api.userprograms)
      .post("/programgoods", api.programgoods)
      .post("/invalidprogram", api.invalidprogram)
      .post("/searchindex", api.searchindex)
      .post("/goodsstore", api.goodsstore);
  }
}

export default new ApiRouter().router;

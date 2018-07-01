import { Router } from "express";
import system from "../controller/system";

/**
 * 后台总体设置路由
 *
 * @class SystemRouter
 */
class SystemRouter {
  public router: Router = Router();
  constructor() {
    this.init();
  }
  private init() {
    this.router
      .post("/login", system.login)
      .get("/userinfo", system.userinfo)
      .post("/logout", system.logout)
      .post("/loginlogslist", system.loginLogsList)
      .post("/usermenu", system.userMenu)
      .post("/modifyrolesmenu", system.modifyRolesMenu)
      .get("/roles", system.roles)
      .post("/delrole", system.delRole)
      .post("/addrole", system.addRole)
      .post("/editrole", system.editRole)
      .get("/menulistsimple", system.menuListSimple)
      .get("/users", system.users)
      .post("/addsystemuser", system.addSystemUser)
      .post("/editsystemuser", system.editSystemUser)
      .post("/operatelogs", system.operatelogs)
      .post("/menus", system.menus)
      .post("/addmenu", system.addmenu)
      .post("/editmenu", system.editmenu)
      .post("/delmenu", system.delmenu)
      .post("/defaultcheck", system.defaultcheck)
      .post("/userpermission", system.userpermission)
      .post("/loginlogs", system.loginlogs);
  }
}

export default new SystemRouter().router;

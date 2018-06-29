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
      .get("/roleslist", system.rolesList)
      .post("/delrole", system.delRole)
      .post("/addrole", system.addRole)
      .post("/editrole", system.editRole)
      .get("/usersrole", system.usersRole)
      .post("/addusersrole", system.addUserRole)
      .get("/menulist", system.menuList)
      .get("/menulistsimple", system.menuListSimple)
      .get("/systemuser", system.systemUser)
      .post("/addsystemuser", system.addSystemUser)
      .post("/editsystemuser", system.editSystemUser);
  }
}

export default new SystemRouter().router;

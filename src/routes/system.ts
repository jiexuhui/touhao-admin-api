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
      .get("/logout", system.logout)
      .post("/loginlogslist", system.loginLogsList)
      .get("/rolesmenu", system.rolesMenu)
      .post("/modifyrolesmenu", system.modifyRolesMenu)
      .get("/roleslist", system.rolesList)
      .post("/delrole", system.delRole)
      .post("/addrole", system.addRole)
      .post("/editrole", system.editRole)
      .get("/usersrole", system.usersRole)
      .post("/addusersrole", system.addUserRole)
      .get("/menulist", system.menuList)
      .get("/menulistsimple", system.menuListSimple)
      .get("/usersmenu", system.usersMenu)
      .get("/systemuser", system.systemUser)
      .post("/addsystemuser", system.addSystemUser)
      .get("/positionlist", system.positionList)
      .get("/departmentlist", system.departmentList);
  }
}

export default new SystemRouter().router;

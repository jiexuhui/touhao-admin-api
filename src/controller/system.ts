import { NextFunction, Request, Response } from "express";
import * as fs from "fs";
import * as jw from "jsonwebtoken";
import * as _ from "lodash";
import * as path from "path";

import * as debug from "debug";
import { md5 } from "../compoents/crypto";
import msgCode from "../compoents/msgcode";
import Tools from "../compoents/tools";
import { ILoginUser } from "../interface/loginusers";
import dbSystem from "../service/system";

// 密码加盐，在客户端传过来的加盐基础上，再次加盐
const saltStart = "08x7wjabyr9wersa";
const saltEnd = "br6jddpv20gnuc3m";

/**
 * 系统模块
 *
 * @class System
 */
class System {
  public static debuglog = debug("api:system:login");
  /**
   * 登录逻辑处理
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async login(req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body;
    if (username && password) {
      const newpwd = md5(`${saltStart}.${password}.${saltEnd}`);
      const loginResult: any = await dbSystem
        .login(username, newpwd)
        .catch(err => next(err));
      debug("api:login:user")("username:" + username + "pwd:" + password);
      const loginInfo = loginResult[0];
      // const loginInfo: ILoginUser = Tools.handleResultOne(loginResult);
      if (loginInfo && loginInfo.userid) {
        debug("api:login:session1")("%o", req.session.user);
        req.session.user = loginInfo;
        debug("api:login:session2")("session:%o", req.session.user);
        try {
          // 读取加密私有key
          // 秘钥位数：1024bit,秘钥格式：PKCS#8,证书密码：无
          // 如修改请自行使用openssl命令生成密钥对
          const cert = fs.readFileSync(
            path.join(__dirname, "../configs/rsakey/rsa_key_pri.key")
          );
          // 设置token过期时间为24小时，加密方式RSA SHA256

          loginInfo.token = jw.sign(
            JSON.parse(JSON.stringify(loginInfo)),
            cert,
            {
              expiresIn: "24h",
              algorithm: "RS256"
            }
          );
          dbSystem
            .loginLog(
              loginInfo.userid,
              loginInfo.username,
              req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip
            )
            .catch(err => next(err));
          msgCode.success.data = loginInfo.token;
          res.json(msgCode.success);
          return;
        } catch (error) {
          next(error);
        }
      } else {
        res.json(msgCode.invalidUser);
        return;
      }
    } else {
      res.json(msgCode.parmasError);
      return;
    }
  }

  /**
   * 后台登录记录列表
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   * @memberof System
   */
  public static async loginLogsList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { username = "", time = [], pageindex = 1, pagesize = 30 } = req.body;
    await dbSystem
      .loginLogsList(
        _.trim(username),
        time[0] || "",
        time[1] || "",
        pageindex,
        pagesize
      )
      .then(data => {
        if (data && data.length > 0) {
          msgCode.success.data = data;
          res.json(msgCode.success);
          return;
        }
        res.json(msgCode.successWithoutData);
      })
      .catch(err => next(err));
  }

  public static async userinfo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const token = req.query.token;
    // 读取公钥，解密发来的token信息
    const cert = fs.readFileSync(
      path.join(__dirname, "../configs/rsakey/rsa_key_pub.key")
    );
    jw.verify(token, cert, (err: jw.JsonWebTokenError, decoded: any) => {
      if (err) {
        debug("api:system:login")("error: " + err.message);
        res.json(msgCode.expiredToken);
        return;
      }
      if (decoded) {
        debug("api:system:login")("decoded:%o ", decoded);
        const userinfo = decoded;
        // TODO:依次判断用户的信息、菜单权限、接口权限、按钮权限
        msgCode.success.data = userinfo;
        res.json(msgCode.success);
        return;
      } else {
        res.json(msgCode.invalidToken);
        return;
      }
    });
  }

  /**
   * 注销登录
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async logout(req: Request, res: Response, next: NextFunction) {
    req.session.destroy(err => {
      if (err) {
        res.json(msgCode.exception);
        return;
      }
      res.json(msgCode.success);
    });
  }

  /**
   * 获取菜单列表
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async menuList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const menuData: any = await dbSystem
      .menuList()
      .then(data => Tools.handleResult(data))
      .catch(err => next(err));
    const menuJson = await System.buildMenuSimple(menuData);
    if (menuJson) {
      msgCode.success.data = menuJson;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.successWithoutData);
    }
  }

  /**
   * 获得精简的菜单数据
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async menuListSimple(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const menuData: any = await dbSystem
      .menuListSimple()
      .then(data => Tools.handleResult(data))
      .catch(err => next(err));
    const menuJson = await System.buildMenuSimple(menuData);
    if (menuJson) {
      msgCode.success.data = menuJson;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.successWithoutData);
    }
  }

  /**
   * 角色菜单列表
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async rolesMenu(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const role: number = req.query.roleid || 0;
    if (role && role > 0) {
      const menuData = await dbSystem
        .rolesMenu(role)
        .then(data => Tools.handleResult(data))
        .catch(err => next(err));

      // const menuJson = await System.buildMenuSimple(menuData).catch(err => next(err));
      // if (menuJson) {
      //   msgCode.success.data = menuJson;
      //   res.json(msgCode.success);
      // } else {
      //   res.json(msgCode.successWithoutData);
      // }
      const simpleMenu = [];
      for (const m of menuData) {
        if (m.show) {
          simpleMenu.push({ id: m.id, title: m.title, parentid: m.parentid });
        }
      }
      msgCode.success.data = simpleMenu;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.parmasError);
    }
  }

  /**
   * 修改角色的菜单信息
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   * @memberof System
   */
  public static async modifyRolesMenu(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const roleid: number = req.body.roleid || 0;
    const oldMenus = req.body.oldMenus || [];
    const newMenus = req.body.newMenus || [];
    let newAuthority = [];
    if (roleid === 0) {
      res.json(msgCode.parmasError);
      return;
    }

    if (oldMenus.length > newMenus.length) {
      newAuthority = _.difference(oldMenus, newMenus);
      for (const au of newAuthority) {
        await dbSystem.modifyRolesMenu(roleid, au, "DEL");
      }
    } else {
      newAuthority = _.difference(newMenus, oldMenus);
      for (const au of newAuthority) {
        await dbSystem.modifyRolesMenu(roleid, au, "ADD");
      }
    }

    res.json(msgCode.success);
  }

  /**
   * 获取所有角色列表
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async rolesList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    await dbSystem
      .rolesList()
      .then(data => {
        msgCode.success.data = Tools.handleResult(data);
        res.json(msgCode.success);
      })
      .catch(err => next(err));
  }

  /**
   * 删除某个角色
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async delRole(req: Request, res: Response, next: NextFunction) {
    const { roleid = 0 } = req.body;
    await dbSystem
      .delRole(roleid)
      .then((data: any) => res.json(Tools.handleResult(data)))
      .catch(err => next(err));
  }

  /**
   * 添加角色
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async addRole(req: Request, res: Response, next: NextFunction) {
    const { name = "", is_use = 1, sort = 0 } = req.body;
    if (!name) {
      res.json(msgCode.parmasError);
      return;
    }
    await dbSystem
      .addRole(_.trim(name), is_use, sort)
      .then((data: any) => res.json(Tools.handleResult(data)))
      .catch(err => next(err));
  }

  /**
   * 编辑角色
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async editRole(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id = 0, name = "", is_use = 1, sort = 0 } = req.body;
    if (!name || id === 0) {
      res.json(msgCode.parmasError);
      return;
    }
    await dbSystem
      .editRole(id, _.trim(name), is_use, sort)
      .then(data => res.json(Tools.handleResult(data)))
      .catch(err => next(err));
  }

  /**
   * 用户角色
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async usersRole(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const userid: number = req.query.userid || 0;
    if (userid && userid > 0) {
      await dbSystem
        .usersRole(userid)
        .then(data => {
          msgCode.success.data = Tools.handleResult(data);
          res.json(msgCode.success);
        })
        .catch(err => next(err));
    } else {
      res.json(msgCode.parmasError);
    }
  }

  /**
   * 添加用户角色
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   * @memberof System
   */
  public static async addUserRole(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { userid = 0, roleid = [] } = req.body;
    if (!userid || !roleid) {
      res.json(msgCode.parmasError);
      return;
    }
    for (const r of roleid) {
      await dbSystem.addUserRole(userid, r);
    }
    res.json(msgCode.success);
  }

  /**
   * 用户菜单
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async usersMenu(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const userid: number = req.query.userid || 0;
    if (userid && userid > 0) {
      const usersRole = await dbSystem
        .usersRole(userid)
        .catch(err => next(err));
      const roleItem = Tools.handleResult(usersRole);
      const usersMenu = [];
      for (const r of roleItem) {
        const roleMenu = await dbSystem
          .rolesMenu(r.roleid)
          .catch(err => next(err));
        usersMenu.push(...Tools.handleResult(roleMenu));
      }
      const idArr: number[] = [];
      usersMenu.map((menu, index) => {
        if (idArr.indexOf(menu.id) < 0) {
          idArr.push(menu.id);
        } else {
          usersMenu.splice(index, 1);
        }
      });
      msgCode.success.data = await System.buildMenu(usersMenu);
      res.json(msgCode.success);
    } else {
      res.json(msgCode.parmasError);
    }
  }

  /**
   * 获取后台用户列表
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async systemUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { username = "", pageindex = 1, pagesize = 30 } = req.query;
    await dbSystem
      .systemUser(username, pageindex, pagesize)
      .then(data => {
        if (data && data.length > 0) {
          msgCode.success.data = data;
          res.json(msgCode.success);
          return;
        }
        res.json(msgCode.successWithoutData);
      })
      .catch(err => next(err));
  }

  /**
   * 添加系统用户
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async addSystemUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const reqData = req.body;
    reqData.password = md5(`${saltStart}.${reqData.password}.${saltEnd}`);
    reqData.department = parseInt(reqData.department.splice(-1), 10);
    const role: number[] = req.body.role;
    const addResult: any = await dbSystem
      .addSystemUser(reqData)
      .then(data => Tools.handleResult(data))
      .catch(err => next(err));
    if (addResult && addResult.id) {
      for (const r of role) {
        await dbSystem
          .addUserRole(addResult.id, r)
          .then((data: any) => Tools.handleResult(data))
          .catch(err => next(err));
      }
      res.json(msgCode.success);
    } else {
      res.json(msgCode.exception);
    }
  }

  /**
   * 获取职位列表
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async positionList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const data = await dbSystem.positionList().catch(err => next(err));
    msgCode.success.data = Tools.handleResult(data);
    res.json(msgCode.success);
  }

  /**
   * 获取组织架构
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async departmentList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const data: any = await dbSystem.departmentList().catch(err => next(err));
    const department = Tools.handleResult(data);
    if (department && department.length > 0) {
      const dep = [];
      for (const m of department) {
        if (m.parentid === 0) {
          System.buildTree(m, department);
          dep.push(m);
        }
      }
      msgCode.success.data = dep;
      res.json(msgCode.success);
    }
  }

  /**
   * 递归生成菜单树
   *
   * @private
   * @static
   * @param {any} m
   * @param {any} menus
   * @memberof System
   */
  private static buildTree(m: any, menus: any) {
    for (const menu of menus) {
      if (menu.parentid === m.id) {
        if (!m.children) {
          m.children = [];
        }
        m.children.push(menu);
        this.buildTree(menu, menus);
      }
    }
  }

  /**
   * 构建菜单，主要为了路由使用
   *
   * @private
   * @static
   * @param {any} menus
   * @returns
   * @memberof System
   */
  private static buildMenu(menus: any) {
    const menu = [];
    for (const m of menus) {
      const { title, icon, describe, requiresauth } = m;
      m.meta = { title, icon, describe, requiresauth: !!requiresauth };
      delete m.title;
      delete m.icon;
      delete m.describe;
      delete m.requiresauth;
      if (m.parentid === 0) {
        System.buildTree(m, menus);
        menu.push(m);
      }
    }
    return menu;
  }

  /**
   * 构建基本菜单信息
   *
   * @private
   * @static
   * @param {*} menus
   * @returns
   * @memberof System
   */
  private static buildMenuSimple(menus: any) {
    const menu = [];
    for (const m of menus) {
      if (m.parentid === 0) {
        System.buildTree(m, menus);
        menu.push(m);
      }
    }
    return menu;
  }
}

export default System;

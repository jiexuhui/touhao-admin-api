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
        .login(
          username,
          newpwd,
          req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip
        )
        .catch(err => next(err));
      debug("api:login:user")("username:" + username + "pwd:" + newpwd);
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
    jw.verify(token, cert, async (err: jw.JsonWebTokenError, decoded: any) => {
      if (err) {
        debug("api:system:login")("error: " + err.message);
        res.json(msgCode.expiredToken);
        return;
      }
      if (decoded) {
        debug("api:system:login")("decoded:%o ", decoded);
        const username = decoded.username;
        const pwd = decoded.password;
        const loginResult: any = await dbSystem.login(
          username,
          pwd,
          req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip
        );
        const loginInfo = loginResult[0];
        // TODO:依次判断用户的信息、菜单权限、接口权限、按钮权限
        msgCode.success.data = loginInfo;
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
   * 获取所有角色列表
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async roles(req: Request, res: Response, next: NextFunction) {
    const data = await dbSystem
      .rolesList()
      .then()
      .catch(err => next(err));
    await dbSystem.addoperatelog(
      req.session.user.username,
      "查看角色列表",
      req.originalUrl
    );
    msgCode.success.data = data;
    res.json(msgCode.success);
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
    const { id = 0 } = req.body;
    const username = req.session.user.username;
    const resdata = await dbSystem
      .delRole(id)
      .then(data => Tools.handleResult(data))
      .catch(err => next(err));
    if (resdata.code === 1) {
      await dbSystem.addoperatelog(username, "删除角色", "roleid:" + id);
      msgCode.success.data = resdata;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.error);
    }
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
    const { rolename = "" } = req.body;
    if (!rolename) {
      res.json(msgCode.parmasError);
      return;
    }
    const result = await dbSystem
      .addRole(_.trim(rolename))
      .then(data => Tools.handleResult(data))
      .catch(err => next(err));
    debug("api:system:addrole")("addrolers:%o", result);
    if (result.code === 10004) {
      res.json(msgCode.existsRole);
    } else if (result.code === 1) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "添加角色",
        "roleid:" + result.id
      );
      msgCode.success.data = result;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.error);
    }
    return;
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
    const { id = 0, rolename = "" } = req.body;
    if (!rolename || id === 0) {
      res.json(msgCode.parmasError);
      return;
    }
    const result = await dbSystem
      .editRole(id, _.trim(rolename))
      .then(data => Tools.handleResult(data))
      .catch(err => next(err));
    debug("api:system:editrole")("editrolers:%o", result);
    if (result.code > 0) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "编辑角色",
        "roleid:" + id
      );
      msgCode.success.data = result;
      res.json(Tools.handleResult(msgCode.success));
    } else {
      res.json(msgCode.exception);
    }
    return;
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
  public static async userMenu(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const role: string = req.body.role || "";
    if (role) {
      // const roleItem = Tools.handleResult(role);
      const usersMenu = [];
      // for (const r of roleItem) {
      const roleMenu = await dbSystem.rolesMenu(role).catch(err => next(err));
      // debug("api:system:usermenu:")("roleMenu:%o", roleMenu);
      msgCode.success.data = await System.buildMenu(roleMenu);
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
  public static async users(req: Request, res: Response, next: NextFunction) {
    const { username = "", page = 1, limit = 30 } = req.query;
    const result = await dbSystem
      .systemUser(username, page, limit)
      .then()
      .catch(err => next(err));
    if (result && result.length > 0) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "查看后台用户列表",
        "查看后台用户列表"
      );
      msgCode.success.data = result;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.successWithoutData);
    }
    return;
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
    reqData.ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
    debug("api:system:adduser")("addrreqDataesult:%o", reqData);
    const addResult: any = await dbSystem
      .addSystemUser(reqData)
      .then(data => Tools.handleResult(data))
      .catch(err => next(err));
    if (addResult.code === 10003) {
      res.json(msgCode.existsUser);
      return;
    }
    debug("api:system:adduser")("addresult:%o", addResult);
    if (addResult && addResult[0].id) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "添加用户",
        JSON.stringify(reqData)
      );
      msgCode.success.data = addResult[0];
      res.json(msgCode.success);
      return;
    } else {
      res.json(msgCode.exception);
      return;
    }
  }

  /**
   * 编辑系统用户
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof System
   */
  public static async editSystemUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const reqData = req.body;
    reqData.roleid = Number(req.body.roleid);
    if (reqData.password !== "") {
      reqData.password = md5(`${saltStart}.${reqData.password}.${saltEnd}`);
    }
    reqData.ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
    const editResult: any = await dbSystem
      .editSystemUser(reqData)
      .then(data => Tools.handleResult(data))
      .catch(err => next(err));
    if (editResult.code === 10001) {
      res.json({ code: 10003, msg: "用户不存在" });
      return;
    }
    if (editResult && editResult.code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "编辑用户",
        JSON.stringify(reqData)
      );
      msgCode.success.data = editResult;
      res.json(msgCode.success);
      return;
    } else {
      res.json(msgCode.exception);
      return;
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
    // debug("api:menu:buildTree")("m", m);
    // debug("api:menu:buildTree")("menus", menus);
    for (const menu of menus) {
      if (menu.pid === m.id) {
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
    // debug("api:menu:buildmenu1")("menus", menus);
    const menu = [];
    for (const m of menus) {
      const { title, icon } = m;
      m.meta = { title, icon };
      if (m.pid === 0) {
        System.buildTree(m, menus);
        menu.push(m);
      }
    }
    // debug("api:menu:buildmenu2")("buildMenu", menu);
    return menu;
  }

  /**
   * 检查动作权限
   * @param req
   */
  public static async checkpemission(req: any) {
    debug("api:checkpemission")("path:%o", req.path);
    const url = req.path.slice(1);
    const roleid = req.session.user.roleid;
    const result = await dbSystem.checkPemission(url, roleid).then();
    debug("api:checkpemission")("checkpemission:%o", result);
    return result;
  }

  /**
   * 后台操作日志列表
   * @param req
   * @param res
   * @param next
   */
  public static async operatelogs(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { username = "", time = [], page = 1, limit = 30 } = req.body;
    await dbSystem
      .oprateLoglist(username, time[0] || "", time[1] || "", page, limit)
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
    await dbSystem.addoperatelog(
      req.session.user.username,
      "查看后台操作日志",
      "查看后台操作日志"
    );
  }

  /**
   * 获取菜单列表
   * @param req
   * @param res
   * @param next
   */
  public static async menus(req: Request, res: Response, next: NextFunction) {
    const data = await dbSystem.menuList();
    const menus = await System.buildMenu(data);
    msgCode.success.data = menus;
    await dbSystem.addoperatelog(
      req.session.user.username,
      "查看后台菜单设置",
      "查看后台菜单设置"
    );
    res.json(msgCode.success);
    return;
  }

  /**
   * 增加菜单
   * @param req
   * @param res
   * @param next
   */
  public static async addmenu(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    debug("api:addmenu:")("params:%o", params);
    const resdata = await dbSystem.addmenu(params);
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "增加后台菜单",
        "增加后台菜单：id=" + resdata[0].id
      );
      msgCode.success.data = resdata[0];
      debug("api:addmenu:")("resdata:%o", resdata);
      res.json(msgCode.success);
    } else if (resdata[0].code === 10001) {
      res.json(msgCode.parmasError);
    } else if (resdata[0].code === 10002) {
      res.json(msgCode.existsMenu);
    }
    return;
  }

  /**
   * 编辑菜单
   * @param req
   * @param res
   * @param next
   */
  public static async editmenu(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const params = req.body;
    debug("api:editmenu:")("params:%o", params);
    const resdata = await dbSystem.editmenu(params);
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "编辑后台菜单",
        "增加后台菜单：id=" + params.id
      );
      msgCode.success.data = resdata[0];
      debug("api:addmenu:")("resdata:%o", resdata);
      res.json(msgCode.success);
    } else if (resdata[0].code === 10001) {
      res.json(msgCode.parmasError);
    }
    return;
  }

  /**
   * 删除菜单
   * @param req
   * @param res
   * @param next
   */
  public static async delmenu(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body;
    debug("api:delmenu:")("menuid:", id);
    const resdata = await dbSystem.delmenu(id);
    if (resdata[0].code === 1) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "删除后台菜单",
        "删除后台菜单：id=" + id
      );
      msgCode.success.data = resdata[0];
      debug("api:delmenu:")("resdata:%o", resdata);
      res.json(msgCode.success);
    } else {
      res.json(msgCode.error);
    }
    return;
  }

  /**
   * 获取默选id
   * @param req
   * @param res
   * @param next
   */
  public static async defaultcheck(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { rolename = "" } = req.body;
    debug("api:defaultcheck:")("rolename:", rolename);
    const rolememnu = await dbSystem.defaultmenu(rolename);
    const ids = [];
    for (const item of rolememnu) {
      ids.push(item.id);
    }
    debug("api:defaultcheck:")("ids:%o", ids);
    msgCode.success.data = ids;
    res.json(msgCode.success);
    return;
  }

  /**
   * 修改角色权限
   * @param req
   * @param res
   * @param next
   */
  public static async userpermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    debug("api:userpermission:")("body:%o", req.body);
    const roleid = req.body.id;
    const menuids = req.body.menuids.toString();
    debug("api:userpermission:")("roleid:" + roleid + "menuids:" + menuids);
    const resdata = await dbSystem.updateRolePermission(roleid, menuids);
    if (resdata[0].code === 200) {
      // tslint:disable-next-line:max-line-length
      await dbSystem.addoperatelog(
        req.session.user.username,
        "修改角色权限",
        "修改角色权限,roleid=" + roleid + "menuids" + menuids
      );
      msgCode.success.data = resdata[0];
      debug("api:delmenu:")("resdata:%o", resdata);
      res.json(msgCode.success);
    } else {
      res.json(msgCode.error);
    }
    return;
  }

  /**
   * 后台操作日志列表
   * @param req
   * @param res
   * @param next
   */
  public static async loginlogs(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { username = "", time = [], page = 1, limit = 30 } = req.body;
    const resdata = await dbSystem
      .loginlogs(username, time[0] || "", time[1] || "", page, limit)
      .then()
      .catch(err => next(err));
    await dbSystem.addoperatelog(
      req.session.user.username,
      "查看后台登录日志",
      "查看后台登录日志"
    );
    msgCode.success.data = resdata;
    res.json(msgCode.success);
    return;
  }
}

export default System;

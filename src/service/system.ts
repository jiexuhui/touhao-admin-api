import MySql from "../database/mysql";
import { ILoginUser } from "../interface/loginusers";

const dbConfig = require("../configs/database/mysql.json");
const db = new MySql(dbConfig.admin.connConfig);

/**
 * 系统模块
 *
 * @class System
 */
class System {
  /**
   * 系统登录
   *
   * @static
   * @param {string} username 用户名
   * @param {string} password 密码
   * @returns
   * @memberof System
   */
  public static async login(username: string, password: string, ip: string) {
    return await db.exec("call p_admin_login(:username,:password,:ip)", {
      username,
      password,
      ip
    });
  }
  /**
   * 后台记录登录日志
   *
   * @static
   * @param {number} userid 用户ID
   * @returns
   * @memberof System
   */
  public static async loginLog(userid: number, username: string, ip: string) {
    return await db.exec("call p_admin_login_logs(:userid,:username,:ip)", {
      userid,
      username,
      ip
    });
  }
  /**
   * 登录日志查询
   *
   * @static
   * @param {string} username 用户id
   * @param {string} stime 开始日期
   * @param {string} etime 结束日期
   * @param {number} pageindex 页码
   * @param {number} pagesize 每页数据
   * @returns
   * @memberof System
   */
  public static async loginLogsList(
    username: string,
    stime: string,
    etime: string,
    pageindex: number,
    pagesize: number
  ) {
    return await db.execMultiple(
      "call p_admin_login_logs_list(:username,:stime,:etime,:pageindex,:pagesize)",
      {
        username,
        stime,
        etime,
        pageindex,
        pagesize
      }
    );
  }
  /**
   * 获取后台菜单列表
   *
   */
  public static async menuList() {
    return await db.exec("call p_admin_menu_list()");
  }
  /**
   * 获取基本的菜单信息，只有id,title,parentid
   *
   * @static
   * @returns
   * @memberof System
   */
  public static async menuListSimple() {
    return await db.exec("call p_admin_menulist_simple()");
  }
  /**
   * 获取某个角色的菜单列表
   *
   * @static
   * @returns
   * @memberof System
   */
  public static async rolesMenu(role: string) {
    return await db.exec("call p_admin_rolesmenu(:role)", { role });
  }

  /**
   * 获取某个角色默认菜单
   *
   * @static
   * @returns
   * @memberof System
   */
  public static async defaultmenu(role: string) {
    return await db.exec("call p_admin_menu_defeault(:role)", { role });
  }
  /**
   * 修改角色的菜单信息
   *
   * @static
   * @param {number} roleid 角色id
   * @param {number} menuid 菜单id
   * @param {string} type 类型 DEL 或 ADD
   * @returns
   * @memberof System
   */
  public static async modifyRolesMenu(
    roleid: number,
    menuid: number,
    type: string
  ) {
    return await db.exec(
      "call p_admin_modify_roles_menu(:roleid, :menuid, :type)",
      { roleid, menuid, type }
    );
  }
  /**
   * 获取所有角色列表
   *
   * @static
   * @returns
   * @memberof System
   */
  public static async rolesList() {
    return await db.execMultiple("call p_admin_roles_list()");
  }
  /**
   * 删除某个角色
   *
   * @static
   * @param {number} roleid 角色id
   * @returns
   * @memberof System
   */
  public static async delRole(roleid: number) {
    return await db.exec("call p_admin_del_role(:roleid)", { roleid });
  }
  /**
   * 编辑角色
   *
   * @static
   * @param {number} roleid 角色id
   * @param {string} rolename 角色名
   * @returns
   * @memberof System
   */
  public static async editRole(
    roleid: number,
    rolename: string
  ) {
    return await db.exec(
      "call p_admin_edit_role(:roleid, :rolename)",
      { roleid, rolename}
    );
  }
  /**
   * 添加角色
   *
   * @static
   * @param {string} rolename 角色名
   * @returns
   * @memberof System
   */
  public static async addRole(rolename: string) {
    return await db.exec("call p_admin_add_role(:rolename)", {
      rolename
    });
  }
  /**
   * 获取系统用户列表
   *
   * @static
   * @param {string} username 用户登录名
   * @param {number} pageindex 页码
   * @param {number} pagesize 每页数据
   * @returns
   * @memberof System
   */
  public static async systemUser(
    username: string,
    pageindex: number,
    pagesize: number
  ) {
    return await db.execMultiple(
      "call p_admin_system_user(:username,:pageindex,:pagesize)",
      {
        username,
        pageindex,
        pagesize
      }
    );
  }

  /**
   * 添加系统用户
   *
   * @static
   * @param {{
   *     username: string;
   *     nickname: string;
   *     introduction: string;
   *     avatar: string;
   *     status: number;
   *   }} params
   * @returns
   * @memberof System
   */
  public static async editSystemUser(params: {
    id: number;
    username: string;
    password: string;
    ip: string;
    nickname: string;
    introduction: string;
    avatar: string;
    status: number;
    roleid: number;
  }) {
    return await db.exec(
      "call p_admin_edit_system_user(:id,:username,:password,:ip,:nickname,:introduction,:avatar,:status,:roleid)",
      params
    );
  }

  /**
   * 编辑系统用户
   *
   * @static
   * @param {{
   *     avatar: string;
   *     department: number;
   *     num: number;
   *     password: string;
   *     position: number;
   *     status: number;
   *     username: string;
   *     nickname: string;
   *   }} params
   * @returns
   * @memberof System
   */
  public static async addSystemUser(params: {
    username: string;
    password: string;
    ip: string;
    nickname: string;
    introduction: string;
    avatar: string;
    status: number;
    roleid: number
  }) {
    return await db.exec(
      "call p_admin_add_system_user(:username,:password,:ip,:nickname,:introduction,:avatar,:status,:roleid)",
      params
    );
  }

  /**
   * 检查权限
   * @param url
   * @param roleid
   */
  public static async checkPemission(url: string, roleid: number) {
    return await db.exec(
      "call p_admin_checkperssion(:url,:roleid)",
      {url, roleid}
    );
  }

  /**
   * 操作日志列表
   * @param username
   * @param stime
   * @param etime
   * @param page
   * @param limit
   */
  public static async oprateLoglist(
    username: string,
    stime: string,
    etime: string,
    page: number,
    limit: number
  ) {
    return await db.execMultiple("call p_admin_operate_log(:username,:stime,:etime,:page,:limit)",
    {username, stime, etime, page, limit});
  }

  /**
   * 增加操作日志
   * @param username
   * @param title
   * @param content
   */
  public static async addoperatelog(username: string, title: string, content: string) {
    return await db.exec("call p_admin_add_operatelog(:username,:title,:content)",
    {username, title, content});
  }

  /**
   * 添加菜单
   * @param params
   */
  public static async addmenu(params: {
    pid: number;
    name: string;
    title: string;
    path: string;
    icon_style: string;
    display: number;
    sort: number;
    isaction: number;
  }) {
    return await db.exec("call p_admin_menu_add(:pid,:name,:title,:path,:icon_style,:display,:sort,:isaction)", params);
  }

  /**
   * 编辑菜单
   * @param params
   */
  public static async editmenu(params: {
    id: number,
    name: string;
    title: string;
    path: string;
    icon_style: string;
    display: number;
    sort: number;
    isaction: number;
  }) {
    return await db.exec("call p_admin_menu_edit(:id,:name,:title,:path,:icon_style,:display,:sort,:isaction)", params);
  }

  /**
   * 删除菜单
   * @param params
   */
  public static async delmenu(id: number ) {
    return await db.exec("call p_admin_menu_del(:id)", {id});
  }

  /**
   * 修改角色权限
   * @param params
   */
  public static async updateRolePermission(
    roleid: number,
    menuids
  ) {
    return await db.exec("call p_admin_role_permission(:roleid, :menuids)", {roleid, menuids});
  }

  /**
   * 登录日志列表
   * @param username
   * @param stime
   * @param etime
   * @param page
   * @param limit
   */
  public static async loginlogs(
    username: string,
    stime: string,
    etime: string,
    page: number,
    limit: number
  ) {
    return await db.execMultiple("call p_admin_login_loglist(:username,:stime,:etime,:page,:limit)",
    {username, stime, etime, page, limit});
  }
}
export default System;

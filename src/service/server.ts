import MySql from "../database/mysql";
import { ILoginUser } from "../interface/loginusers";

const dbConfig = require("../configs/database/mysql.json");
const db = new MySql(dbConfig.admin.connConfig);

class Server {

  /**
   * tag列表
   * @param tagname
   * @param shopid
   * @param stime
   * @param etime
   * @param page
   * @param limit
   */
  public static async tags(
    tagname: string,
    shopid: number,
    stime: string,
    etime: string,
    page: number,
    limit: number
  ) {
    return await db.execMultiple("call p_admin_tag_list(:tagname,:shopid,:stime,:etime,:page,:limit)",
    {tagname, shopid, stime, etime, page, limit});
  }

  /**
   * 添加tag
   * @param tagname
   */
  public static async addtag(
    tagname: string,
    userid: number
  ) {
    return await db.exec("call p_admin_tag_add(:tagname,:userid)",
    {tagname, userid});
  }

  /**
   * 添加tag
   * @param tagname
   */
  public static async deltag(
    tagid: number
  ) {
    return await db.exec("call p_admin_tag_del(:tagid)",
    {tagid});
  }
}

export default Server;

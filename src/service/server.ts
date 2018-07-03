import * as debug from "debug";
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
    return await db.execMultiple(
      "call p_admin_tag_list(:tagname,:shopid,:stime,:etime,:page,:limit)",
      { tagname, shopid, stime, etime, page, limit }
    );
  }

  /**
   * 添加tag
   * @param tagname
   */
  public static async addtag(tagname: string, userid: number) {
    return await db.exec("call p_admin_tag_add(:tagname,:userid)", {
      tagname,
      userid
    });
  }

  /**
   * 删除tag
   * @param tagname
   */
  public static async deltag(tagid: number) {
    return await db.exec("call p_admin_tag_del(:tagid)", { tagid });
  }

  /**
   * goodstypes列表
   * @param shopid
   * @param page
   * @param limit
   */
  public static async goodstypes(shopid: number) {
    return await db.exec("call p_admin_goodstype_list(:shopid)", {
      shopid
    });
  }

  /**
   * 添加goodstype
   * @param shopid
   * @param page
   * @param limit
   */
  public static async addgoodstype(shopid: number, fid: number, name: string) {
    return await db.exec("call p_admin_goodstype_add(:shopid,:fid,:name)", {
      shopid,
      fid,
      name
    });
  }

  /**
   * editgoodstype
   * @param shopid
   * @param page
   * @param limit
   */
  public static async editgoodstype(id: number, name: string) {
    return await db.exec("call p_admin_goodstype_edit(:id,:name)", {
      id,
      name
    });
  }

  /**
   * delgoodstype
   * @param shopid
   * @param page
   * @param limit
   */
  public static async delgoodstype(id: number) {
    return await db.exec("call p_admin_goodstype_del(:id)", {
      id
    });
  }

  /**
   * goods
   * @param shopid
   * @param page
   * @param limit
   */
  public static async goods(
    goodsname: number,
    page: number,
    limit: number,
    userid: number
  ) {
    return await db.execMultiple(
      "call p_admin_goods_list(:goodsname, :page, :limit, :userid)",
      {
        goodsname,
        page,
        limit,
        userid
      }
    );
  }

  /**
   * addgoods
   * @param shopid
   * @param page
   * @param limit
   */
  public static async addgoods(
    userid: number,
    goodsname: string,
    price: number,
    storenum: number,
    point: string,
    main: string,
    thumbs: string,
    category: number,
    tags: string
  ) {
    return await db.exec(
      "call p_admin_goods_add(:userid,:goodsname,:price,:storenum,:point,:main,:thumbs,:category,:tags)",
      {
        userid,
        goodsname,
        price,
        storenum,
        point,
        main,
        thumbs,
        category,
        tags
      }
    );
  }

  /**
   * addgoods
   * @param shopid
   * @param page
   * @param limit
   */
  public static async editgoods(
    goodsid: number,
    userid: number,
    goodsname: string,
    price: number,
    storenum: number,
    point: string,
    main: string,
    thumbs: string,
    category: number,
    tags: string
  ) {
    return await db.exec(
      "call p_admin_goods_edit(:goodsid,:userid,:goodsname,:price,:storenum,:point,:main,:thumbs,:category,:tags)",
      {
        goodsid,
        userid,
        goodsname,
        price,
        storenum,
        point,
        main,
        thumbs,
        category,
        tags
      }
    );
  }

  /**
   * delgoods
   * @param goodsid
   */
  public static async delgoods(goodsid: number) {
    return await db.exec("call p_admin_goods_del(:goodsid)", {
      goodsid
    });
  }

  /**
   * 申请列表
   * @param tagname
   * @param shopid
   * @param stime
   * @param etime
   * @param page
   * @param limit
   */
  public static async applys(
    anchor,
    isbook,
    stime: string,
    etime: string,
    pstime: string,
    petime: string,
    name: string,
    page: number,
    limit: number
  ) {
    return await db.execMultiple(
      "call p_admin_program_infos(:anchor,:isbook,:stime,:etime,:pstime,:petime,:name,:page,:limit)",
      { anchor, isbook, stime, etime, pstime, petime, name, page, limit }
    );
  }

  /**
   * 修改订阅状态
   * @param isbook
   */
  public static async updateapply(id: number, isbook: number) {
    return await db.exec("call p_admin_apply_update(:id,:isbook)", {
      id,
      isbook
    });
  }

  /**
   * 直播报告列表
   */
  public static async reports(pid, stime: string, etime: string, page: number, limit: number
  ) {
    return await db.execMultiple(
      "call p_admin_report_list(:pid,:stime,:etime,:page,:limit)",
      { pid, stime, etime, page, limit }
    );
  }

  /**
   * 添加直播报表
   */
  public static async addreport(
    pid: number,
    watchnum: number,
    ptime: number,
    stotal: number,
    mtotal: number,
    reporter: string,
    rdesc: string,
    userid: number
  ) {
    debug("api:addreport")(pid, watchnum, ptime, stotal, mtotal, reporter, rdesc, userid);
    return await db.exec(
      "call p_admin_report_add(:pid,:watchnum,:ptime,:stotal,:mtotal,:reporter,:rdesc,:userid)",
      { pid, watchnum, ptime, stotal, mtotal, reporter, rdesc, userid}
    );
  }

  /**
   * 保存报表相关商品出售数量
   */
  public static async salegoods(
    pid: number,
    goodsid: number,
    goodsname: string,
    num: number
  ) {
    return await db.exec(
      "call p_admin_sale_goods(:pid,:goodsid,:goodsname,:num)",
      { pid, goodsid, goodsname, num}
    );
  }
}

export default Server;

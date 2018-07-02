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
}

export default Server;

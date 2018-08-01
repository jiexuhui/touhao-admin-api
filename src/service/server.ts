import axios from "axios";
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
  public static async editgoodstype(id: number, name: string, banner: string) {
    return await db.exec("call p_admin_goodstype_edit(:id,:name,:banner)", {
      id,
      name,
      banner
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
    commission: number,
    tags: string,
    banner: number,
    taobaourl: string,
    classify: number
  ) {
    debug("api:addgoods")(
      userid,
      goodsname,
      price,
      storenum,
      point,
      main,
      thumbs,
      category,
      commission,
      tags,
      taobaourl,
      classify
    );
    return await db.exec(
      "call p_admin_goods_add(:userid,:goodsname,:price,:storenum,:point," +
        ":main,:thumbs,:category,:commission,:tags,:banner,:taobaourl,:classify)",
      {
        userid,
        goodsname,
        price,
        storenum,
        point,
        main,
        thumbs,
        category,
        commission,
        tags,
        banner,
        taobaourl,
        classify
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
    commission: number,
    tags: string,
    banner: number,
    classify: number,
    taobaourl: string
  ) {
    return await db.exec(
      "call p_admin_goods_edit(:goodsid,:userid,:goodsname,:price,:storenum,:point,:main," +
        ":thumbs,:category,:commission,:tags,:banner,:classify,:taobaourl)",
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
        commission,
        tags,
        banner,
        classify,
        taobaourl
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
    status,
    stime: string,
    etime: string,
    pstime: string,
    petime: string,
    name: string,
    page: number,
    limit: number
  ) {
    return await db.execMultiple(
      "call p_admin_program_infos(:anchor,:status,:stime,:etime,:pstime,:petime,:name,:page,:limit)",
      { anchor, status, stime, etime, pstime, petime, name, page, limit }
    );
  }

  /**
   * 修改订阅状态
   * @param isbook
   */
  public static async updateapply(id: number, status: number) {
    return await db.exec("call p_admin_apply_update(:id,:status)", {
      id,
      status
    });
  }

  /**
   * 直播报告列表
   */
  public static async reports(
    pid: number,
    stime: string,
    etime: string,
    page: number,
    limit: number
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
    debug("api:addreport")(
      pid,
      watchnum,
      ptime,
      stotal,
      mtotal,
      reporter,
      rdesc,
      userid
    );
    return await db.exec(
      "call p_admin_report_add(:pid,:watchnum,:ptime,:stotal,:mtotal,:reporter,:rdesc,:userid)",
      { pid, watchnum, ptime, stotal, mtotal, reporter, rdesc, userid }
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
      { pid, goodsid, goodsname, num }
    );
  }

  /**
   * 获取主播列表
   */
  public static async anchors(
    nickname: string,
    page: number,
    limit: number,
    review: number
  ) {
    return await db.execMultiple(
      "call p_admin_anchor_list(:nickname,:page,:limit,:review)",
      {
        nickname,
        page,
        limit,
        review
      }
    );
  }

  /**
   * 修改订阅状态
   * @param id
   * @param review
   */
  public static async updatereview(id: number, review: number) {
    return await db.exec("call p_admin_anchor_review(:id,:review)", {
      id,
      review
    });
  }

  /**
   * 微信获取access_token
   * @param id
   * @param review
   */
  public static async accessToken() {
    const url =
      "https://api.weixin.qq.com/cgi-bin/token?" +
      "grant_type=client_credential&appid=wxa1d8efa9c71da59e&secret=fce9e1f1861e502d0fcf203c21a93558";
    const result = await axios.get(url, {}).then();
    debug("api:微信")("小程序：", result.data.access_token);
    return result.data.access_token;
  }

  /**
   * 发送小程序模板消息
   * @param id
   * @param review
   */
  public static async sendMsg(
    accessToken: string,
    touser: string,
    formId: string,
    page: string,
    data1: string,
    data2: string,
    data3: string,
    data4: string,
    data5: string
  ) {
    const url =
      "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=" +
      accessToken;
    const postparams = {
      touser,
      template_id: "v-MQFlNWNXwpF8i4_j--xZA7o0xeZVTJglLJfqYHi54",
      page: "pages/index/index",
      form_id: formId,
      data: {
        keyword1: { value: data1 },
        keyword2: { value: data2 },
        keyword3: { value: data3 },
        keyword4: { value: data4 },
        keyword5: { value: data5 }
      },
      emphasis_keyword: "keyword1.DATA"
    };
    const result = await axios.post(url, postparams).then();
    return result.data;
  }

  /**
   * 首页分类列表
   * @param id
   * @param review
   */
  public static async classify(page: number, limit: number) {
    return await db.execMultiple("call p_api_classify_list(:page,:limit)", {
      page,
      limit
    });
  }

  /**
   * 增加首页分类
   * @param id
   * @param review
   */
  public static async addclassify(name: string) {
    return await db.exec("call p_api_classify_add(:name)", {
      name
    });
  }

  /**
   * 编辑首页分类
   * @param id
   * @param review
   */
  public static async editclassify(id: number, name: string) {
    return await db.exec("call p_api_classify_edit(:id,:name)", {
      id,
      name
    });
  }

  /**
   * 删除首页分类
   * @param id
   * @param review
   */
  public static async delclassify(id: number) {
    return await db.exec("call p_api_classify_del(:id)", {
      id
    });
  }

  /**
   * 添加库存
   * @param goodsid
   * @param name
   * @param num
   */
  public static async addstore(
    goodsid: number,
    color: string,
    size: string,
    num: number,
    isdel: number
  ) {
    return await db.exec(
      "call p_admin_store_add(:goodsid,:color,:size,:num,:isdel)",
      {
        goodsid,
        color,
        size,
        num,
        isdel
      }
    );
  }

  /**
   * 获取物品库存详情
   * @param goodsids
   */
  public static async goodsStore(goodsids: string) {
    return await db.exec("call p_admin_goods_store(:goodsids)", {
      goodsids
    });
  }

  /**
   * 获取播单物品详情
   * @param goodsids
   */
  public static async goodsdetail(goodsids: string) {
    return await db.exec("call p_admin_program_goods(:goodsids)", {
      goodsids
    });
  }
}

export default Server;

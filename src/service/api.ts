import * as debug from "debug";
import MySql from "../database/mysql";
import { ILoginUser } from "../interface/loginusers";

const dbConfig = require("../configs/database/mysql.json");
const db = new MySql(dbConfig.admin.connConfig);

class Api {
  /**
   * 判断主播是否为新人
   */
  public static async isNewanchor(params: {
    avatarUrl: string;
    city: string;
    country: string;
    gender: number;
    language: string;
    nickName: string;
    province: string;
    openid: string;
  }) {
    return await db.execMultiple(
      "call p_api_anchor_isnew(:avatarUrl,:city,:country,:gender,:language,:nickName,:province,:openid)",
      params
    );
  }
  /**
   * 保存用户信息
   * @param params
   */
  public static async saveuserinfo(params: {
    avatarUrl: string;
    city: string;
    country: string;
    gender: number;
    isbook: number;
    language: string;
    nickName: string;
    openid: string;
    phone: string;
    province: string;
    realname: string;
    taobao: string;
    wechat: string;
    formId: string;
  }) {
    return await db.exec(
      "call p_api_add_anchor(:avatarUrl,:city,:country,:gender,:isbook" +
        ",:language,:nickName,:openid,:phone,:province,:realname,:taobao,:wechat,:formId)",
      params
    );
  }
  /**
   * 用户报告列表
   * @param openid
   */
  public static async userreports(openid: string) {
    return await db.exec("call p_api_user_reports(:openid)", { openid });
  }

  /**
   * 用户报告详情
   * @param openid
   */
  public static async reportdetail(reportid: number) {
    return await db.execMultiple("call p_api_report_detail(:reportid)", {
      reportid
    });
  }

  /**
   * 获取首页数据
   */
  public static async goodslist(openid: string) {
    return await db.execMultiple("call p_api_goods_list(:openid)", { openid });
  }

  /**
   * 插入已选取物品
   */
  public static async addcheckedlist(openid: string, goodsid: number) {
    return await db.execMultiple("call p_api_add_checklist(:openid,:goodsid)", {
      openid,
      goodsid
    });
  }

  /**
   * 获取已选取物品
   */
  public static async checkedgoods(openid: string) {
    return await db.exec("call p_api_checked_goods(:openid)", {
      openid
    });
  }

  /**
   * 删除已选取物品
   */
  public static async delcheckedgoods(openid: string, goodsid: number) {
    return await db.exec("call p_api_del_checkgoods(:openid,:goodsid)", {
      openid,
      goodsid
    });
  }

  /**
   * 删除已选取物品
   */
  public static async applyprogram(
    openid: string,
    livename: string,
    startTime: string,
    endTime: string,
    goodslist: string,
    isbook: number,
    formId: string
  ) {
    return await db.exec(
      "call p_api_save_program(:openid,:livename,:startTime,:endTime,:goodslist,:isbook,:formId)",
      {
        openid,
        livename,
        startTime,
        endTime,
        goodslist,
        isbook,
        formId
      }
    );
  }
}
export default Api;

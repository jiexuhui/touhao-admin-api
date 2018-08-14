import axios from "axios";
import * as debug from "debug";
import { NextFunction, Request, Response } from "express";
import msgCode from "../compoents/msgcode";

const debugLog = debug("api:controller:api");
import wechatconfig from "../configs/common/wechat";

import dbApi from "../service/api";

// 小程序相关API
class Api {
  /**
   * 微信小程序登录接口
   * @param req
   * @param res
   * @param next
   */
  public static async loginByWeixin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const params = req.body;
    wechatconfig.js_code = params.code;
    const userinfo = params.userInfo.userInfo;
    const resdata = {};
    debugLog("wechatconfig:%o", JSON.stringify(wechatconfig));
    const url = "https://api.weixin.qq.com/sns/jscode2session";
    const result = await axios.get(url, { params: wechatconfig }).then();
    Object.assign(userinfo, { openid: result.data.openid });
    const isnew = await dbApi.isNewanchor(userinfo);
    debugLog("isnew:%o", isnew[1][0]);
    Object.assign(userinfo, { isnew: isnew[0][0].isNew });
    debugLog("userinfo1:%o", userinfo);
    if (isnew[0][0].isNew === 0) {
      Object.assign(userinfo, isnew[1][0]);
    }
    debugLog("userinfo:%o", userinfo);
    Object.assign(resdata, {
      userinfo,
      token: result.data.session_key
    });

    msgCode.success.data = resdata || [];
    res.json(msgCode.success);
    return;
  }

  /**
   * 添加主播
   * @param req
   * @param res
   * @param next
   */
  public static async saveuserinfo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const params = req.body;
    const resdata = await dbApi
      .saveuserinfo(params)
      .then()
      .catch(err => next(err));
    debugLog("resdata:%o", resdata);
    if (resdata[0].code === 200) {
      res.json(msgCode.success);
    } else {
      res.json(msgCode.existsUser);
    }
    return;
  }

  /**
   * 根据openid 获取直播报告
   * @param req
   * @param res
   * @param next
   */
  public static async userreports(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const openid = req.body.openid;
    await dbApi
      .userreports(openid)
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }

  /**
   * 获取直播报告详情
   * @param req
   * @param res
   * @param next
   */
  public static async reportdetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const reportid = req.body.reportid;
    await dbApi
      .reportdetail(reportid)
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }

  /**
   * 获取物品列表
   * @param req
   * @param res
   * @param next
   */
  public static async goodslist(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const {
      openid = "",
      category = 0,
      classify = 0,
      keyword = "",
      page = 1
    } = req.body;
    await dbApi
      .goodslist(openid, category, classify, keyword, page)
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }

  /**
   * 保存已选取商品
   * @param req
   * @param res
   * @param next
   */
  public static async addcheckedlist(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const openid = req.body.openid;
    const goodsid = req.body.goodsid;
    await dbApi
      .addcheckedlist(openid, goodsid)
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }

  /**
   * 获取已选取商品
   * @param req
   * @param res
   * @param next
   */
  public static async checkedgoods(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const openid = req.body.openid;
    await dbApi
      .checkedgoods(openid)
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }

  /**
   * 删除已选取商品
   * @param req
   * @param res
   * @param next
   */
  public static async delcheckedgoods(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const openid = req.body.openid;
    const goodsid = req.body.goodsid;
    await dbApi
      .delcheckedgoods(openid, goodsid)
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }

  /**
   * 提交播单申请
   * @param req
   * @param res
   * @param next
   */
  public static async applyprogram(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const {
      openid = "",
      livename = "",
      startTime = "",
      endTime = "",
      goodslist = "",
      isbook = 1,
      formId = ""
    } = req.body;
    await dbApi
      .applyprogram(
        openid,
        livename,
        startTime,
        endTime,
        goodslist,
        isbook,
        formId
      )
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }
  /**
   * 获取物品类型
   * @param req
   * @param res
   * @param next
   */
  public static async cateloglist(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id = 9999 } = req.body;
    await dbApi
      .cateloglist(id)
      .then(data => {
        const result = [];
        for (const item of data) {
          if (item.fid === 0) {
            item.children = [];
            for (const i of data) {
              if (i.fid === item.id) {
                item.children.push(i);
              }
            }
            result.push(item);
          }
        }
        debug("api:api")("cateloglist:result:%o", result);
        if (id === 9999) {
          msgCode.success.data = result;
        } else {
          msgCode.success.data = data;
        }
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }

  /**
   * 根据openid 获取直播报告
   * @param req
   * @param res
   * @param next
   */
  public static async userprograms(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const openid = req.body.openid;
    const status = req.body.status;
    await dbApi
      .userprograms(openid, status)
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }

  /**
   * 根据openid 获取播单内物品
   * @param req
   * @param res
   * @param next
   */
  public static async programgoods(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const goodslist = req.body.goodslist;
    await dbApi
      .programgoods(goodslist)
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }

  /**
   * 根据openid 获取播单内物品
   * @param req
   * @param res
   * @param next
   */
  public static async invalidprogram(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const id = req.body.id;
    await dbApi
      .invalidprogram(id)
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }

  /**
   * 根据openid 获取搜索页数据
   * @param req
   * @param res
   * @param next
   */
  public static async searchindex(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const openid = req.body.openid;
    await dbApi
      .searchindex(openid)
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }

  /**
   * 根据goodsid 获取物品库存详情
   * @param req
   * @param res
   * @param next
   */
  public static async goodsstore(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const goodsid = req.body.goodsid;
    await dbApi
      .goodsstore(goodsid)
      .then(data => {
        const row = {
          colors: [],
          size: [],
          data: []
        };

        const result = [];
        debug("api:goodsstore")("data:%o", data);
        msgCode.success.data = data;
        for (const c of data[0]) {
          row.colors.push(c.color);
        }
        debug("api:goodsstore")("colors:%o", row.colors);
        for (const s of data[1]) {
          row.size.push(s.size);
        }
        debug("api:goodsstore")("size:%o", row.size);
        if (data[2].length > 0) {
          for (const index of row.colors) {
            const keyarr = [];
            for (const i of row.size) {
              let num = 0;
              for (const item of data[2]) {
                if (item.color === index && item.size === i) {
                  num = item.num;
                }
              }
              keyarr.push(num);
            }
            debug("api:goodsstore")("obj:%o", keyarr);
            result.push(keyarr);
          }
        }
        debug("api:goodsstore")("result:%o", result);
        row.data = result;
        msgCode.success.data = row;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }
}
export default Api;

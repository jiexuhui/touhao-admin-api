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
   * 根据openid 获取直播报告
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
   * 根据openid 获取直播报告
   * @param req
   * @param res
   * @param next
   */
  public static async goodslist(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const openid = req.body.openid;
    await dbApi
      .goodslist(openid)
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
    await dbApi
      .cateloglist()
      .then(data => {
        msgCode.success.data = data;
        res.json(msgCode.success);
        return;
      })
      .catch(err => next(err));
  }
}
export default Api;

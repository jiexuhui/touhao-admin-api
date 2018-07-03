import * as debug from "debug";
import { NextFunction, Request, Response } from "express";
const serverCondig = require("../configs/server/api.json");
const OSS = require("ali-oss");
import co from "co";
import * as fs from "fs";
import msgCode from "../compoents/msgcode";
import ossconfig from "../compoents/oss";
import dbServer from "../service/server";
import dbSystem from "../service/system";

const debugLog = debug("api:controller:server");
const client = new OSS(ossconfig);

/**
 * 与功能逻辑服务端交互
 *
 * @class Server
 */
class Server {
  public static async upload(req: Request, res: Response, next: NextFunction) {
    const files = req.files;
    // debug("api:upload")("file:%o", req.files);
    const filename = "uploads/" + files[0].filename;
    co(function*() {
      client.useBucket("topimgs");
      const result = yield client.put("goods/test.jpg", filename);
      // const list = yield client.list();
      // debug("api:upload:")("result:", result);
      fs.unlinkSync(filename);
      msgCode.success.data = result;
      res.json(msgCode.success);
      return;
    }).catch(err => {
      next(err);
      debug("api:upload:%j")("err:", err);
    });
  }

  /**
   * 获取tag列表
   * @param req
   * @param res
   * @param next
   */
  public static async tags(req: Request, res: Response, next: NextFunction) {
    const { tagname = "", time = [], page = 1, limit = 30 } = req.body;
    const shopid = req.session.user.userid;
    const resdata = await dbServer
      .tags(tagname, shopid, time[0] || "", time[1] || "", page, limit)
      .then();
    await dbSystem.addoperatelog(
      req.session.user.username,
      "查看标签",
      "查看标签"
    );
    msgCode.success.data = resdata;
    res.json(msgCode.success);
    return;
  }

  /**
   * 添加tag
   * @param req
   * @param res
   * @param next
   */
  public static async addtag(req: Request, res: Response, next: NextFunction) {
    const { tagname = "" } = req.body;
    const userid = req.session.user.userid;
    const resdata = await dbServer.addtag(tagname, userid).then();
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "添加标签",
        "添加标签：tagname:" + tagname
      );
      msgCode.success.data = resdata;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.existsTag);
    }
    return;
  }

  /**
   * 删除tag
   * @param req
   * @param res
   * @param next
   */
  public static async deltag(req: Request, res: Response, next: NextFunction) {
    const { tagid = 0 } = req.body;
    const resdata = await dbServer.deltag(tagid).then();
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "删除标签",
        "添加标签：tagid:" + tagid
      );
      msgCode.success.data = resdata;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.existsTag);
    }
    return;
  }

  /**
   * 获取类型列表
   * @param req
   * @param res
   * @param next
   */
  public static async goodstypes(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { page = 1, limit = 30 } = req.body;
    const shopid = req.session.user.userid;
    const resdata = await dbServer.goodstypes(shopid).then();
    await dbSystem.addoperatelog(
      req.session.user.username,
      "查看物品类型",
      "查看物品类型"
    );
    const result = await Server.buildGoodstypes(resdata);
    msgCode.success.data = result;
    res.json(msgCode.success);
    return;
  }

  /**
   * 构建物品列表tabletree
   * @param params
   */
  private static buildGoodstypes(params: any) {
    const types = [];
    for (const m of params) {
      if (m.fid === 0) {
        Server.buildTree(m, params);
        types.push(m);
      }
    }
    return types;
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
    for (const menu of menus) {
      if (menu.fid === m.id) {
        if (!m.children) {
          m.children = [];
        }
        m.children.push(menu);
        this.buildTree(menu, menus);
      }
    }
    return menus;
  }

  /**
   * 添加goodstype
   * @param req
   * @param res
   * @param next
   */
  public static async addgoodstype(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { fid = 0, name = "" } = req.body;
    const userid = req.session.user.userid;
    const resdata = await dbServer.addgoodstype(userid, fid, name).then();
    debug("api:server")("addgoodstype:%o", resdata);
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "添加物品类型",
        "添加物品类型:" + name
      );
      msgCode.success.data = resdata;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.existsTag);
    }
    return;
  }

  /**
   * 编辑物品类型
   * @param req
   * @param res
   * @param next
   */
  public static async editgoodstype(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id = 0, name = "" } = req.body;
    const resdata = await dbServer
      .editgoodstype(id, name)
      .then()
      .catch(err => next(err));
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "编辑物品类型",
        "编辑物品类型:id" + id + ",name:" + name
      );
      msgCode.success.data = resdata[0];
      res.json(msgCode.success);
    } else {
      res.json(msgCode.parmasError);
    }
    return;
  }

  /**
   * 删除物品类型
   * @param req
   * @param res
   * @param next
   */
  public static async delgoodstype(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id = 0 } = req.body;
    const resdata = await dbServer
      .delgoodstype(id)
      .then()
      .catch(err => next(err));
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "删除物品类型",
        "删除物品类型:id" + id
      );
      msgCode.success.data = resdata[0];
      res.json(msgCode.success);
    } else {
      res.json(msgCode.parmasError);
    }
    return;
  }

  /**
   * 物品列表
   * @param req
   * @param res
   * @param next
   */
  public static async goods(req: Request, res: Response, next: NextFunction) {
    const { goodsname = "", page = 1, limit = 20 } = req.body;
    const userid = req.session.user.userid;
    const resdata = await dbServer
      .goods(goodsname, page, limit, userid)
      .then()
      .catch(err => next(err));
    for (const item of resdata[0]) {
      item.thumbs = item.thumbs.split(",");
    }
    await dbSystem.addoperatelog(
      req.session.user.username,
      "查看物品列表",
      "查看物品列表:id"
    );
    msgCode.success.data = resdata;
    res.json(msgCode.success);
    return;
  }

  /**
   * 增加物品
   * @param req
   * @param res
   * @param next
   */
  public static async addgoods(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const {
      goodsname = "",
      price = 0,
      storenum = 0,
      point = "",
      main = "",
      thumbs = "",
      category = 1,
      tags = []
    } = req.body;
    const userid = req.session.user.userid;
    const resdata = await dbServer
      .addgoods(
        userid,
        goodsname,
        price,
        storenum,
        point,
        main,
        thumbs,
        category,
        tags.toString()
      )
      .then()
      .catch(err => next(err));
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "增加物品",
        "增加物品:id" + resdata[0].id
      );
      msgCode.success.data = resdata;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.parmasError);
    }
    return;
  }

  /**
   * 编辑物品
   * @param req
   * @param res
   * @param next
   */
  public static async editgoods(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const {
      goodsid = 0,
      goodsname = "",
      price = 0,
      storenum = 0,
      point = "",
      main = "",
      thumbs = "",
      category = 1,
      tags = []
    } = req.body;
    const userid = req.session.user.userid;
    const resdata = await dbServer
      .editgoods(
        goodsid,
        userid,
        goodsname,
        price,
        storenum,
        point,
        main,
        thumbs,
        category,
        tags.toString()
      )
      .then()
      .catch(err => next(err));
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "编辑",
        "编辑:id" + resdata[0].id
      );
      msgCode.success.data = resdata;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.parmasError);
    }
    return;
  }

  /**
   * 删除物品
   * @param req
   * @param res
   * @param next
   */
  public static async delgoods(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { goodsid = 0 } = req.body;
    const resdata = await dbServer
      .delgoods(goodsid)
      .then()
      .catch(err => next(err));
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "删除物品",
        "删除物品:id" + goodsid
      );
      msgCode.success.data = resdata[0];
      res.json(msgCode.success);
    } else {
      res.json(msgCode.parmasError);
    }
    return;
  }

  /**
   * 申请列表
   * @param req
   * @param res
   * @param next
   */
  public static async applys(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const {
      anchor = "",
      isbook = "",
      time = [],
      ptime = [],
      name = "",
      page = 1,
      limit = 20
    } = req.body;
    const resdata = await dbServer
      .applys(
        anchor,
        isbook,
        time[0] || "",
        time[1] || "",
        ptime[0] || "",
        ptime[1] || "",
        name,
        page,
        limit
      )
      .then()
      .catch(err => next(err));
    if (resdata) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "查看申请列表",
        "查看申请列表"
      );
      msgCode.success.data = resdata;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.parmasError);
    }
    return;
  }

  /**
   * 修改订阅状态
   * @param req
   * @param res
   * @param next
   */
  public static async updateapply(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id = 0, isbook = 0 } = req.body;
    const resdata = await dbServer
      .updateapply(id, isbook)
      .then()
      .catch(err => next(err));
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "修改订阅状态",
        "修改订阅状态:id" + id
      );
      msgCode.success.data = resdata[0];
      res.json(msgCode.success);
    } else {
      res.json(msgCode.parmasError);
    }
    return;
  }

  /**
   * 直播报告列表
   * @param req
   * @param res
   * @param next
   */
  public static async reports(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const {
      pid = "",
      time = [],
      page = 1,
      limit = 20
    } = req.body;
    const resdata = await dbServer
      .reports(
        pid,
        time[0] || "",
        time[1] || "",
        page,
        limit
      )
      .then()
      .catch(err => next(err));
    if (resdata) {
      await dbSystem.addoperatelog(
        req.session.user.username,
        "查看申请列表",
        "查看申请列表"
      );
      msgCode.success.data = resdata;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.parmasError);
    }
    return;
  }

  /**
   * 添加报表
   * @param req
   * @param res
   * @param next
   */
  public static async addreport(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    debug("api:addreport")("addreport:%o", req.body);
    const {  pid = 0,
      watchnum= 0,
      ptime= 0,
      stotal= 0,
      mtotal= 0,
      reporter= "",
      rdesc= "",
      goods= [] } = req.body;
    const resdata = await dbServer
      .addreport(pid, watchnum, ptime, stotal, mtotal, reporter, rdesc, req.session.user.userid)
      .then()
      .catch(err => next(err));
    debug("api:addreport")("resdata:%o", resdata);
    if (resdata[0].code === 200) {
      for (const g of goods) {
        await dbServer
          .salegoods(resdata[0].id, g.id, g.name, g.num)
          .then()
          .catch(err => next(err));
      }
      await dbSystem.addoperatelog(
        req.session.user.username,
        "添加直播报表",
        "添加直播报表:id" + resdata[0].id
      );
      res.json(msgCode.success);
    }
    return;
  }
}
export default Server;

import axios from "axios";
import * as debug from "debug";
import { NextFunction, Request, Response } from "express";
const serverCondig = require("../configs/server/api.json");
import msgCode from "../compoents/msgcode";
import dbServer from "../service/server";
import dbSystem from "../service/system";

const debugLog = debug("api:controller:server");

/**
 * 与游戏服务端交互
 *
 * @class Server
 */
class Server {
  /**
   * 获取tag列表
   * @param req
   * @param res
   * @param next
   */
  public static async tags(req: Request, res: Response, next: NextFunction) {
    const { tagname = "", time = [], page = 1, limit = 30 } = req.body;
    const shopid = req.session.user.userid;
    const resdata = await dbServer.tags(tagname, shopid, time[0] || "", time[1] || "", page, limit).then();
    await dbSystem.addoperatelog(req.session.user.username, "查看标签", "查看标签");
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
    const { tagname = ""} = req.body;
    const userid = req.session.user.userid;
    const resdata = await dbServer.addtag(tagname, userid).then();
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(req.session.user.username, "添加标签", "添加标签：tagname:" + tagname);
      msgCode.success.data = resdata;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.existsTag);
    }
    return;
  }

  /**
   * 添加tag
   * @param req
   * @param res
   * @param next
   */
  public static async deltag(req: Request, res: Response, next: NextFunction) {
    const { tagid = 0} = req.body;
    const resdata = await dbServer.deltag(tagid).then();
    if (resdata[0].code === 200) {
      await dbSystem.addoperatelog(req.session.user.username, "删除标签", "添加标签：tagid:" + tagid);
      msgCode.success.data = resdata;
      res.json(msgCode.success);
    } else {
      res.json(msgCode.existsTag);
    }
    return;
  }
}
export default Server;

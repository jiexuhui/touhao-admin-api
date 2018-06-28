import axios from "axios";
import * as debug from "debug";
import { NextFunction, Request, Response } from "express";
const serverCondig = require("../configs/server/api.json");
import msgCode from "../compoents/msgcode";

const debugLog = debug("api:controller:server");

/**
 * 与游戏服务端交互
 *
 * @class Server
 */
class Server {
  /**
   * 自定义发牌
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof Server
   */
  public static async cardsOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { game_id = 0, room_id = 0, table_id = 0, cards = [] } = req.body;

    if (game_id === 0 || room_id === 0 || cards.length <= 0) {
      res.json(msgCode.parmasError);
      return;
    }
    const env = process.env.NODE_ENV || "production";
    debugLog(`the current environment variable is: ${env}`);
    debugLog(`now send to server:${serverCondig[env].cards_order}`);
    let postUrl = "";
    if (game_id === 100) {
      postUrl = serverCondig[env].cards_order_mahjong;
    }
    if (game_id === 101) {
      postUrl = serverCondig[env].cards_order;
    }
    axios
      .post(
        postUrl,
        {
          game_id,
          room_id,
          table_id,
          cards
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then(result => {
        msgCode.success.data = result.data || [];
        res.json(msgCode.success);
      })
      .catch(err => {
        msgCode.error.msg =
          (err.response && err.response.data.err) || "未知错误";
        res.json(msgCode.error);
      });
  }
}
export default Server;

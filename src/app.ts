import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as cookieParser from "cookie-parser";
import * as debug from "debug";
import * as express from "express";
import * as session from "express-session";
import * as fs from "fs";
import * as helmet from "helmet";
import * as jwt from "jsonwebtoken";
import * as morgan from "morgan";
const multer = require("multer");
import * as path from "path";
// import { md5 } from "./compoents/crypto";
import msgCode from "./compoents/msgcode";
// import { checkMenuPermission } from "./compoents/permission";
import system from "./controller/system";
import router from "./routes";
const upload = multer({ dest: "uploads/" });
// session秘钥
const sessionSecret = "zeqg4lz67cpkutkw0oumfot5idlzog93n";
// 权限验证配置文件
const authority = require("./configs/common/authority.json");
/**
 * express Application
 *
 * @class App
 */
class App {
  // 定义app
  public app: express.Application = express();
  public debugLog = debug("api:app");
  constructor() {
    // 加载中间件
    this.middleware();
  }
  /**
   * 中间件
   *
   * @private
   * @memberof App
   */
  private middleware(): void {
    const app = this.app;
    app.all("*", (req, res, next) => {
      // 过滤掉网站图标和爬虫协议请求
      if (req.path === "/favicon.ico" || req.path === "/robots.txt") {
        return;
      }
      res.header("Access-Control-Allow-Origin", "http://localhost:9527");
      res.header(
        "Access-Control-Allow-Methods",
        "PUT, GET, POST, DELETE, OPTIONS"
      );
      // res.header("Access-Control-Allow-Headers", "X-Requested-With");
      // res.header("Access-Control-Allow-Headers", "Authorization");
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization,X-Requested-With"
      );
      res.header("Access-Control-Allow-Credentials", "true");

      if (req.method === "OPTIONS") {
        res.sendStatus(200);
      } else {
        next();
      }
      /*让options请求快速返回*/
    });
    app.use(morgan("dev")); // 打印请求
    app.use(helmet()); // 设置Http头
    app.use(compression()); // 压缩response
    app.use(bodyParser.json()); // 解析application/json
    app.use(upload.any());
    app.use(bodyParser.urlencoded({ extended: false })); // 解析application/x-www-form-urlencode
    app.use(express.static(path.join(__dirname, "public"))); // 静态资源目录
    app.use(cookieParser(sessionSecret));
    // 使用session
    app.use(
      session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {
          maxAge: 36000000000000
        }
      })
    );
    // 验证session和token
    app.use("/admin", (req, res, next) => {
      if (!authority.notneed.includes(req.originalUrl)) {
        // this.debugLog("session:%o", req.session.user);
        if (req.session === undefined) {
          res.json(msgCode.invalidToken);
          return;
        } else if (!req.session.user) {
          req.session.user = {};
          res.json(msgCode.loginExpire);
          return;
        }
        // else if (checkMenuPermission(req) === false) {
        //   // 授权
        //   res.json(msgCode.noPermission);
        //   return;
        // }
        // 接收验证头
        const token: string =
          req.headers.authorization && req.headers.authorization.toString();
        if (!token) {
          res.json(msgCode.invalidToken);
          return;
        }
        // 读取公钥，解密发来的token信息
        const cert = fs.readFileSync(
          path.join(__dirname, "./configs/rsakey/rsa_key_pub.key")
        );
        try {
          jwt.verify(
            token,
            cert,
            async (err: jwt.JsonWebTokenError, decoded: any) => {
              if (err) {
                this.debugLog(err.message);
                res.json(msgCode.expiredToken);
                return;
              }
              if (decoded) {
                const { roleid } = decoded;
                this.debugLog("roleid:" + roleid);

                // TODO:依次判断用户的信息、菜单权限、接口权限、按钮权限
                // this.debugLog("roleid:", system.checkpemission(req));
                if (!authority.actionWhitelist.includes(req.path)) {
                  const permission = await system.checkpemission(req);
                  this.debugLog("roleidperssion:%o", permission);
                  if (permission[0].code === 0) {
                    res.json(msgCode.noPermission);
                    return;
                  } else {
                    next();
                  }
                } else {
                  next();
                }
              } else {
                res.json(msgCode.invalidToken);
                return;
              }
            }
          );
        } catch (error) {
          next(error);
        }
      } else {
        this.debugLog("session:%o", req.session.user);
        next();
      }
    });
    app.use(router); // 加载路由
    // 404错误处理
    app.use((req, res, next) => {
      // res.status(404).json({ code: 404 });
      res.json({ code: 404, msg: `地址${req.originalUrl}未找到` });
      return;
    });
    // 500以及其他错误处理
    app.use((err, req, res, next) => {
      this.debugLog(err);
      // res.status(err.status || 500).json({ code: 500, data: err });
      res.json({ code: 500, msg: "服务器异常，请向管理员反馈" });
      return;
    });
  }
}

export default new App().app;

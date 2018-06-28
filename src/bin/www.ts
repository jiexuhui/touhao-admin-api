import * as debug from "debug";
import * as http from "http";
import app from "../app";

const debugLog = debug("api:*");

const port = normalizePort(process.env.PORT || 3010);
const server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * 标准化端口号
 *
 * @param {(number | string)} val 端口为字符或数字
 * @returns {(number | string | boolean)} 返回 数字|字符|布尔类型
 */
function normalizePort(val: number | string): number | string | boolean {
  const normalizeport: number = typeof val === "string" ? parseInt(val, 10) : val;
  if (isNaN(normalizeport)) {
    return val;
  } else if (normalizeport > 0) {
    return normalizeport;
  } else {
    return false;
  }
}
/**
 * 创建服务监听
 *
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  debugLog(`Listening on ${bind}`);
}
/**
 * 创建服务错误处理
 *
 * @param {NodeJS.ErrnoException} error
 */
function onError(error: NodeJS.ErrnoException) {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? `pipe ${port}` : `port ${port}`;
  switch (error.code) {
    case "EACCES":
      // tslint:disable-next-line:no-console
      console.log(`${bind}需要权限`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      // tslint:disable-next-line:no-console
      console.log(`${bind}已经在使用中`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

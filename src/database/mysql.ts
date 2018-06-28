import * as debug from "debug";
import * as mysql from "mysql";

/**
 * 返回结果
 *
 * @interface INonQueryResult
 */
interface INonQueryResult {
  /**
   * 字段数
   *
   * @type {number}
   * @memberof INonQuery
   */
  fieldCount: number;
  /**
   * 影响行数
   *
   * @type {number}
   * @memberof INonQuery
   */
  affectedRows: number;
  /**
   * 插入ID
   *
   * @type {number}
   * @memberof INonQuery
   */
  insertId: number;
  /**
   * 服务器状态
   *
   * @type {number}
   * @memberof INonQuery
   */
  serverStatus: number;
  /**
   * 警告数
   *
   * @type {number}
   * @memberof INonQuery
   */
  warningCount: number;
  /**
   * 消息
   *
   * @type {string}
   * @memberof INonQuery
   */
  message: string;
  /**
   * 协议
   *
   * @type {boolean}
   * @memberof INonQuery
   */
  protocol41: boolean;
  /**
   * 改变行数
   *
   * @type {number}
   * @memberof INonQuery
   */
  changedRows: number;
}

/**
 * 操作mysql数据库
 *
 * @class MySqlDB
 */
class MySqlDB {
  public poolConfig: mysql.PoolConfig;
  public pool: mysql.Pool;

  constructor(config) {
    this.poolConfig = config;
    this.connect();
  }
  /**
   * mysql连接
   */
  private connect() {
    debug("api:mysql:config")("%o", this.poolConfig);
    this.pool = mysql.createPool(this.poolConfig);
    /**
     * 初始化连接
     */
    this.pool.getConnection(err => {
      debug("api:mysql:connect")(err ? err.message : "connection success");
    });
    // 连接丢失重连
    this.pool.on("error", err => {
      debug("api:mysql:connect:error")(err);
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        this.connect();
      }
    });
  }
  /**
   * 执行sql语句
   * 请参考[mysql官方文档](https://github.com/mysqljs/mysql)
   *
   * @static
   * @param {string} sqlStr sql语句
   * @param {object} [params] 参数
   * @returns
   * @memberof MySqlDB
   */
  private query(sqlStr: string, params?: object) {
    return new Promise((resolve, reject) => {
      if (!sqlStr) {
        reject({ err: "non query string" });
        return;
      }
      this.pool.getConnection((err, conn) => {
        /**
         * 查询蚕食格式化
         */
        conn.config.queryFormat = function(query: string, values: any) {
          if (!values) {
            return query;
          }
          const sqlQuery = query.replace(
            /\:(\w+)/g,
            function(txt, key) {
              if (values.hasOwnProperty(key)) {
                return this.escape(values[key]);
              }
              return txt;
            }.bind(this)
          );
          return sqlQuery;
        };
        /**
         * 执行语句
         */
        conn.query(sqlStr, params, (error, results, fields) => {
          conn.release();
          if (error) {
            debug("api:mysql:query:queryerror")("%s", error.message);
            reject({ error: error.message });
            return;
          }
          debug("api:mysql:query:string")("%s", sqlStr);
          debug("api:mysql:query:params")("%o", typeof params === "undefined" ? "{}" : params);
          // debug("api:mysql:query:results")("%o", results);
          resolve(results);
        });
        /**
         * 错误处理
         */
        conn.on("error", connErr => {
          debug("api:mysql:query:error")(connErr);
          if (connErr.code === "PROTOCOL_CONNECTION_LOST") {
            this.connect();
          }
        });
      });
    }).catch(err => debug("api:mysql:query")("%s", `query - error --> ${JSON.stringify(err)}`));
  }
  /**
   *  执行存储过程，返回单条执行结果
   * @param sqlStr 执行语句
   * @param params 参数
   */
  public exec(sqlStr: string, params?: object) {
    return this.query(sqlStr, params).then((result: any) => {
      if (result.length > 0) {
        return result[0];
      }
      return [];
    });
  }
  /**
   * 执行存储过程，返回多条执行结果
   * @param sqlStr 执行语句
   * @param params 参数
   */
  public execMultiple(sqlStr: string, params?: object) {
    return this.query(sqlStr, params).then((result: any) => {
      if (result.length > 0) {
        result.splice(-1, 1);
        return result;
      }
      return [];
    });
  }
  /**
   * 执行查询SQL语句
   *
   * @static
   * @param {string} sqlStr SQL语句
   * @param {object} [params] 参数
   * @returns
   * @memberof MySqlDB
   */
  public excuteQuery(sqlStr: string, params?: object) {
    const lowerCaseSqlStr = sqlStr.toLocaleLowerCase();
    if (
      lowerCaseSqlStr.includes("insert") ||
      lowerCaseSqlStr.includes("update") ||
      lowerCaseSqlStr.includes("delete")
    ) {
      return this.excuteNonQuery(sqlStr, params);
    }
    return this.query(sqlStr, params);
  }
  /**
   * 执行非查询SQL语句
   * @param sqlStr 执行语句
   * @param params 参数
   */
  public excuteNonQuery(sqlStr: string, params?: object) {
    if (sqlStr.toLocaleLowerCase().includes("select")) {
      return this.query(sqlStr, params);
    }
    return this.query(sqlStr, params).then((result: INonQueryResult) => result);
  }
}

export default MySqlDB;

import msgCode from "./msgcode";
/**
 * 工具类
 *
 * @class Tools
 */
class Tools {
  /**
   * 通用查询结果处理
   *
   * @static
   * @param {[object]} data 数据库中查询出的数据
   * @returns 返回数组
   * @memberof Tools
   */
  public static handleResult(data: any[] | any) {
    msgCode.success.data = [];
    if (data && data.length > 0) {
      const result = data;
      if (result && result.length > 0) {
        // 如果是返回的数据库中的错误码
        if (result[0] && result[0].code) {
          const code = result[0].code;
          let msg = "";
          for (const key in msgCode) {
            if (msgCode.hasOwnProperty(key)) {
              const element = msgCode[key];
              if (element.code === code) {
                msg = element.msg;
                break;
              }
            }
          }
          result[0].msg = msg;
          return result[0];
        }
        return result;
      }
      return [];
    }
    return [];
  }
  /**
   * 荣勇查询结果处理 - 返回一条
   *
   * @static
   * @param {any[]} data 数据库中查询出的数据
   * @returns 返回对象
   * @memberof Tools
   */
  public static handleResultOne(data: any[]) {
    const result = this.handleResult(data);
    return result.length === 0 ? null : result[0];
  }
}

export default Tools;

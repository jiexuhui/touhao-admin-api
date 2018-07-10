export const msgCode = {
  noPermission: { code: -403, msg: "没有权限" },
  expiredToken: { code: -203, msg: "token过期，请重新登录" },
  invalidToken: { code: -202, msg: "token无效，请重新登录" },
  invalidRequest: { code: -201, msg: "无效请求" },
  loginExpire: { code: -200, msg: "登录过期，请重新登录" },
  invalidUser: { code: -101, msg: "用户名或密码错误" },
  loginError: { code: -100, msg: "登录失败" },
  exception: { code: -1, msg: "请求异常" },
  error: { code: 0, msg: "未知错误" },
  success: { code: 200, msg: "操作成功", data: [] || {} },
  parmasError: { code: 10001, msg: "参数错误" },
  successWithoutData: { code: 10002, msg: "请求成功，无数据" },
  existsUser: { code: 10003, msg: "已经存在相同的用户名" },
  existsRole: { code: 10004, msg: "已经存在相同的角色" },
  existsMenu: { code: 10005, msg: "已经存在相同的菜单" },
  existsTag: { code: 10006, msg: "已经存在相同的标签" },
  existsReport: { code: 10006, msg: "该主播已存在报表" },
  existsGoods: { code: 10007, msg: "已存在相同的物品" }
};
export default msgCode;

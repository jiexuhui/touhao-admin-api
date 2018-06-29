interface IUserInfo {
  userid: number;
  username: string;
}
/**
 * 菜单权限
 * @param user 用户信息
 */
export const checkMenuPermission = (req: any) => {
  const url = req.originalUrl;
  const roles = req.session.roles;
  return false;
};

/**
 * 接口权限
 * @param user 用户信息
 */
export const checkUrlPermission = (user: IUserInfo) => {
  return false;
};

/**
 * 按钮权限
 * @param user 用户信息
 */
export const checkBtnPermission = (user: IUserInfo) => {
  return false;
};

/**
 * 该用户是否在平台存在
 * @param user 用户信息
 */
export const checkIsUser = (user: IUserInfo) => {
  return false;
};

export const checkActionPermission = (roleid: number) => {
  return true;
};

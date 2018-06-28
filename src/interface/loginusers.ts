/**
 * 用户信息接口
 * 作为定义数据时的一些变量类型依据
 *
 * @export
 * @interface IUserInfo
 */
export interface ILoginUser {
  userid: number;
  username: string;
  avatar: string;
  token?: string;
}

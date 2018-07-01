import * as debug from "debug";
import { NextFunction, Request, Response } from "express";
import msgCode from "../compoents/msgcode";
import dbSystem from "../service/system";

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

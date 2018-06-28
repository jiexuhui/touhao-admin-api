import * as crypto from "crypto";

/**
 * md5加密
 * @param str 加密串
 * @param num 需要多长的字符串,默认32位
 * @param format 大小写 默认小写，如需大写，传参UPPERCASE
 */
export const md5 = (str: string, num: number = 32, format: string = "LOWERCASE"): string => {
  let encrypted = crypto
    .createHash("md5")
    .update(str)
    .digest("hex");
  if (num !== 32) {
    encrypted = encrypted.substr(0, num);
  }
  if (format === "UPPERCASE") {
    encrypted = encrypted.toLocaleLowerCase();
  }
  return encrypted;
};

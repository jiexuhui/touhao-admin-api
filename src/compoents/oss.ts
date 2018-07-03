import OSS from "ali-oss";
import co from "co";

const client = new OSS({
  region: "test",
  accessKeyId: "test",
  accessKeySecret: "test"
});

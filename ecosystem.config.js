module.exports = {
  apps: [
    {
      name: "rs-admin-api",
      script: "dist/bin/www.js",
      watch: true,
      instances: "max", // 启用4个实例，如果设置为0或者'max'，则根据CPU数量启动最大进程
      exec_mode: "cluster", // 使用集群方式
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};

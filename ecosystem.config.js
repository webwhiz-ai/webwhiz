module.exports = {
  apps: [
    {
      name: "web",
      script: "./dist/main.js",
    },
    {
      name: "crawler_worker",
      script: "./dist/crawler.main.js",
    },
    {
      name: "celery_worker",
      cwd: "workers/",
      script: "venv/bin/python",
      args: "-m celery -A worker worker -l info --concurrency 2",
      watch: false,
      interpreter: "",
      max_memory_restart: "1G"
    }
  ],
};

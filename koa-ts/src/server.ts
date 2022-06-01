import cluster from "cluster";
import "dotenv/config";
import http from "http";

const port = (p: string) => parseInt(p, 10) || 8421;
const proc = (p: string) => parseInt(p, 10) || 1;

if (cluster.isMaster) {
    console.info(`主进程 PID:${process.pid}`);

    for (let i = 0; i < proc(process.env.PROC || ""); i += 1) {
        cluster.fork();
    }

    cluster.on("online", (worker) => {
        console.info(`子进程 PID:${worker.process.pid}, 端口:${port(process.env.PORT || "")}`);
    });

    cluster.on("exit", (worker, code, signal) => {
        console.error(`子进程 PID:${worker.process.pid}终止，错误代码:${code}，信号:${signal}`);
        console.info(`由主进程(PID:${process.pid})创建新的子进程`);
        cluster.fork();
    });
} else {
    import("./app").then(({ app }) => {
        http.createServer(app.callback()).listen(port(process.env.PORT || ""));
    });
}

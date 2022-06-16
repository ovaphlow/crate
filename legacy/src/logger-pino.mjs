import pino from "pino";
import pretty from "pino-pretty";

export const logger = pino(
    pretty({
        colorize: true,
        translateTime: true,
    })
);

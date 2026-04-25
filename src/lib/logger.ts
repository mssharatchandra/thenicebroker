import { isProd } from "./env";

type Level = "debug" | "info" | "warn" | "error";

interface LogFields {
  [key: string]: unknown;
}

function emit(level: Level, msg: string, fields?: LogFields) {
  const line = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  };
  // Plain JSON in prod (parseable), pretty in dev.
  if (isProd) {
    console.log(JSON.stringify(line));
  } else {
    const tag = `[${level}]`;
    console.log(tag, msg, fields ?? "");
  }
}

export const log = {
  debug: (msg: string, fields?: LogFields) => emit("debug", msg, fields),
  info: (msg: string, fields?: LogFields) => emit("info", msg, fields),
  warn: (msg: string, fields?: LogFields) => emit("warn", msg, fields),
  error: (msg: string, fields?: LogFields) => emit("error", msg, fields),
};

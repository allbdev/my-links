// Applies the "headers" rules from vercel.json, so the local preview (and the
// e2e tests) send the same headers as production. Supports the source
// patterns this repo uses: literal paths and "/(.*)".
import { readFileSync } from "node:fs";

export interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

export function loadHeaderRules(file = "vercel.json"): HeaderRule[] {
  const config = JSON.parse(readFileSync(file, "utf8")) as { headers?: HeaderRule[] };
  return config.headers ?? [];
}

function sourceToRegExp(source: string): RegExp {
  if (!/^\/[\w\-./()*]*$/.test(source)) throw new Error(`Unsupported header source: ${source}`);
  const pattern = source
    .split("(.*)")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${pattern}$`);
}

/** Headers for a request path; later rules override earlier ones, keys are lower-cased. */
export function headersFor(path: string, rules: HeaderRule[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rule of rules) {
    if (!sourceToRegExp(rule.source).test(path)) continue;
    for (const { key, value } of rule.headers) result[key.toLowerCase()] = value;
  }
  return result;
}

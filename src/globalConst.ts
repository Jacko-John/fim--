import { CodeContext } from "./types/context";

export const CURSOR_HOLDER = "<$cursor$>";
export const RAW_SNIPPET = "RAW_SNIPPET";
export const AST_SNIPPET = "AST_SNIPPET";
export const DEFAULT_CONTEXT: CodeContext = {
  prefix: "",
  suffix: "",
  prefixWithMid: "",
  suffixWithMid: "",
  prefixOnCursor: "",
  cursor: {
    line: -1,
    col: -1,
  },
};

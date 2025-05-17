import * as vscode from "vscode";
// import Parser from "tree-sitter";
// import { CURSOR_HOLDER } from "../../globalConst";
// import { spawn, spawnSync } from "child_process";

// export function getCodeCST(editor: vscode.TextEditor): Parser.Tree | undefined {
//     if(editor){
//         const code = editor.document.getText();
//         const fileName = editor.document.fileName;

//         // npm install tree-sitter@0.21.1
//         const Parser = require("tree-sitter");
//         const parser = new Parser();

//         if(fileName.endsWith(".js") || fileName.endsWith(".ts")){
//             // npm install tree-sitter-javascript@0.23.1
//             const JavaScript = require("tree-sitter-javascript");
//             parser.setLanguage(JavaScript);
//         }else if(fileName.endsWith(".py")){
//             // npm install tree-sitter-python@0.23.3
//             const Python = require("tree-sitter-python");
//             parser.setLanguage(Python);
//         }else if(fileName.endsWith(".cpp")){
//             // npm install tree-sitter-cpp@0.23.2
//             const Cpp = require("tree-sitter-cpp");
//             parser.setLanguage(Cpp);
//         }else if(fileName.endsWith(".c")){
//             // npm install tree-sitter-c@0.20.7
//             // C source code can't be parsed currently.
//             const C = require("tree-sitter-c");
//             parser.setLanguage(C);
//         }
//         const tree = parser.parse(code);
//         console.log('-----------------------------------');
//         console.log(code);
//         console.log('**********');
//         console.log(tree.rootNode.toString());

//         return tree;
//     }

//     return undefined;
// }

export enum LanguageName {
  CPP = "cpp",
  C_SHARP = "c_sharp",
  C = "c",
  CSS = "css",
  PHP = "php",
  BASH = "bash",
  JSON = "json",
  TYPESCRIPT = "typescript",
  TSX = "tsx",
  ELM = "elm",
  JAVASCRIPT = "javascript",
  PYTHON = "python",
  ELISP = "elisp",
  ELIXIR = "elixir",
  GO = "go",
  EMBEDDED_TEMPLATE = "embedded_template",
  HTML = "html",
  JAVA = "java",
  LUA = "lua",
  OCAML = "ocaml",
  QL = "ql",
  RESCRIPT = "rescript",
  RUBY = "ruby",
  RUST = "rust",
  SYSTEMRDL = "systemrdl",
  TOML = "toml",
  SOLIDITY = "solidity",
}

export const supportedLanguages: { [key: string]: LanguageName } = {
  cpp: LanguageName.CPP,
  hpp: LanguageName.CPP,
  cc: LanguageName.CPP,
  cxx: LanguageName.CPP,
  hxx: LanguageName.CPP,
  cp: LanguageName.CPP,
  hh: LanguageName.CPP,
  inc: LanguageName.CPP,
  // Depended on this PR: https://github.com/tree-sitter/tree-sitter-cpp/pull/173
  // ccm: LanguageName.CPP,
  // c++m: LanguageName.CPP,
  // cppm: LanguageName.CPP,
  // cxxm: LanguageName.CPP,
  cs: LanguageName.C_SHARP,
  c: LanguageName.C,
  h: LanguageName.C,
  css: LanguageName.CSS,
  php: LanguageName.PHP,
  phtml: LanguageName.PHP,
  php3: LanguageName.PHP,
  php4: LanguageName.PHP,
  php5: LanguageName.PHP,
  php7: LanguageName.PHP,
  phps: LanguageName.PHP,
  "php-s": LanguageName.PHP,
  bash: LanguageName.BASH,
  sh: LanguageName.BASH,
  json: LanguageName.JSON,
  ts: LanguageName.TYPESCRIPT,
  mts: LanguageName.TYPESCRIPT,
  cts: LanguageName.TYPESCRIPT,
  tsx: LanguageName.TSX,
  // vue: LanguageName.VUE,  // tree-sitter-vue parser is broken
  // The .wasm file being used is faulty, and yaml is split line-by-line anyway for the most part
  // yaml: LanguageName.YAML,
  // yml: LanguageName.YAML,
  elm: LanguageName.ELM,
  js: LanguageName.JAVASCRIPT,
  jsx: LanguageName.JAVASCRIPT,
  mjs: LanguageName.JAVASCRIPT,
  cjs: LanguageName.JAVASCRIPT,
  py: LanguageName.PYTHON,
  // ipynb: LanguageName.PYTHON, // It contains Python, but the file format is a ton of JSON.
  pyw: LanguageName.PYTHON,
  pyi: LanguageName.PYTHON,
  el: LanguageName.ELISP,
  emacs: LanguageName.ELISP,
  ex: LanguageName.ELIXIR,
  exs: LanguageName.ELIXIR,
  go: LanguageName.GO,
  eex: LanguageName.EMBEDDED_TEMPLATE,
  heex: LanguageName.EMBEDDED_TEMPLATE,
  leex: LanguageName.EMBEDDED_TEMPLATE,
  html: LanguageName.HTML,
  htm: LanguageName.HTML,
  java: LanguageName.JAVA,
  lua: LanguageName.LUA,
  luau: LanguageName.LUA,
  ocaml: LanguageName.OCAML,
  ml: LanguageName.OCAML,
  mli: LanguageName.OCAML,
  ql: LanguageName.QL,
  res: LanguageName.RESCRIPT,
  resi: LanguageName.RESCRIPT,
  rb: LanguageName.RUBY,
  erb: LanguageName.RUBY,
  rs: LanguageName.RUST,
  rdl: LanguageName.SYSTEMRDL,
  toml: LanguageName.TOML,
  sol: LanguageName.SOLIDITY,

  // jl: LanguageName.JULIA,
  // swift: LanguageName.SWIFT,
  // kt: LanguageName.KOTLIN,
  // scala: LanguageName.SCALA,
};

export async function getParserForFile(editor: vscode.TextEditor) {
  // Removed unnecessary Parser.init() call as it does not exist in the library.
  // await Parser.init().then(() => {
  //   const fileName = editor.document.fileName;
  //   const language = supportedLanguages[
  //     fileName.split(".").pop() as keyof typeof supportedLanguages];

  //   if (language) {
  //     const parser = new Parser();
  //     return parser.setLanguage(
  //       require(`tree-sitter-${supportedLanguages[language]}`)
  //     );
  //   } else {
  //     console.log("Language not supported");
  //     return undefined;
  //   }
  // });
  // 1. 初始化 WASM 运行时
  // initializeParser();

  // 2. 创建解析器实例
  // const parser = new Parser();

  // 3. 加载语言语法文件（如 JavaScript）
  // const {Language} = require("web-tree-sitter");
  // const Lang = await Language.load('public/tree-sitter-javascript.wasm');
  // parser.setLanguage(Lang);

  // return parser;
}


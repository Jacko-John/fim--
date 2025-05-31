import path from "path";
import * as vscode from "vscode";
import {
  javascriptQuery,
  typescriptQuery,
  pythonQuery,
  rustQuery,
  goQuery,
  cppQuery,
  cQuery,
  csharpQuery,
  rubyQuery,
  javaQuery,
  phpQuery,
  swiftQuery,
  kotlinQuery,
} from "./queries";
const { Query } = require("web-tree-sitter");

const { Parser } = require("web-tree-sitter");

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

export const fileDeclarations: { [key: string]: string[] } = {};

let isParserInited = false;
async function initParser() {
  if (!isParserInited) {
    await Parser.init().then(() => {
      console.log("web-tree-sitter Parser init success");
    });
    isParserInited = true;
  }
}

// 运行时添加wasm文件
async function loadLanguage(langName: string) {
  const { Language } = require("web-tree-sitter");
  return await Language.load(
    path.join(__dirname, "out", `tree-sitter-${langName}.wasm`),
  );
}

function loadQuery(langName: LanguageName) {
  switch (langName) {
    case LanguageName.CPP:
      return cppQuery;
    case LanguageName.C_SHARP:
      return csharpQuery;
    case LanguageName.C:
      return cQuery;
    case LanguageName.PHP:
      return phpQuery;
    case LanguageName.TYPESCRIPT:
      return typescriptQuery;
    case LanguageName.TSX:
      return typescriptQuery;
    case LanguageName.JAVASCRIPT:
      return javascriptQuery;
    case LanguageName.PYTHON:
      return pythonQuery;
    case LanguageName.GO:
      return goQuery;
    case LanguageName.JAVA:
      return javaQuery;
    case LanguageName.RUBY:
      return rubyQuery;
    case LanguageName.RUST:
      return rustQuery;
    default:
      throw new Error(`Unsupported language:${langName}`);
  }
}

export async function parseFile(editor: vscode.TextEditor) {
  if (!editor) return null;
  try {
    await initParser();
    const fileName = editor.document.fileName;
    const fileContent = editor.document.getText();
    if (!fileName.split(".").pop()) return null;
    const languageName =
      supportedLanguages[fileName.split(".").pop() as string];
    let language = loadLanguage(languageName);
    language
      .then((lang: any) => {
        console.log("load language success");
        const parser = new Parser();
        parser.setLanguage(lang);
        console.log("create parser and query success");

        // Parse the file content into an Abstract Syntax Tree (AST), a tree-like representation of the code
        const tree = parser.parse(fileContent);
        //traverseTreeRecursive(tree.rootNode);
        const declarations = findDeclarationName(tree.rootNode, fileContent);
        if (declarations.length !== 0) {
          fileDeclarations[
            vscode.workspace.asRelativePath(editor.document.uri)
          ] = new Array(...declarations);
        }
        console.log("****Parase file success****");
        console.log(fileDeclarations);
        return;
      })
      .catch((e: any) => {
        console.log("load language error", e);
      });
  } catch (e) {
    console.error("Parse file error", e);
  }
}

const GET_SYMBOLS_FOR_NODE_TYPES: string[] = [
  "class_declaration",
  "class_definition",
  "class_specifier",
  "function_item", // function name = first "identifier" child
  "function_definition",
  "function_declaration",
  "method_declaration", // method name = first "identifier" child
  "method_definition",
  "generator_function_declaration",
  // property_identifier
  // field_declaration
  //"arrow_function",
];

function findDeclarationName(root: any, fileContent: string): string[] {
  const declaration: string[] = [];

  const stack = [root];
  //父结点栈，用于进行范围检查
  const parentStack: any[] = [];
  //是否需要给字符串末尾添加 '}'，用于闭合函数或类的声明
  const needEndSign: boolean[] = [];
  //制表栈，让字符串好看些
  const tabSpaceStack: string[] = [];
  const lines = fileContent.split("\n");
  let declarationText = "";
  while (stack.length > 0) {
    const node = stack.pop()!;
    node.children.forEach((child: any) => {
      stack.push(child);
    });
    //flag避免无效输出
    let flag = false;
    while (parentStack.length > 0) {
      flag = true;
      //检查当前结点是否在父结点范围内
      const currentParent = parentStack.pop()!;
      if (
        node.startPosition.row >= currentParent.startPosition.row &&
        node.endPosition.row <= currentParent.endPosition.row
      ) {
        parentStack.push(currentParent);
        break;
      }
      //检查是否需要添加 制表 和 '}' 进行闭合
      const space = tabSpaceStack.pop();
      if (needEndSign.pop()) {
        declarationText += `${space}}\n`;
      }
    }
    if (flag && parentStack.length === 0) {
      console.log("-----------------");
      console.log(`Get declaration:\n${declarationText}`);
      declaration.push(declarationText);
      declarationText = "";
    }

    if (GET_SYMBOLS_FOR_NODE_TYPES.includes(node.type)) {
      parentStack.push(node);
      //获取前置空格用于后续美化输出
      const match = lines[node.startPosition.row].match(/^\s*/);
      tabSpaceStack.push(match ? match[0] : "");
      // console.log('-----------------');
      // console.log(`Declaration found: ${node.type}, \n${node.text}`);

      //函数定义的参数列表可能分行，需要全部添加进来
      let offset = 0;
      while (
        !lines[node.startPosition.row + offset].includes(";") &&
        !lines[node.startPosition.row + offset].includes("{")
      ) {
        declarationText += `${lines[node.startPosition.row + offset]}\n`;
        offset++;
      }
      //存在 '}' 或 ';' 则在后续无需添加 '}' 进行闭合
      if (
        lines[node.startPosition.row + offset].includes("}") ||
        lines[node.startPosition.row + offset].includes(";")
      ) {
        needEndSign.push(false);
      } else {
        needEndSign.push(true);
      }
      declarationText += `${lines[node.startPosition.row + offset]}\n`;
    }
  }
  return declaration;
}

function traverseTreeRecursive(root: any) {
  const stack = [root];

  while (stack.length > 0) {
    const node = stack.pop()!;
    for (const child of node.children) {
      stack.push(child);
    }
    // 跳过匿名节点（如标点、括号等）
    if (!node.isNamed) continue;

    // 处理当前命名节点
    console.log("*****");
    printNode(node);
  }
  // console.log('*****');
  // printNode(root);
  // console.log('***parent***');
  // printNode(root.parent);
}

function printNode(node: any) {
  console.log(`Node Type: ${node.type}`);
  console.log(`Text: ${node.text}`);
  console.log(
    `Range: [${node.startPosition.row},${node.startPosition.column}] - [${node.endPosition.row},${node.endPosition.column}]`,
  );
  console.log(`Children Count: ${node.childCount}`);
}

import * as vscode from "vscode";
import Parser from "tree-sitter";
import { CURSOR_HOLDER } from "../../globalConst";
import { spawn, spawnSync } from "child_process";

export interface CodeCST {
  tree: Parser.Tree | undefined,
}

export function getCodeCST(editor: vscode.TextEditor | undefined,
  ): Promise<CodeCST> {
  return new Promise<CodeCST>(async () => {
    const editor = vscode.window.activeTextEditor;
    if(editor){
        const code = editor.document.getText();
        const fileName = editor.document.fileName;
    
        // npm install tree-sitter@0.21.1
        const Parser = require("tree-sitter");
        const parser = new Parser();

        if(fileName.endsWith(".js") || fileName.endsWith(".ts")){
            // npm install tree-sitter-javascript@0.23.1
            const JavaScript = require("tree-sitter-javascript");
            parser.setLanguage(JavaScript);
        }else if(fileName.endsWith(".py")){
            // npm install tree-sitter-python@0.23.3
            const Python = require("tree-sitter-python");
            parser.setLanguage(Python);
        }else if(fileName.endsWith(".cpp")){
            // npm install tree-sitter-cpp@0.23.2
            const Cpp = require("tree-sitter-cpp");
            parser.setLanguage(Cpp);
        }else if(fileName.endsWith(".c")){
            // npm install tree-sitter-c@0.20.7
            // C source code can't be parsed currently.
            const C = require("tree-sitter-c");
            parser.setLanguage(C);
        }
        const tree = parser.parse(code);
        console.log('-----------------------------------');
        console.log(code);
        console.log('**********');
        console.log(tree.rootNode.toString());

        return {
            tree,
        };
    }

    return { tree: null };
  });
}
const Parser = require('tree-sitter');
const Gregorio = require('./bindings/node');

const parser = new Parser();
parser.setLanguage(Gregorio);

const sourceCode = `name: Kyrie <v>\\textbf{Eleison}</v> - Test;
annotation: Mode <v>\\textit{VI}</v>;
commentary: This chant uses <v>\\emph{special}</v> notation;
mode: 6;
%%
Ky(f)ri(g)e(h) e(i)le(j)i(k)son.(l)`;

console.log('Testing tree-sitter with LaTeX in headers...');
const tree = parser.parse(sourceCode);

function printTree(node, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${node.type}: ${node.text ? JSON.stringify(node.text) : ''}`);
  
  for (const child of node.children) {
    printTree(child, depth + 1);
  }
}

printTree(tree.rootNode);
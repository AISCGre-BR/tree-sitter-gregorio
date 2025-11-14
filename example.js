/**
 * Example usage of tree-sitter-gregorio parser
 */

const Parser = require('./bindings/node');
const fs = require('fs');

// Example GABC file content
const gabcContent = `name: Example Antiphon;
mode: 1;
language: latin;

%%

(f) Ex(g)am(h)ple(i) (,) an(j)tip(k)hon(l) (;)`;

// Parse the content
const parser = new Parser();
const tree = parser.parse(gabcContent);

// Print the syntax tree
console.log('Syntax Tree:');
console.log(tree.rootNode.toString());

// Example: Extract all headers
function extractHeaders(node) {
  const headers = [];
  
  function traverse(n) {
    if (n.type === 'header') {
      const name = n.childForFieldName('name')?.text;
      const value = n.childForFieldName('value')?.text;
      if (name && value) {
        headers.push({ name, value });
      }
    }
    for (const child of n.children) {
      traverse(child);
    }
  }
  
  traverse(node);
  return headers;
}

// Example: Extract all notes
function extractNotes(node) {
  const notes = [];
  
  function traverse(n) {
    if (n.type === 'note') {
      const pitch = n.childForFieldName('pitch')?.text;
      notes.push({ pitch, text: n.text });
    }
    for (const child of n.children) {
      traverse(child);
    }
  }
  
  traverse(node);
  return notes;
}

console.log('\nHeaders:');
console.log(extractHeaders(tree.rootNode));

console.log('\nNotes:');
console.log(extractNotes(tree.rootNode));


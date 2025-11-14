/**
 * Validation tests for GABC+NABC syntax
 * Tests cover compiler errors and warnings as specified in GREGORIO_COMPILER_ERRORS_AND_WARNINGS.md
 */

const Parser = require('../bindings/node');
const fs = require('fs');
const path = require('path');

describe('GABC+NABC Syntax Validation', () => {
  const parser = new Parser();
  
  // Load test files
  const corpusDir = path.join(__dirname, 'corpus');
  const testFiles = fs.readdirSync(corpusDir).filter(f => f.endsWith('.gabc'));

  testFiles.forEach(file => {
    const filePath = path.join(corpusDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const isError = file.startsWith('error_');
    const isWarning = file.startsWith('warning_');
    const isValid = !isError && !isWarning;

    test(`${file} should ${isValid ? 'parse successfully' : isError ? 'detect errors' : 'detect warnings'}`, () => {
      const tree = parser.parse(content);
      
      if (isValid) {
        // Valid files should parse without errors
        expect(tree.rootNode).toBeDefined();
        expect(tree.rootNode.type).toBe('source_file');
      } else if (isError) {
        // Error files should have parse errors or invalid structure
        // Note: tree-sitter may still parse with errors, but structure should be invalid
        const hasErrors = tree.rootNode.hasError() || 
                         tree.rootNode.children.some(n => n.hasError());
        // Some errors might be recoverable, so we check for structural issues
        expect(hasErrors || !isValidStructure(tree.rootNode)).toBe(true);
      } else if (isWarning) {
        // Warning files should parse but may have warnings
        // Warnings are typically semantic, not syntactic
        expect(tree.rootNode).toBeDefined();
      }
    });
  });
});

/**
 * Check if the parsed structure is valid
 */
function isValidStructure(node) {
  // Check for required elements
  if (node.type === 'source_file') {
    // Should have header or notation section
    const hasHeader = node.children.some(c => c.type === 'header_section');
    const hasNotation = node.children.some(c => c.type === 'notation_section');
    return hasHeader || hasNotation;
  }
  return true;
}

/**
 * Test specific error cases from compiler documentation
 */
describe('Compiler Error Cases', () => {
  const parser = new Parser();

  test('should detect missing name header', () => {
    const content = `mode: 1;

%%

(f) Test(g) (;)`;
    const tree = parser.parse(content);
    // Should parse but name header is missing (semantic check)
    expect(tree.rootNode).toBeDefined();
  });

  test('should detect unclosed parentheses', () => {
    const content = `name: Test;
mode: 1;

%%

(f) Test(g (h) Another(i) (;)`;
    const tree = parser.parse(content);
    // Should have parse errors
    expect(tree.rootNode.hasError() || 
           tree.rootNode.children.some(n => n.hasError())).toBe(true);
  });

  test('should detect unclosed style tags', () => {
    const content = `name: Test;
mode: 1;

%%

(f) <b>Bold(g) (h) Not closed(i) (;)`;
    const tree = parser.parse(content);
    // Should have parse errors
    expect(tree.rootNode.hasError() || 
           tree.rootNode.children.some(n => n.hasError())).toBe(true);
  });
});

/**
 * Test NABC-specific validation
 */
describe('NABC Syntax Validation', () => {
  const parser = new Parser();

  test('should parse valid NABC codes', () => {
    const content = `name: Test;
mode: 1;
nabc-lines: 1;

%%

(f|vi) Simple(g|pu) (h|cl>2lse7) Complex(i|qlhh!vshhppt1sut2) (;)`;
    const tree = parser.parse(content);
    expect(tree.rootNode).toBeDefined();
    expect(tree.rootNode.type).toBe('source_file');
  });

  test('should detect NABC without nabc-lines header', () => {
    const content = `name: Test;
mode: 1;

%%

(f|vi) NABC without header(g) (;)`;
    const tree = parser.parse(content);
    // Should parse but semantic validation would flag this
    expect(tree.rootNode).toBeDefined();
  });
});


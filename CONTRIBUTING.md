# Contributing to tree-sitter-gregorio

Thank you for your interest in contributing to tree-sitter-gregorio!

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate the parser:
   ```bash
   npm run generate
   ```

4. Build the bindings:
   ```bash
   npm run build
   ```

5. Run tests:
   ```bash
   npm test
   ```

## Grammar Development

The grammar is defined in `grammar.js` using the tree-sitter grammar DSL. When making changes:

1. Update `grammar.js`
2. Run `npm run generate` to regenerate the parser
3. Add test cases in `test/corpus/`
4. Run `npm test` to verify

## Test Files

Test files are located in `test/corpus/`:

- Files starting with `valid_` should parse successfully
- Files starting with `error_` should detect syntax errors
- Files starting with `warning_` should parse but may have semantic warnings

## Grammar Rules

When adding new grammar rules:

1. Follow the structure defined in the specification documents
2. Add appropriate test cases
3. Document complex rules with comments
4. Ensure conflicts are properly resolved

## References

- [GABC Syntax Specification](docs/GABC_SYNTAX_SPECIFICATION.md)
- [NABC Syntax Specification](docs/NABC_SYNTAX_SPECIFICATION.md)
- [Gregorio Compiler Errors and Warnings](docs/GREGORIO_COMPILER_ERRORS_AND_WARNINGS.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)


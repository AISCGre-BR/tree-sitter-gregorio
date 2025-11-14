# Project Structure

```
tree-sitter-gregorio/
├── grammar.js                          # Main grammar definition
├── package.json                        # Node.js package configuration
├── README.md                           # Main documentation
├── CONTRIBUTING.md                     # Contribution guidelines
├── example.js                          # Usage example
├── test_summary.md                     # Test files summary
├── .gitignore                          # Git ignore rules
├── .editorconfig                       # Editor configuration
├── .tree-sitter-config.json           # Tree-sitter configuration
│
├── bindings/
│   └── node/
│       ├── binding.gyp                 # Node.js binding configuration
│       └── index.js                    # Node.js binding entry point
│
├── test/
│   ├── corpus/                         # Test files directory
│   │   ├── valid_*.gabc               # Valid syntax tests (14 files)
│   │   ├── error_*.gabc               # Error detection tests (7 files)
│   │   └── warning_*.gabc             # Warning detection tests (1 file)
│   └── validation_test.js              # Validation test suite
│
└── docs/                               # Documentation directory
    ├── PROJECT_STRUCTURE.md            # This file
    ├── GABC_SYNTAX_SPECIFICATION.md    # GABC syntax reference
    ├── NABC_SYNTAX_SPECIFICATION.md    # NABC syntax reference
    └── GREGORIO_COMPILER_ERRORS_AND_WARNINGS.md  # Error/warning reference
```

## Key Files

### Grammar Definition
- **grammar.js**: Defines the complete grammar for GABC+NABC syntax using tree-sitter DSL

### Test Files
- **test/corpus/**: Contains 22 test files covering:
  - Valid syntax examples
  - Error cases
  - Warning cases

### Documentation
- **README.md**: Project overview and usage (root directory)
- **CONTRIBUTING.md**: Development guidelines (root directory)
- **docs/**: Documentation directory containing:
  - **PROJECT_STRUCTURE.md**: This file - project structure overview
  - **GABC_SYNTAX_SPECIFICATION.md**: Complete GABC syntax specification
  - **NABC_SYNTAX_SPECIFICATION.md**: Complete NABC syntax specification
  - **GREGORIO_COMPILER_ERRORS_AND_WARNINGS.md**: Compiler error and warning reference

## Next Steps

1. Generate parser: `npm run generate`
2. Build bindings: `npm run build`
3. Run tests: `npm test`
4. Use parser: See `example.js`


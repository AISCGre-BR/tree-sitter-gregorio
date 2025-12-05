#!/usr/bin/env python3
"""
Script to regenerate expected outputs for tree-sitter test corpus.
Uses 'npx tree-sitter parse' to generate the expected tree structure.
"""

import re
import subprocess
import sys
from pathlib import Path


def parse_gabc_code(gabc_code: str) -> str:
    """Parse GABC code using tree-sitter and return the tree structure."""
    # Create a temporary file with the GABC code
    temp_file = Path("/tmp/temp_gabc.gabc")
    temp_file.write_text(gabc_code)
    
    # Run tree-sitter parse
    result = subprocess.run(
        ["npx", "tree-sitter", "parse", str(temp_file)],
        capture_output=True,
        text=True,
        cwd=Path.cwd()
    )
    
    if result.returncode != 0:
        print(f"Error parsing GABC code: {result.stderr}", file=sys.stderr)
        return ""
    
    # Clean up temp file
    temp_file.unlink()
    
    # Remove position information [row, col] - [row, col]
    output = result.stdout.strip()
    output = re.sub(r' \[\d+, \d+\] - \[\d+, \d+\]', '', output)
    
    return output


def process_test_file(file_path: Path) -> str:
    """Process a test corpus file and regenerate expected outputs."""
    content = file_path.read_text()
    
    # Pattern to match test cases:
    # ====\ntitle\n====\n\ntest content\n\n----\n\nexpected output
    pattern = r'(={80,}\n.*?\n={80,}\n\n.*?%%\n\n.*?\n\n)([-]{80,}\n\n)(.*?)(?=\n\n={80,}|\Z)'
    
    def replace_output(match):
        header_and_code = match.group(1)
        separator = match.group(2)
        
        # Extract the GABC code (between %% and the separator)
        code_match = re.search(r'%%\n\n(.*?)\n\n$', header_and_code, re.DOTALL)
        
        if not code_match:
            # No code found, keep as is
            return match.group(0)
        
        gabc_code = code_match.group(1)
        
        # Parse the GABC code to get expected output
        expected_output = parse_gabc_code(gabc_code)
        
        if not expected_output:
            print(f"Warning: Could not generate output", file=sys.stderr)
            return match.group(0)
        
        # Return reconstructed test case with new expected output
        return header_and_code + separator + expected_output
    
    # Replace all expected outputs while preserving test structure
    new_content = re.sub(pattern, replace_output, content, flags=re.DOTALL)
    
    return new_content


def main():
    """Main function to process all test corpus files."""
    test_dir = Path("test/corpus")
    
    if not test_dir.exists():
        print(f"Error: Test directory '{test_dir}' not found", file=sys.stderr)
        sys.exit(1)
    
    # Process all .txt files in the corpus directory
    for test_file in sorted(test_dir.glob("*.txt")):
        print(f"Processing {test_file.name}...")
        
        try:
            new_content = process_test_file(test_file)
            test_file.write_text(new_content)
            print(f"✓ Updated {test_file.name}")
        except Exception as e:
            print(f"✗ Error processing {test_file.name}: {e}", file=sys.stderr)
            continue
    
    print("\n✓ Test regeneration complete!")


if __name__ == "__main__":
    main()

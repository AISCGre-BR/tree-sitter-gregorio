#!/usr/bin/env python3
"""
Script to fix clef tests by adding name and position fields.
Only modifies (gabc_clef) nodes to add the expected fields based on the clef type.
"""

import re
from pathlib import Path


def fix_clef_node(match):
    """
    Fix a single (gabc_clef) node by adding name and position fields.
    Extracts clef type from preceding GABC code.
    """
    indent = match.group(1)
    
    # Try to find the clef type from context (look backwards in the test)
    # This is a simplified approach - we'll handle the common cases
    # The actual clef type should be inferred from the test input
    
    # For now, return a template that shows both c and f clef patterns
    # We'll need to run this intelligently per test
    return (
        f"{indent}(gabc_clef\n"
        f"{indent}  name: (c_clef)\n"
        f"{indent}  position: (clef_position))"
    )


def fix_file(file_path: Path) -> tuple[str, int]:
    """
    Fix clef nodes in a test file.
    Returns (new_content, num_fixes)
    """
    content = file_path.read_text()
    
    # Pattern to match (gabc_clef) without fields
    # Must have specific indentation and be alone on its line
    pattern = r'(\s+)\(gabc_clef\)'
    
    # Count matches first
    matches = list(re.finditer(pattern, content))
    
    if not matches:
        return content, 0
    
    # For each match, we need to determine the clef type
    # by looking at the test input above it
    new_content = content
    fixes = 0
    
    # Work backwards to preserve positions
    for match in reversed(matches):
        # Find the test input section above this match
        test_start = content.rfind('%%\n\n', 0, match.start())
        test_end = content.find('\n\n---', test_start)
        
        if test_start == -1 or test_end == -1:
            continue
            
        test_input = content[test_start:test_end]
        
        # Extract clef from test input (look for patterns like (c4), (f3), (cb2))
        clef_match = re.search(r'\(([cf]b?)([1-4])', test_input)
        
        if not clef_match:
            continue
            
        clef_name = clef_match.group(1)
        clef_pos = clef_match.group(2)
        
        # Determine the clef type node name
        if clef_name == 'c':
            clef_type = 'c_clef'
        elif clef_name == 'f':
            clef_type = 'f_clef'
        elif clef_name == 'cb':
            clef_type = 'c_clef_flat'
        else:
            continue
        
        # Build the replacement
        indent = match.group(1)
        replacement = (
            f"{indent}(gabc_clef\n"
            f"{indent}  name: ({clef_type})\n"
            f"{indent}  position: (clef_position))"
        )
        
        # Replace this occurrence
        new_content = (
            new_content[:match.start()] +
            replacement +
            new_content[match.end():]
        )
        fixes += 1
    
    return new_content, fixes


def main():
    """Main function to process all test corpus files."""
    test_dir = Path("test/corpus")
    
    if not test_dir.exists():
        print(f"Error: Test directory '{test_dir}' not found")
        return 1
    
    total_fixes = 0
    
    # Process all .txt files in the corpus directory
    for test_file in sorted(test_dir.glob("*.txt")):
        if test_file.name == '09-gabc-clefs.txt':
            # Skip the new clef test file
            continue
            
        new_content, fixes = fix_file(test_file)
        
        if fixes > 0:
            test_file.write_text(new_content)
            print(f"✓ Fixed {fixes} clef node(s) in {test_file.name}")
            total_fixes += fixes
    
    print(f"\n✓ Total: Fixed {total_fixes} clef node(s) across all files")
    return 0


if __name__ == "__main__":
    exit(main())

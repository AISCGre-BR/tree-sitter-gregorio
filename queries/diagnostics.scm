; ============================================================================
; TREE-SITTER DIAGNOSTIC QUERIES FOR GABC+NABC
; ============================================================================

; Generic syntax errors produced by the parser.
(ERROR) @error.syntax

; Heuristic capture for alternation constructs where the alternate side cannot
; be resolved into a concrete snippet node.
(snippet_list
  first: (gabc_snippet)
  "|"
  (ERROR) @warning.alternation)

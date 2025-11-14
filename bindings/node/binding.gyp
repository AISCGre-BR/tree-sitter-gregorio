{
  "targets": [
    {
      "target_name": "tree_sitter_gregorio_binding",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "src"
      ],
      "sources": [
        "src/parser.c",
        "src/binding.cc"
      ],
      "cflags_c": [
        "-std=c11"
      ],
      "conditions": [
        ["OS=='mac'", {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "MACOSX_DEPLOYMENT_TARGET": "10.7"
          },
          "sources": [
            "src/scanner.cc"
          ]
        }],
        ["OS=='win'", {
          "sources": [
            "src/scanner.cc"
          ]
        }],
        ["OS=='linux'", {
          "cflags_c": [
            "-std=c11"
          ],
          "sources": [
            "src/scanner.cc"
          ]
        }]
      ]
    }
  ]
}


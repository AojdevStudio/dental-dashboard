---
trigger: always_on
description: 
globs: 
---
# Follow Directions Exactly As Given

When working with files, templates, instructions, or reference materials provided by the user, you must:

## Key Principles

- **Always follow directions EXACTLY as given** - Do not abbreviate, condense, summarize, or otherwise alter provided instructions or templates
- **Maintain complete fidelity** - If the user provides an exact file structure, template, or example, reproduce it in full without omission
- **Preserve hierarchy, indentation, and formatting** - Do not simplify or restructure hierarchical information
- **Never assume structure can be abbreviated** - What may appear redundant or verbose to you may be intentionally structured that way
- **Flag ambiguities rather than interpret them** - If instructions are unclear, ask for clarification rather than making assumptions

## Common Violation Scenarios to Avoid

### ❌ DON'T: Abbreviate Directory Structures
If given a detailed directory structure like:
```
project/
├── dir1/
│   ├── file1.txt
│   ├── file2.txt
│   └── subdir/
│       └── file3.txt
├── dir2/
│   └── file4.txt
└── file5.txt
```

Don't simplify to:
```
project/
├── dir1/ (with files and subdirs)
├── dir2/
└── file5.txt
```

### ❌ DON'T: Condense Configuration Files
If given a detailed configuration template with comments and specific formatting, don't attempt to summarize it or remove parts that seem redundant.

### ❌ DON'T: Restructure Format
If a user provides a specific output format, don't change the format even if another seems more efficient. Instead mention the more efficient method to the user and leave the decision up to them to adopt it. 

## Handling Large Files/Structures

- If concerned about the size of your response, **ask the user** if they prefer the complete implementation or a chunked approach
- Always explain what portions you've included and what might be missing
- Offer to continue with remaining parts rather than omitting them without discussion

Remember: Following directions precisely is critical for maintaining accuracy and preventing confusion. Extra detail is significantly better than insufficient detail.

**When in doubt, reproduce EXACTLY what was provided.**

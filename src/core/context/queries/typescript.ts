/*
- function signatures and declarations
- method signatures and definitions
- abstract method signatures
- class declarations (including abstract classes)
- module declarations
*/
export default `
  (function_declaration
    name: (identifier) @name
    parameters: (formal_parameters) @params
    type: (type_annotation)? @returnType
    body: (statement_block) @body
  ) @func

  (variable_declarator
    name: (identifier) @name
    value: (arrow_function
      parameters: (formal_parameters) @params
      type: (type_annotation)? @returnType
      body: (_) @body
    ) @arrowFunc
  )
`

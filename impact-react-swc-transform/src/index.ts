// @ts-nocheck
// index.ts
import {
  Identifier,
  ImportDeclaration,
  Module,
  Program,
  CallExpression,
  Expression,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunctionExpression,
  VariableDeclarator,
  VariableDeclaration,
  JSXElement,
  JSXFragment,
  ExportDefaultDeclaration,
  Node,
  ImportSpecifier,
  Statement,
} from "@swc/core";
import { Plugin } from "@swc/core";

const OBSERVER_NAME = "__observer";

export function createTransformer(packageName: string): Plugin {
  return (program: Program, pluginOptions: any): Program => {
    console.log(pluginOptions);
    // Safely extract the filename from pluginOptions
    const filename =
      pluginOptions?.options?.filename ||
      pluginOptions?.filename ||
      pluginOptions?.cwd ||
      "";

    if (!shouldProcessFile(filename)) {
      return program;
    }

    ensureObserverImport(program, packageName);
    program = visitProgram(program);

    return program;
  };
}

// Helper function to check if the file should be processed
function shouldProcessFile(filename: string): boolean {
  const isNodeModule = filename.includes("node_modules");
  const isProjectFile = filename.startsWith(process.cwd());
  return !isNodeModule && isProjectFile;
}

// Ensure import { __observer } from 'PACKAGE_NAME' is present
function ensureObserverImport(program: Program, packageName: string): void {
  if (program.type === "Module") {
    const module = program as Module;
    let hasObserverImport = false;

    for (const item of module.body) {
      if (item.type === "ImportDeclaration") {
        const importDecl = item as ImportDeclaration;

        if (importDecl.source.value === packageName) {
          const specifiers = importDecl.specifiers;
          const hasObserverSpecifier = specifiers.some(
            (specifier) =>
              specifier.type === "ImportSpecifier" &&
              specifier.imported.type === "Identifier" &&
              specifier.imported.value === OBSERVER_NAME,
          );

          if (!hasObserverSpecifier) {
            specifiers.push({
              type: "ImportSpecifier",
              local: {
                type: "Identifier",
                value: OBSERVER_NAME,
                optional: false,
                span: importDecl.span,
              },
              imported: {
                type: "Identifier",
                value: OBSERVER_NAME,
                optional: false,
                span: importDecl.span,
              },
            } as ImportSpecifier);
          }

          hasObserverImport = true;
          break;
        }
      }
    }

    if (!hasObserverImport) {
      // Add the import declaration at the beginning
      const importDecl: ImportDeclaration = {
        type: "ImportDeclaration",
        specifiers: [
          {
            type: "ImportSpecifier",
            local: {
              type: "Identifier",
              value: OBSERVER_NAME,
              optional: false,
              span: {
                start: 0,
                end: 0,
                ctxt: 0,
              },
            },
            imported: {
              type: "Identifier",
              value: OBSERVER_NAME,
              optional: false,
              span: {
                start: 0,
                end: 0,
                ctxt: 0,
              },
            },
          } as ImportSpecifier,
        ],
        source: {
          type: "StringLiteral",
          value: packageName,
          span: {
            start: 0,
            end: 0,
            ctxt: 0,
          },
          hasEscape: false,
        },
        typeOnly: false,
        span: {
          start: 0,
          end: 0,
          ctxt: 0,
        },
        assertions: [],
      };

      module.body.unshift(importDecl);
    }
  }
}

// Main visitor function
function visitProgram(program: Program): Program {
  if (program.type === "Module") {
    const module = program as Module;

    module.body = module.body.map((item) => {
      return visitModuleItem(item);
    });
  }

  return program;
}

function visitModuleItem(item: Statement): Statement {
  if (item.type === "FunctionDeclaration") {
    return visitFunctionDeclaration(item as FunctionDeclaration);
  } else if (item.type === "VariableDeclaration") {
    return visitVariableDeclaration(item as VariableDeclaration);
  } else if (item.type === "ExportDefaultDeclaration") {
    const decl = item as ExportDefaultDeclaration;
    const declArg = decl.decl;

    if (
      declArg.type === "FunctionDeclaration" ||
      declArg.type === "FunctionExpression" ||
      declArg.type === "ArrowFunctionExpression"
    ) {
      const [shouldWrap, hasJsx] = analyzeFunction(declArg as any);

      if (shouldWrap && hasJsx) {
        const wrappedExpr = wrapExpressionWithObserver(declArg as Expression);
        decl.decl = wrappedExpr;
      } else {
        decl.decl = visitExpression(declArg as Expression);
      }

      return decl;
    }
  }

  return item;
}

function visitVariableDeclaration(
  decl: VariableDeclaration,
): VariableDeclaration {
  decl.declarations = decl.declarations.map((d) => {
    if (
      d.type === "VariableDeclarator" &&
      d.init &&
      (d.init.type === "FunctionExpression" ||
        d.init.type === "ArrowFunctionExpression")
    ) {
      const [shouldWrap, hasJsx] = analyzeFunction(d.init as any);

      if (shouldWrap && hasJsx) {
        d.init = wrapExpressionWithObserver(d.init);
      } else {
        d.init = visitExpression(d.init);
      }

      return d;
    }

    return d;
  });

  return decl;
}

function visitFunctionDeclaration(funcDecl: FunctionDeclaration): Statement {
  const [shouldWrap, hasJsx] = analyzeFunction(funcDecl);

  if (shouldWrap && hasJsx) {
    return wrapFunctionDeclarationWithObserver(funcDecl);
  } else {
    return funcDecl;
  }
}

// Analyze the function to determine if it should be wrapped
function analyzeFunction(
  func: FunctionDeclaration | FunctionExpression | ArrowFunctionExpression,
): [boolean, boolean] {
  let shouldWrapWithObserver = false;
  let hasJsx = false;

  // Traverse the function body to find use*Store calls and JSX elements
  const visitor = (node: Node): void => {
    if (!node) return;

    if (node.type === "CallExpression") {
      const callee = (node as CallExpression).callee;

      if (
        callee.type === "Identifier" &&
        node.arguments.length === 0 &&
        callee.value.startsWith("use") &&
        callee.value.endsWith("Store")
      ) {
        shouldWrapWithObserver = true;
      }
    } else if (node.type === "JSXElement" || node.type === "JSXFragment") {
      hasJsx = true;
    }

    // Recurse into child nodes
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const child = (node as any)[key];
        if (Array.isArray(child)) {
          child.forEach((c) => {
            if (c && typeof c.type === "string") {
              visitor(c);
            }
          });
        } else if (child && typeof child.type === "string") {
          visitor(child);
        }
      }
    }
  };

  visitor(func.body);

  return [shouldWrapWithObserver, hasJsx];
}

// Visit expressions
function visitExpression(expr: Expression): Expression {
  if (
    expr.type === "FunctionExpression" ||
    expr.type === "ArrowFunctionExpression"
  ) {
    const [shouldWrap, hasJsx] = analyzeFunction(expr);

    if (shouldWrap && hasJsx) {
      return wrapExpressionWithObserver(expr);
    }
  }

  return expr;
}

// Wrap function expression with __observer
function wrapExpressionWithObserver(expr: Expression): Expression {
  const callExpr: CallExpression = {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      value: OBSERVER_NAME,
      optional: false,
      span: expr.span,
    },
    arguments: [
      {
        expression: expr,
      },
    ],
    optional: false,
    span: expr.span,
    typeArguments: null,
  };

  return callExpr;
}

// Wrap function declaration with __observer
function wrapFunctionDeclarationWithObserver(
  funcDecl: FunctionDeclaration,
): VariableDeclaration {
  const funcExpr: FunctionExpression = {
    type: "FunctionExpression",
    params: funcDecl.params,
    body: funcDecl.body,
    async: funcDecl.async,
    generator: funcDecl.generator,
    span: funcDecl.span,
    decorators: funcDecl.decorators,
    returnType: funcDecl.returnType,
    typeParameters: funcDecl.typeParameters,
  };

  const initExpr = wrapExpressionWithObserver(funcExpr);

  const varDeclarator: VariableDeclarator = {
    type: "VariableDeclarator",
    span: funcDecl.span,
    id: funcDecl.identifier,
    init: initExpr,
    definite: false,
  };

  const varDecl: VariableDeclaration = {
    type: "VariableDeclaration",
    kind: "const",
    declarations: [varDeclarator],
    declare: false,
    span: funcDecl.span,
  };

  return varDecl;
}

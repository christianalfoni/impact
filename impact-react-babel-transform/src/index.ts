import { PluginObj } from "@babel/core";
import { NodePath } from "@babel/traverse";
// Explicit imports to avoid tslib dependency
import {
  isIdentifier,
  identifier,
  isImportSpecifier,
  importSpecifier,
  isFunctionDeclaration,
  isFunctionExpression,
  isArrowFunctionExpression,
  stringLiteral,
  importDeclaration,
  functionExpression,
  callExpression,
  Node,
  isExportDefaultDeclaration,
  variableDeclarator,
  variableDeclaration,
  isVariableDeclarator,
  isCallExpression,
} from "@babel/types";

const OBSERVER_NAME = "__observer";

export function createTransformer(PACKAGE_NAME: string) {
  return (): PluginObj => {
    return {
      name: "wrap-with-observer",
      visitor: {
        Program(path, state) {
          const filename = state.filename || state.file.opts.filename;

          if (filename && !shouldProcessFile(filename)) {
            // Skip processing
            return;
          }

          // Ensure import { __observer } from '@impact-react/[*]' is present
          let hasObserverImport = false;

          path.traverse({
            CallExpression(path) {
              const callee = path.node.callee;

              // Check if callee is an Identifier (e.g., a simple function name)
              if (isIdentifier(callee)) {
                const functionName = callee.name;

                // Check if the function name matches the pattern and has no arguments
                if (
                  functionName.startsWith("use") &&
                  functionName.endsWith("Store") &&
                  path.node.arguments.length === 0
                ) {
                  // Check if the call is within another function
                  let currentPath: NodePath = path;
                  let functionParent: NodePath | null = null;

                  while (currentPath.parentPath) {
                    currentPath = currentPath.parentPath;

                    if (
                      isFunctionDeclaration(currentPath.node) ||
                      isFunctionExpression(currentPath.node) ||
                      isArrowFunctionExpression(currentPath.node)
                    ) {
                      functionParent = currentPath;
                      break;
                    }
                  }

                  if (!functionParent) {
                    return;
                  }

                  let hasJsx = false;

                  functionParent.traverse({
                    JSX() {
                      hasJsx = true;
                    },
                  });

                  if (!hasJsx) {
                    return;
                  }

                  wrapFunctionWithObserver(functionParent);
                  functionParent.skip();
                }
              }
            },
            ImportDeclaration(importPath) {
              if (importPath.node.source.value === PACKAGE_NAME) {
                const hasObserverSpecifier = importPath.node.specifiers.some(
                  (specifier) =>
                    isImportSpecifier(specifier) &&
                    isIdentifier(specifier.imported) &&
                    specifier.imported.name === OBSERVER_NAME,
                );

                if (!hasObserverSpecifier) {
                  importPath.node.specifiers.push(
                    importSpecifier(
                      identifier(OBSERVER_NAME),
                      identifier(OBSERVER_NAME),
                    ),
                  );
                }

                hasObserverImport = true;
              }
            },
          });

          if (!hasObserverImport) {
            const _importDeclaration = importDeclaration(
              [
                importSpecifier(
                  identifier(OBSERVER_NAME),
                  identifier(OBSERVER_NAME),
                ),
              ],
              stringLiteral(PACKAGE_NAME),
            );
            path.unshiftContainer("body", _importDeclaration);
          }
        },
      },
    };

    function shouldProcessFile(filename: string) {
      const isNodeModule = filename.includes("node_modules");
      const isProjectFile = filename.startsWith(process.cwd());
      return !isNodeModule && isProjectFile;
    }

    function wrapFunctionWithObserver(functionPath: NodePath<Node>) {
      const funcNode = functionPath.node;

      if (isFunctionDeclaration(funcNode)) {
        // Convert FunctionDeclaration to VariableDeclaration wrapped with observer
        const id = funcNode.id;
        const funcExpression = functionExpression(
          funcNode.id,
          funcNode.params,
          funcNode.body,
          funcNode.generator,
          funcNode.async,
        );

        const observerCall = callExpression(identifier(OBSERVER_NAME), [
          funcExpression,
        ]);

        if (isExportDefaultDeclaration(functionPath.parent)) {
          functionPath.replaceWith(observerCall);
        } else if (id) {
          const _variableDeclarator = variableDeclarator(id, observerCall);
          const _variableDeclaration = variableDeclaration("const", [
            _variableDeclarator,
          ]);

          // Replace the function declaration with variable declaration
          functionPath.replaceWith(_variableDeclaration);
        }
      }

      // For VariableDeclarators (e.g., const Func = () => {})
      else if (
        isVariableDeclarator(funcNode) &&
        (isFunctionExpression(funcNode.init) ||
          isArrowFunctionExpression(funcNode.init))
      ) {
        const init = funcNode.init;

        const observerCall = callExpression(identifier(OBSERVER_NAME), [init]);

        // @ts-ignore
        functionPath.get("init").replaceWith(observerCall);
      }

      // For other cases
      else if (
        !isCallExpression(functionPath.parent) ||
        // @ts-ignore
        functionPath.parent.callee.name !== OBSERVER_NAME
      ) {
        const observerCall = callExpression(identifier(OBSERVER_NAME), [
          // @ts-ignore
          funcNode,
        ]);

        functionPath.replaceWith(observerCall);
      }
    }
  };
}

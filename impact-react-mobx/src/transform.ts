// @ts-nocheck
import { PluginObj } from "@babel/core";
import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

export default function (): PluginObj {
  return {
    name: "wrap-with-observer",
    visitor: {
      Program(path, state) {
        const filename = state.filename || state.file.opts.filename;

        if (filename && !shouldProcessFile(filename)) {
          // Skip processing
          return;
        }

        // Ensure import { observer } from 'mobx-react-lite' is present
        let hasObserverImport = false;

        path.traverse({
          CallExpression(path) {
            const callee = path.node.callee;

            // Check if callee is an Identifier (e.g., a simple function name)
            if (t.isIdentifier(callee)) {
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
                    t.isFunctionDeclaration(currentPath.node) ||
                    t.isFunctionExpression(currentPath.node) ||
                    t.isArrowFunctionExpression(currentPath.node)
                  ) {
                    functionParent = currentPath;
                    break;
                  }
                }

                // @ts-ignore
                if (functionParent && !functionParent.node._isObserverWrapped) {
                  wrapFunctionWithObserver(functionParent);
                  // @ts-ignore
                  functionParent.node._isObserverWrapped = true;
                }
              }
            }
          },
          ImportDeclaration(importPath) {
            if (importPath.node.source.value === "mobx-react-lite") {
              const hasObserverSpecifier = importPath.node.specifiers.some(
                (specifier) =>
                  t.isImportSpecifier(specifier) &&
                  t.isIdentifier(specifier.imported) &&
                  specifier.imported.name === "observer",
              );

              if (!hasObserverSpecifier) {
                importPath.node.specifiers.push(
                  t.importSpecifier(
                    t.identifier("observer"),
                    t.identifier("observer"),
                  ),
                );
              }

              hasObserverImport = true;
            }
          },
        });

        if (!hasObserverImport) {
          const importDeclaration = t.importDeclaration(
            [
              t.importSpecifier(
                t.identifier("observer"),
                t.identifier("observer"),
              ),
            ],
            t.stringLiteral("mobx-react-lite"),
          );
          path.unshiftContainer("body", importDeclaration);
        }
      },
    },
  };

  function shouldProcessFile(filename: string) {
    const isNodeModule = filename.includes("node_modules");
    const isProjectFile = filename.startsWith(process.cwd());
    return !isNodeModule && isProjectFile;
  }

  function wrapFunctionWithObserver(functionPath: NodePath<t.Node>) {
    const funcNode = functionPath.node;

    if (t.isFunctionDeclaration(funcNode)) {
      // Convert FunctionDeclaration to VariableDeclaration wrapped with observer
      const id = funcNode.id;
      const funcExpression = t.functionExpression(
        funcNode.id,
        funcNode.params,
        funcNode.body,
        funcNode.generator,
        funcNode.async,
      );

      const observerCall = t.callExpression(t.identifier("observer"), [
        funcExpression,
      ]);

      if (t.isExportDefaultDeclaration(functionPath.parent)) {
        functionPath.replaceWith(observerCall);
      } else {
        const variableDeclarator = t.variableDeclarator(id, observerCall);
        const variableDeclaration = t.variableDeclaration("const", [
          variableDeclarator,
        ]);

        // Replace the function declaration with variable declaration
        functionPath.replaceWith(variableDeclaration);
      }
    }

    // For VariableDeclarators (e.g., const Func = () => {})
    else if (
      t.isVariableDeclarator(funcNode) &&
      (t.isFunctionExpression(funcNode.init) ||
        t.isArrowFunctionExpression(funcNode.init))
    ) {
      const init = funcNode.init;

      if (!t.isCallExpression(init) || init.callee.name !== "observer") {
        const observerCall = t.callExpression(t.identifier("observer"), [init]);
        functionPath.get("init").replaceWith(observerCall);
      }
    }

    // For other cases
    else if (
      !t.isCallExpression(functionPath.parent) ||
      functionPath.parent.callee.name !== "observer"
    ) {
      const observerCall = t.callExpression(t.identifier("observer"), [
        funcNode,
      ]);

      functionPath.replaceWith(observerCall);
    }
  }
}

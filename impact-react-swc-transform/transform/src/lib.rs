use swc_ecma_ast::*;
use swc_ecma_visit::{fold_pass, noop_fold_type, Fold, FoldWith};

pub struct Config {
    package_name: String,
}

pub fn react_store_observer(package_name: String) -> impl Pass {
    fold_pass(StoreObserver {
        config: Config { package_name },
        needs_import: false,
    })
}

struct StoreObserver {
    config: Config,
    needs_import: bool,
}

impl StoreObserver {
    fn is_store_hook(&self, callee: &Callee) -> bool {
        if let Callee::Expr(expr) = callee {
            if let Expr::Ident(ident) = &**expr {
                let name = ident.sym.as_ref();
                name.starts_with("use") && name.ends_with("Store")
            } else {
                false
            }
        } else {
            false
        }
    }

    fn contains_store_hook(&self, body: &BlockStmt) -> bool {
        body.stmts.iter().any(|stmt| {
            if let Stmt::Decl(Decl::Var(var_decl)) = stmt {
                var_decl.decls.iter().any(|decl| {
                    if let Some(init) = &decl.init {
                        if let Expr::Call(call_expr) = &**init {
                            self.is_store_hook(&call_expr.callee)
                        } else {
                            false
                        }
                    } else {
                        false
                    }
                })
            } else {
                false
            }
        })
    }

    fn is_already_observed(&self, expr: &Expr) -> bool {
        if let Expr::Call(call) = expr {
            if let Callee::Expr(callee) = &call.callee {
                if let Expr::Ident(ident) = &**callee {
                    return ident.sym.as_ref() == "observer" || ident.sym.as_ref() == "__observer";
                }
            }
        }
        false
    }

    fn wrap_with_observer(&mut self, expr: Expr) -> Expr {
        self.needs_import = true;
        Expr::Call(CallExpr {
            span: Default::default(),
            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "__observer".into(),
                Default::default(),
                Default::default(),
            )))),
            args: vec![ExprOrSpread {
                spread: None,
                expr: Box::new(expr),
            }],
            type_args: None,
            ctxt: Default::default(),
        })
    }

    fn create_observer_import(&self) -> ModuleItem {
        ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
            span: Default::default(),
            specifiers: vec![ImportSpecifier::Named(ImportNamedSpecifier {
                span: Default::default(),
                local: Ident::new(
                    "__observer".into(),
                    Default::default(),
                    Default::default(),
                ),
                imported: None,
                is_type_only: false,
            })],
            src: Box::new(Str {
                span: Default::default(),
                value: self.config.package_name.clone().into(),
                raw: None,
            }),
            type_only: false,
            with: None,
            phase: Default::default(),
        }))
    }
}

impl Fold for StoreObserver {
    noop_fold_type!();

    fn fold_module(&mut self, module: Module) -> Module {
        let module = module.fold_children_with(self);
        
        if self.needs_import {
            // Check if import already exists
            let has_observer_import = module.body.iter().any(|item| {
                if let ModuleItem::ModuleDecl(ModuleDecl::Import(import)) = item {
                    import.specifiers.iter().any(|spec| {
                        if let ImportSpecifier::Named(named) = spec {
                            named.local.sym.as_ref() == "__observer"
                        } else {
                            false
                        }
                    })
                } else {
                    false
                }
            });

            if !has_observer_import {
                let mut new_body = vec![self.create_observer_import()];
                new_body.extend(module.body);
                return Module {
                    body: new_body,
                    ..module
                };
            }
        }
        
        module
    }

    fn fold_expr(&mut self, expr: Expr) -> Expr {
        // Check for existing observer before transforming children
        if self.is_already_observed(&expr) {
            return expr;
        }

        let expr = expr.fold_children_with(self);

        match &expr {
            Expr::Arrow(arrow) => {
                if let BlockStmtOrExpr::BlockStmt(block) = &*arrow.body {
                    if self.contains_store_hook(block) {
                        return self.wrap_with_observer(expr);
                    }
                }
            }
            Expr::Fn(fn_expr) => {
                if let Some(body) = &fn_expr.function.body {
                    if self.contains_store_hook(body) {
                        return self.wrap_with_observer(expr);
                    }
                }
            }
            _ => {}
        }

        expr
    }
}
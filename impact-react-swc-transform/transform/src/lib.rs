use swc_ecma_ast::*;
use swc_ecma_visit::{fold_pass, noop_fold_type, Fold, FoldWith};

pub struct Config {
    package_name: String,
}

pub fn react_store_observer(package_name: String) -> impl Pass + Fold {
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

    fn contains_jsx(&self, body: &BlockStmt) -> bool {
        for stmt in &body.stmts {
            match stmt {
                Stmt::Return(return_stmt) => {
                    if let Some(expr) = &return_stmt.arg {
                        if self.is_jsx_element(expr) {
                            return true;
                        }
                    }
                }
                _ => {}
            }
        }
        false
    }

    fn is_jsx_element(&self, expr: &Expr) -> bool {
        match expr {
            Expr::JSXElement(_) | Expr::JSXFragment(_) => true,
            Expr::Paren(paren) => self.is_jsx_element(&paren.expr),
            _ => false,
        }
    }

    fn should_transform_function(&self, body: &BlockStmt) -> bool {
        self.contains_store_hook(body) && self.contains_jsx(body)
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

    fn fold_decl(&mut self, decl: Decl) -> Decl {
        match decl {
            Decl::Fn(fn_decl) => {
                if let Some(body) = &fn_decl.function.body {
                    if self.should_transform_function(body) {
                        let ident = fn_decl.ident.clone();
                        return Decl::Var(Box::new(VarDecl {
                            span: Default::default(),
                            kind: VarDeclKind::Const,
                            declare: false,
                            decls: vec![VarDeclarator {
                                span: Default::default(),
                                name: Pat::Ident(BindingIdent {
                                    id: ident.clone(),
                                    type_ann: None,
                                }),
                                init: Some(Box::new(self.wrap_with_observer(Expr::Fn(FnExpr {
                                    ident: Some(ident),
                                    function: fn_decl.function,
                                })))),
                                definite: false,
                            }],
                            ctxt: Default::default(),
                        }));
                    }
                }
                Decl::Fn(fn_decl)
            }
            Decl::Var(var) => {
                let mut var = (*var).clone();
                for decl in &mut var.decls {
                    if let Some(init) = &decl.init {
                        match &**init {
                            Expr::Fn(fn_expr) => {
                                if let Some(body) = &fn_expr.function.body {
                                    if self.should_transform_function(body) {
                                        decl.init = Some(Box::new(self.wrap_with_observer(*init.clone())));
                                    }
                                }
                            }
                            Expr::Arrow(arrow) => {
                                if let BlockStmtOrExpr::BlockStmt(block) = &*arrow.body {
                                    if self.should_transform_function(block) {
                                        decl.init = Some(Box::new(self.wrap_with_observer(*init.clone())));
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                }
                Decl::Var(Box::new(var))
            }
            _ => decl,
        }
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
                    if self.should_transform_function(block) {
                        return self.wrap_with_observer(expr);
                    }
                }
            }
            Expr::Fn(fn_expr) => {
                if let Some(body) = &fn_expr.function.body {
                    if self.should_transform_function(body) {
                        return self.wrap_with_observer(expr);
                    }
                }
            }
            _ => {}
        }

        expr
    }
}
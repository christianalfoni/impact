#![allow(clippy::not_unsafe_ptr_arg_deref)]
use swc_core::{
    ecma::{
        ast::*,
        visit::{FoldWith, Fold},
    },
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};
use serde::Deserialize;

#[derive(Debug, Default, Deserialize)]
pub struct Config {
    pub package_name: String,
}

struct StoreObserver {
    config: Config,
    needs_import: bool,
}

impl StoreObserver {
    fn new(package_name: String) -> Self {
        Self {
            config: Config { package_name },
            needs_import: false,
        }
    }

    // ...existing StoreObserver methods from transform/src/lib.rs...
}

impl Fold for StoreObserver {
    // ...existing Fold implementation from transform/src/lib.rs...
}

#[plugin_transform]
fn swc_plugin(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let config = serde_json::from_str::<Config>(
        &metadata.get_transform_plugin_config().unwrap_or_default()
    ).unwrap_or_default();
    
    program.fold_with(&mut StoreObserver::new(config.package_name))
}
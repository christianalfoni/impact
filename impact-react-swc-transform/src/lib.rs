#![allow(clippy::not_unsafe_ptr_arg_deref)]

use react_store_observer::react_store_observer;

use swc_core::{
    ecma::{
        ast::Program,
        visit::{FoldWith},
    },
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};
use serde::Deserialize;

// We can reuse the Config from transform module, but need it here for deserialization
#[derive(Debug, Default, Deserialize)]
pub struct Config {
    pub package_name: String,
}

#[plugin_transform]
fn swc_plugin(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let config = serde_json::from_str::<Config>(
        &metadata.get_transform_plugin_config().unwrap_or_default()
    ).unwrap_or_default();
    
    let mut visitor = react_store_observer(config.package_name);
    program.fold_with(&mut visitor)
}
use std::path::PathBuf;
use swc_ecma_parser::{EsSyntax, Syntax};
use swc_ecma_transforms_testing::{test_fixture, FixtureTestConfig};
use react_store_observer::react_store_observer;

fn syntax() -> Syntax {
    Syntax::Es(EsSyntax {
        jsx: true,
        ..Default::default()
    })
}

#[testing::fixture("tests/fixture/**/input.js")]
fn fixture(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture(
        syntax(),
        &|_tr| {
            // Only use our transform, no resolver needed
            react_store_observer("@impact-react/signals".to_string())
        },
        &input,
        &output,
        FixtureTestConfig {
            ..Default::default()
        },
    );
}
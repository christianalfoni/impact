<script lang="ts">
import { defineComponent } from "vue";
import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight } from "@ddietr/codemirror-themes/github-light.js";
import { githubDark } from "@ddietr/codemirror-themes/github-dark.js";
import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter,
} from "@codemirror/view";
import { Extension, EditorState } from "@codemirror/state";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldKeymap,
} from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";

import { ref, onMounted, shallowRef, onUpdated, onBeforeUnmount } from "vue";
import { useData } from "vitepress";
import {
  ClientOptions,
  SandboxSetup,
  loadSandpackClient,
} from "@codesandbox/sandpack-client";

async function loadSandpack(iframe: HTMLIFrameElement, code: string) {
  // Files, environment and dependencies
  const files = {
    // We infer dependencies and the entry point from package.json
    "/package.json": {
      code: JSON.stringify({
        main: "index.tsx",
        dependencies: {
          react: "18.2.0",
          "react-dom": "18.2.0",
          "impact-react": "1.7.2",
        },
      }),
    },
    "/style.css": {
      code: `
body {
  margin: 0;
  font-family: sans-serif;
  text-align: center;
}

button {
    display: block;
    margin: 10px auto;
    border: 1px solid rgba(0, 0, 0, 0);
    color: rgb(255, 255, 255);
    background-color: rgb(0, 151, 199);
    border-radius: 20px;
    padding: 0 20px;
    line-height: 38px;
    font-size: 14px;
    min-width: 100px;
    cursor: pointer;
    transition: color 0.25s, border-color 0.25s, background-color 0.25s;

    &:hover {
      background: #0289b2;
    }
}

h4 {
  font-size: 22px;
}

`,
    },
    "/App.tsx": { code },
    "/index.tsx": {
      code: `import { createRoot } from 'react-dom/client';
import App from './App';
import "./style.css";

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(
  <div style={{
    width:'100vw',
    height:'100vh',
    display:'flex',
    justifyContent:'center',
    alignItems:'center'
  }}>
    <div>
      <App />
    </div>
  </div>
);
`,
    },
  };

  const content: SandboxSetup = {
    files,
    template: "create-react-app-typescript",
  };

  // Optional options
  const options: ClientOptions = {
    showOpenInCodeSandbox: false,
    bundlerURL: "https://sandpack-bundler.codesandbox.io",
  };

  // Properly load and mount the bundler
  const client = await loadSandpackClient(iframe, content, options);

  return function updateCode(updatedCode: string) {
    client.updateSandbox({
      files: {
        ...files,
        "/App.tsx": { code: updatedCode },
      },
    });
  };
}

export default defineComponent({
  components: {
    Codemirror,
  },

  setup() {
    const iframe = ref(null);
    const isDark = ref(document.documentElement.classList.contains("dark"));
    let observer = null;

    const setDark = () => {
      isDark.value = document.documentElement.classList.contains("dark");
    };

    const data = useData();
    const frontmatter = data.frontmatter.value;

    let updateCode: (updatedCode: string) => void = () => {};

    onMounted(() => {
      loadSandpack(iframe.value, frontmatter.code).then(
        (updateCodeCallback) => {
          updateCode = updateCodeCallback;
        },
      );
      observer = new MutationObserver(setDark);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    });

    onUpdated(() => {
      updateCode(data.frontmatter.value.code);
    });

    onBeforeUnmount(() => {
      observer.disconnect();
    });

    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap,
      ]),
      javascript({
        jsx: true,
        typescript: true,
      }),
    ];

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = (payload) => {
      view.value = payload.view;

      // Disable grammarly
      const el = document.getElementsByClassName("cm-content")[0];
      el.setAttribute("data-enable-grammarly", "false");
    };

    return {
      extensions,
      handleReady,
      handleChange: (updatedCode) => {
        updateCode(updatedCode);
      },
      log: console.log,
      iframe,
      isDark,
      githubDark,
      githubLight,
    };
  },
});
</script>
<template>
  <div
    :class="
      $frontmatter.horizontalPlayground ? 'playground horizontal' : 'playground'
    "
  >
    <div
      class="codemirror-wrapper"
      autocorrect="off"
      spellcheck="false"
      translate="no"
      data-gramm="false"
    >
      <div class="caption code-caption">
        <svg
          class="nx-mr-2 nx-text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          width="18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m8 17.95-6-6L8.05 5.9l1.075 1.075L4.15 11.95l4.925 4.925L8 17.95Zm7.95.05-1.075-1.075 4.975-4.975-4.925-4.925L16 5.95l6 6L15.95 18Z"
            fill="currentColor"
          ></path>
        </svg>
        <span>{{ $frontmatter.codeCaption }}</span>
      </div>
      <codemirror
        v-model="$frontmatter.code"
        :style="{ height: '100%', padding: '10px' }"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="[...extensions, isDark ? githubDark : githubLight]"
        @ready="handleReady"
        @change="handleChange"
      />
    </div>
    <div class="iframe">
      <div class="caption iframe-caption">
        <svg
          fill="currentColor"
          viewBox="0 0 48 48"
          width="18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 37.85v-28l22 14Zm3-14Zm0 8.55 13.45-8.55L19 15.3Z"
          ></path></svg
        ><span>Preview</span>
      </div>
      <iframe ref="iframe"></iframe>
    </div>
  </div>
</template>
<style scoped>
.playground {
  --height: 340px;
  --caption-height: 28px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 24px auto;
}

@media (min-width: 1280px) {
  .playground.horizontal {
    flex-direction: row;

    .codemirror-wrapper {
      flex: 0 50%;
      width: 50%;
      min-height: var(--height);
    }

    .iframe {
      flex: 0 50%;
      width: 50%;
      border-bottom-left-radius: 0px;
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;

      & iframe {
        position: sticky;
        top: calc(var(--vp-nav-height) + 10px);
      }
    }

    .code-caption {
      border-top-right-radius: 0px;
      border-right: 0;
    }
  }
}

.iframe {
  border: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  min-height: var(--height);
  background-color: white;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  & iframe {
    border: 0;
  }
}

.caption {
  display: flex;
  align-items: center;
  background: var(--vp-c-bg-soft);
  font-size: 13px;
  gap: 0.4em;
  padding: 0.1em 0.4em;
  border-bottom: 1px solid var(--vp-c-divider);
  height: var(--caption-height);
  box-sizing: content-box;
}

.code-caption {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}
</style>
<style>
.v-codemirror {
  display: block !important;
}

.cm-focused {
  outline: none !important;
}

@media (min-width: 1280px) {
  .playground.horizontal {
    .cm-editor {
      border-right: 0;
      border-bottom-width: 1px;
      border-bottom-left-radius: 8px;
    }
  }
}

.cm-editor {
  border: 1px solid var(--vp-c-divider);
  border-top: 0;
  border-bottom-width: 0px;
  background-color: var(--vp-c-bg-alt) !important;
  height: calc(100% - var(--caption-height));

  .cm-activeLineGutter,
  .cm-gutters {
    background: var(--vp-c-bg-alt) !important;
  }
  .cm-lineNumbers {
    color: var(--vp-c-border);
  }
}
</style>

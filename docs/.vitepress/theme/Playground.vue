<script lang="ts">
import { defineComponent } from "vue";
import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight } from "@ddietr/codemirror-themes/github-light";
import { githubDark } from "@ddietr/codemirror-themes/github-dark";

import { ref, onMounted, shallowRef, onUpdated } from "vue";
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
          "impact-react": "1.0.0",
        },
      }),
    },
    "/App.tsx": { code },
    "/index.tsx": {
      code: `import { createRoot } from 'react-dom/client';
import App from './App';

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(<App />);
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

    const data = useData();
    const frontmatter = data.frontmatter.value;

    let updateCode: (updatedCode: string) => void = () => {};

    onMounted(() => {
      loadSandpack(iframe.value, frontmatter.code).then(
        (updateCodeCallback) => {
          updateCode = updateCodeCallback;
        },
      );
    });

    onUpdated(() => {
      updateCode(data.frontmatter.value.code);
    });

    const extensions = [
      javascript({
        jsx: true,
        typescript: true,
      }),
      data.isDark.value ? githubDark : githubLight,
    ];

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = (payload) => {
      view.value = payload.view;
    };

    return {
      extensions,
      handleReady,
      handleChange: (updatedCode) => {
        console.log("HM", updatedCode);
        updateCode(updatedCode);
      },
      log: console.log,
      iframe,
    };
  },
});
</script>
<template>
  <div class="vertical">
    <div class="horizontal">
      <div class="content">
        <Content class="vp-doc" />
        <div class="links">
          <a
            v-if="$frontmatter.prev"
            class="link"
            :href="'/learn' + $frontmatter.prev"
            >Prev</a
          >
          <a v-if="!$frontmatter.prev" class="link disabled">Prev</a>
          <a
            v-if="$frontmatter.next"
            class="link"
            :href="'/learn' + $frontmatter.next"
            >Next</a
          >
          <a v-if="!$frontmatter.next" class="link disabled">Next</a>
        </div>
      </div>
      <div class="codemirror-wrapper">
        <codemirror
          v-model="$frontmatter.code"
          :style="{ height: '100%', padding: '5px' }"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="extensions"
          @ready="handleReady"
          @change="handleChange"
        />
      </div>
    </div>
    <iframe class="iframe" ref="iframe"></iframe>
  </div>
</template>
<style scoped>
.horizontal {
  display: flex;
}

.vertical {
  display: flex;
  flex-direction: column;
}

.content {
  padding: 16px;
  min-width: 300px;
}

.iframe {
  border: 1px solid #333;
  display: block;
  width: 100%;
  min-height: 400px;
}

.link {
  background-color: var(--vp-button-brand-bg);
  padding: 2px 10px;
  border-radius: 6px;
  color: var(--vp-button-brand-text);
  font-size: 13px;
}
.links {
  display: flex;
  justify-content: space-between;
}

.disabled {
  opacity: 0.3;
}
</style>
<style>
.cm-focused {
  outline: none !important;
}
</style>

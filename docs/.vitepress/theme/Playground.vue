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
          "impact-react": "1.1.0",
        },
      }),
    },
    "/App.tsx": { code },
    "/index.tsx": {
      code: `import { createRoot } from 'react-dom/client';
import App from './App';

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
    <App />
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
        updateCode(updatedCode);
      },
      log: console.log,
      iframe,
    };
  },
});
</script>
<template>
  <hr />
  <div class="vertical">
    <div class="horizontal">
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
      <iframe class="iframe" ref="iframe"></iframe>
    </div>
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

.codemirror-wrapper {
  flex: 0 75%;
  width: 75%;
}
.iframe {
  border: 0;
  border-left: 1px solid var(--vp-c-divider);
  flex: 0 25%;
  width: 25%;
  display: block;
  min-height: 400px;
}
</style>
<style>
.cm-focused {
  outline: none !important;
}
</style>

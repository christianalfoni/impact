<script lang="ts">
import { defineComponent } from "vue";
import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";

import { ref, onMounted, shallowRef } from "vue";
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
        dependencies: { react: "latest", "react-dom": "latest" },
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

    const code = ref(frontmatter.code);
    const extensions = [
      javascript({
        jsx: true,
        typescript: true,
      }),
    ];

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = (payload) => {
      view.value = payload.view;
    };

    return {
      code,
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
  <div class="vertical">
    <div class="horizontal">
      <div class="content">
        <Content />
      </div>
      <codemirror
        v-model="code"
        placeholder="Code goes here..."
        :style="{ height: '400px' }"
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
  padding: 10px;
  min-width: 300px;
}

.iframe {
  border: 1px solid #333;
  display: block;
  width: 100%;
  min-height: 400px;
}
</style>

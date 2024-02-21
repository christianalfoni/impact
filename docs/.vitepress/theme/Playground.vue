<script lang="ts">
import { defineComponent } from "vue";
import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight } from "@ddietr/codemirror-themes/github-light";
import { githubDark } from "@ddietr/codemirror-themes/github-dark";

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
  <hr />
  <div class="playground">
    <div
      class="codemirror-wrapper"
      autocorrect="off"
      spellcheck="false"
      translate="no"
      data-gramm="false"
    >
      <codemirror
        v-model="$frontmatter.code"
        :style="{ height: '100%', padding: '10px' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="[...extensions, isDark ? githubDark : githubLight]"
        @ready="handleReady"
        @change="handleChange"
      />
    </div>
    <div class="iframe">
      <div class="iframe-caption">
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
  --height: 360px;
  display: flex;
  flex-direction: column;
}

@media (min-width: 1280px) {
  .playground {
    flex-direction: row;
  }
}

@media (min-width: 1280px) {
  .codemirror-wrapper {
    flex: 0 50%;
    width: 50%;
  }
}

.iframe {
  border: 1px solid var(--vp-c-divider);
  display: block;
  min-height: var(--height);
  background-color: white;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  @media (min-width: 1280px) {
    flex: 0 50%;
    width: 50%;
    border-bottom-left-radius: 0px;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  & iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
}

.iframe-caption {
  display: flex;
  align-items: center;
  background: var(--vp-c-bg-soft);
  font-size: 13px;
  gap: 0.4em;
  padding: 0.1em 0.2em;
  border-bottom: 1px solid var(--vp-c-divider);
}
</style>
<style>
.cm-focused {
  outline: none !important;
}
.cm-editor {
  border: 1px solid var(--vp-c-divider);
  border-bottom-width: 0px;
  background-color: var(--vp-c-bg-alt) !important;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;

  @media (min-width: 1280px) {
    border-right: 0;
    border-bottom-width: 1px;

    border-top-right-radius: 0px;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }
}
</style>

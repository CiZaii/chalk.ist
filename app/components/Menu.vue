<script setup lang="ts">
import { onKeyStroke, useMagicKeys, whenever } from "@vueuse/core";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  RadioGroupRoot,
  RadioGroupItem,
  MenubarRoot,
  MenubarTrigger,
} from "radix-vue";
import { ref } from "vue";
import { addEditorBlock, addMarkdownBlock, getCodeBlocks } from "~/lib/block";
import { BlockType } from "~/lib/enums";
import { copyPngToClipboard, downloadPNG } from "~/lib/export";
import { state } from "~/lib/state";
import { persistentState } from "~/lib/persistent-state";

const currentMenu = ref("");
const keys = useMagicKeys();
// const isFirefox = computed(() => {
//   return navigator.userAgent.toLowerCase().includes("firefox");
// });

onKeyStroke(".", (e) => {
  if (e.metaKey) {
    e.preventDefault();
    persistentState.value.showUI = !persistentState.value.showUI;
  }
});

whenever(() => keys.ctrl_e.value && !keys.current.has("shift"), addEditorBlock);
whenever(keys.ctrl_shift_e, addMarkdownBlock);

function clearLineDecorations() {
  persistentState.value.blocks.forEach((item) => {
    if (item.type !== BlockType.Code) {
      return;
    }

    item.transformations = [];
  });
}

// 添加生成分享链接的函数
const generateShareLink = async () => {
  try {
    const shareData = {
      blocks: persistentState.value.blocks,
    };
    
    // 只进行一次编码
    const baseUrl = window.location.origin + window.location.pathname;
    const longUrl = `${baseUrl}?data=${encodeURIComponent(JSON.stringify(shareData))}`;
    
    // 使用本地代理接口
    const response = await fetch('/api/shortlink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: longUrl,
        customSlug: ''
      })
    });
    
    const data = await response.json();
    
    await navigator.clipboard.writeText(data.link);
    alert('短链接已复制到剪贴板！');
  } catch (error) {
    console.error('生成分享链接失败:', error);
    alert('生成分享链接失败，请重试');
  }
};

// 在组件挂载时检查 URL 参数并恢复状态
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedData = urlParams.get('data');
  
  if (sharedData) {
    try {
      // 只进行一次解码
      const decodedData = JSON.parse(decodeURIComponent(sharedData));
      if (decodedData.blocks) {
        persistentState.value.blocks = decodedData.blocks;
      }
    } catch (error) {
      console.error('恢复分享数据失败:', error);
    }
  }
});
</script>
©
<template>
  <div class="relative">
    <MenubarRoot
      v-model="currentMenu"
      class="flex items-center overflow-auto border-b border-b-zinc-800 bg-zinc-900 pwa:sm:border-t pwa:sm:border-t-black pwa:sm:shadow-[inset_0_1px_0_rgb(39_39_42)]"
    >
      <MenubarMenu value="help" v-if="state.editMode === 'code'">
        <MenubarTrigger class="menubar-trigger">
          Chalk
          <i-radix-icons:chevron-down class="ml-1 size-3" />
        </MenubarTrigger>

        <MenubarPortal>
          <MenubarContent
            class="menubar-content"
            :side-offset="8"
            :align-offset="8"
          >
            <MenubarItem
              as="a"
              class="menubar-item group"
              href="https://x.com/Idered"
            >
              <i-fa6-brands:x-twitter class="mr-2 size-4" />
              Follow on X
            </MenubarItem>
            <MenubarItem
              as="a"
              class="menubar-item group"
              href="https://github.com/Idered/chalk.ist"
            >
              <i-fa6-brands:github class="mr-2 size-4" />
              View source on GitHub
            </MenubarItem>
            <MenubarItem
              as="a"
              class="menubar-item group"
              href="https://www.buymeacoffee.com/idered"
            >
              <i-ph:coffee class="mr-2 size-4" />
              Buy me a coffee
            </MenubarItem>
            <!-- <MenubarSeparator class="h-[1px] bg-green6 m-[5px]" /> -->
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>

      <MenubarMenu value="blocks" v-if="state.editMode === 'code'">
        <MenubarTrigger class="menubar-trigger hidden sm:flex">
          <span>Blocks</span>
          <i-radix-icons:chevron-down class="ml-1 size-3" />
        </MenubarTrigger>
        <MenubarPortal>
          <MenubarContent class="menubar-content" :side-offset="8">
            <MenubarItem class="menubar-item group" @click="addEditorBlock">
              Add Code Block
              <div class="menubar-item-shortcut">⌃ E</div>
            </MenubarItem>
            <MenubarItem class="menubar-item group" @click="addMarkdownBlock">
              Add Markdown Block
              <div class="menubar-item-shortcut">⇧ ⌃ E</div>
            </MenubarItem>
            <!-- <MenubarSeparator class="h-[1px] bg-green6 m-[5px]" /> -->
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>

      <MenubarMenu value="line decorations" v-if="state.editMode === 'code'">
        <MenubarTrigger class="menubar-trigger">
          <span class="hidden sm:block">Line decorations</span>
          <span class="sm:hidden">Decorations</span>
          <i-radix-icons:chevron-down class="ml-1 size-3" />
        </MenubarTrigger>

        <MenubarPortal>
          <MenubarContent class="menubar-content" :side-offset="8">
            <MenubarItem
              class="menubar-item group"
              @click="state.editMode = 'highlight'"
            >
              Highlight
              <!-- <div class="menubar-item-shortcut">⌘ E</div> -->
            </MenubarItem>
            <MenubarItem
              class="menubar-item group"
              @click="state.editMode = 'focus'"
            >
              Focus
              <!-- <div class="menubar-item-shortcut">⇧ ⌘ E</div> -->
            </MenubarItem>
            <MenubarItem
              class="menubar-item group"
              @click="state.editMode = 'add'"
            >
              Diff: Add
              <!-- <div class="menubar-item-shortcut">⇧ ⌘ E</div> -->
            </MenubarItem>
            <MenubarItem
              class="menubar-item group"
              @click="state.editMode = 'remove'"
            >
              Diff: Remove
              <!-- <div class="menubar-item-shortcut">⇧ ⌘ E</div> -->
            </MenubarItem>
            <MenubarItem
              class="menubar-item group"
              @click="clearLineDecorations"
              :disabled="
                getCodeBlocks().every(
                  (item) => item.transformations.length === 0,
                )
              "
            >
              Clear all line decorations
            </MenubarItem>
            <!-- <MenubarSeparator class="h-[1px] bg-green6 m-[5px]" /> -->
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>

      <MenubarMenu value="export" v-if="state.editMode === 'code'">
        <MenubarTrigger class="menubar-trigger text-white">
          <div
            v-if="persistentState.lastCopyMethod === 'copy_png'"
            :tabindex="0"
            @pointerdown.stop.prevent="copyPngToClipboard"
            class="-ml-1 mr-2 flex size-8 items-center justify-center rounded hover:bg-slate-700"
          >
            <i-radix-icons:clipboard class="size-4" />
          </div>
          <div
            v-if="persistentState.lastCopyMethod === 'download_png'"
            :tabindex="0"
            @pointerdown.stop.prevent="downloadPNG"
            class="-ml-1 mr-2 flex size-8 items-center justify-center rounded hover:bg-slate-700"
          >
            <i-radix-icons:download class="size-4" />
          </div>
          <span>Export</span>
          <i-radix-icons:chevron-down class="ml-1 size-3" />
        </MenubarTrigger>

        <MenubarPortal>
          <MenubarContent class="menubar-content" :side-offset="8">
            <MenubarItem class="menubar-item" @click="copyPngToClipboard">
              <i-radix-icons:clipboard class="mr-2 size-4" />
              <span>Copy Image</span>
            </MenubarItem>
            <MenubarItem class="menubar-item" @click="generateShareLink">
              <i-radix-icons:share-2 class="mr-2 size-4" />
              <span>复制分享链接</span>
            </MenubarItem>
            <MenubarItem class="menubar-item" @click="downloadPNG">
              <i-radix-icons:download class="mr-2 size-4" />
              <span>Download PNG</span>
            </MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>

      <RadioGroupRoot
        class="flex"
        v-model="state.editMode"
        v-if="state.editMode !== 'code'"
      >
        <RadioGroupItem value="highlight" class="menubar-item-radio">
          Highlight
        </RadioGroupItem>
        <RadioGroupItem value="focus" class="menubar-item-radio">
          Focus
        </RadioGroupItem>
        <RadioGroupItem value="add" class="menubar-item-radio">
          Diff: Add
        </RadioGroupItem>
        <RadioGroupItem value="remove" class="menubar-item-radio">
          Diff: Remove
        </RadioGroupItem>
      </RadioGroupRoot>

      <button
        v-if="state.editMode !== 'code'"
        class="menubar-trigger group cursor-pointer"
        @click="clearLineDecorations"
        :disabled="
          getCodeBlocks().every((item) => item.transformations.length === 0)
        "
      >
        Clear
      </button>

      <Button
        v-if="state.editMode !== 'code'"
        @click="state.editMode = 'code'"
        class="ml-4 h-8 bg-blue-700 px-4 text-white"
      >
        Done
      </Button>
    </MenubarRoot>
    <SidebarSeparator class="mx-0 mt-[-2px]" />
  </div>
</template>

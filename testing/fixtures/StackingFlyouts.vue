<script setup lang="ts">
  import { onScopeDispose } from 'vue'
  import {
    createUiEntryControl,
    createUiModalControl,
    createUiPopoverControl,
    UiApp,
    UiButton,
    UiDrawer,
    UiLayout,
    UiModal,
    UiNavMenu,
    UiPopover,
    useUiStacking,
  } from '@uninterface/uninterface'

  defineProps<{ surface: 'popover' | 'modal' | 'drawer' }>()
  const stacking = useUiStacking()
  window.inspectElementFlyout = (element) => {
    const handle = stacking.fromElement(element)
    const info = handle && stacking.describe(handle)
    return { exact: info?.target === element, rank: info?.logical?.value }
  }
  const popover = createUiPopoverControl()
  const modal = createUiModalControl()
  const navigation = createUiEntryControl([
    {
      kind: 'submenu',
      key: 'root',
      label: 'Destinations',
      children: [
        { key: 'first', label: 'First destination', href: '#first' },
        {
          kind: 'submenu',
          key: 'nested',
          label: 'More destinations',
          children: [{ key: 'last', label: 'Last destination', href: '#last' }],
        },
      ],
    },
  ])
  onScopeDispose(navigation.dispose)
</script>

<template>
  <UiApp>
    <main style="padding: 32px">
      <template v-if="surface === 'modal'">
        <UiButton @click="modal.run()">Open panel</UiButton>
        <UiModal
          :control="modal"
          title="Test panel"
        >
          <UiLayout>
            <UiNavMenu
              :control="navigation"
              presentation="horizontal"
              aria-label="Test navigation"
            />
            <div style="height: 150px">Content behind the popup</div>
          </UiLayout>
        </UiModal>
      </template>
      <UiDrawer
        v-else-if="surface === 'drawer'"
        mode="panel"
        expanded
        title="Test panel"
      >
        <UiLayout>
          <UiNavMenu
            :control="navigation"
            presentation="horizontal"
            aria-label="Test navigation"
          />
          <div style="height: 150px">Content behind the popup</div>
        </UiLayout>
      </UiDrawer>
      <UiPopover
        v-else
        :control="popover"
        title="Test panel"
      >
        <template #host="{ buttonTrigger }">
          <UiButton
            v-bind="buttonTrigger"
            @click="popover.run()"
          >
            Open panel
          </UiButton>
        </template>
        <UiLayout>
          <UiNavMenu
            :control="navigation"
            presentation="horizontal"
            aria-label="Test navigation"
          />
          <div style="height: 150px">Content behind the popup</div>
        </UiLayout>
      </UiPopover>
    </main>
  </UiApp>
</template>

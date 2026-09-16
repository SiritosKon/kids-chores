<template>
  <q-item v-ripple tag="label" :disable="disabled" class="q-py-md">
    <q-item-section avatar>
      <div class="task-tile">
        <q-icon :name="task.icon" size="20px" color="white" />
      </div>
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ task.name }}</q-item-label>
      <q-item-label caption>{{ task.points }} б.</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-checkbox
        :model-value="checked"
        :disable="disabled"
        @update:model-value="$emit('update:checked', $event)"
      />
    </q-item-section>
  </q-item>
</template>

<script setup>
defineProps({
  task: { type: Object, required: true },
  checked: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
defineEmits(['update:checked']);
</script>

<style scoped>
.task-tile {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--q-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

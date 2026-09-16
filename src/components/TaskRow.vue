<template>
  <q-item v-ripple tag="label" :disable="disabled">
    <q-item-section avatar>
      <q-icon :name="task.icon" size="28px" color="primary" />
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

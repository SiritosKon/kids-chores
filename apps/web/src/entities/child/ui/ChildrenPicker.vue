<template>
  <div>
    <div class="text-caption text-grey-5">{{ label ?? t('childEntity.forWhom') }}</div>
    <q-checkbox
      :model-value="allState"
      :label="t('childEntity.allChildren')"
      color="primary"
      @update:model-value="emit('update:modelValue', allState === true ? [] : null)"
    />
    <div class="children-picker__list">
      <q-checkbox
        v-for="child in childrenStore.active"
        :key="child.id"
        :model-value="isChosen(child.id)"
        :label="child.name"
        color="primary"
        @update:model-value="toggle(child.id, $event)"
      />
    </div>
    <div v-if="modelValue !== null && modelValue.length === 0" class="text-negative text-caption">
      {{ t('childEntity.pickOne') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChildrenStore } from '../model/store';

const props = withDefaults(defineProps<{ modelValue: readonly string[] | null; label?: string }>(), {
  label: undefined,
});
const emit = defineEmits<{ 'update:modelValue': [childIds: string[] | null] }>();

const { t } = useI18n();
const childrenStore = useChildrenStore();

const allState = computed<boolean | null>(() => {
  const chosen = props.modelValue;
  if (chosen === null || childrenStore.active.every((child) => chosen.includes(child.id))) {
    return true;
  }
  return chosen.length > 0 ? null : false;
});

const isChosen = (childId: string): boolean => props.modelValue === null || props.modelValue.includes(childId);

const toggle = (childId: string, checked: boolean): void => {
  const everyone = childrenStore.active.map((child) => child.id);
  const current = props.modelValue ?? everyone;
  const next = checked ? [...new Set([...current, childId])] : current.filter((id) => id !== childId);
  emit('update:modelValue', everyone.every((id) => next.includes(id)) ? null : next);
};
</script>

<style scoped>
.children-picker__list {
  display: flex;
  flex-direction: column;
  padding-left: 24px;
}
</style>

<template>
  <div>
    <vue-json-pretty class="json-container" :deep-collapse-children="true" :deep="3" :path="'res'" :data="data">
    </vue-json-pretty>
  </div>
</template>

<script setup>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

defineProps({
  data: {
    type: Object,
    default: () => null,
  },
});
</script>
<style>
.json-container {
  flex: 1;
  height: 100vh;
  width: calc(100vw - 500px);
  overflow: auto;
  border-left: 1px solid #ccc;
  padding: 20px;
}
</style>

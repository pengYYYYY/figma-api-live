<template>
  <div class="outerBox">
    <div class="requestForm">
      <t-tabs v-model="type">
        <t-tab-panel :value="1" label="Auth" />
        <t-tab-panel :value="2" label="AccessToken" />
      </t-tabs>
      <t-form
        ref="form"
        class="panelInner"
        :data="formData"
        :rules="rules"
        label-width="90px"
        :colon="true"
        @submit="onSubmit"
      >
        <t-form-item label="Token" name="token">
          <t-input v-if="type === 2" v-model="formData.token" placeholder="请输入"></t-input>
          <div v-else>
            <div v-if="authToken" class="auth-token-container">{{ authToken }}</div>
            <t-button v-else theme="primary" type="button" @click="handleClickGetFigmaAuth">figma授权</t-button>
          </div>
        </t-form-item>
        <t-form-item label="文件链接" name="fileUrl">
          <t-input v-model="formData.fileUrl" placeholder="请输入"></t-input>
        </t-form-item>
        <t-form-item label="数据层级" name="depth">
          <t-input-number v-model="formData.depth" placeholder="请输入"></t-input-number>
        </t-form-item>
        <t-row :gutter="16">
          <t-col :span="6">
            <t-form-item label="path数据" name="havePath">
              <t-switch v-model="formData.havePath" size="large" :label="['开', '关']"></t-switch>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="获取节点" name="isNodes">
              <t-switch v-model="formData.isNodes" size="large" :label="['开', '关']"></t-switch>
            </t-form-item>
          </t-col>
        </t-row>
        <t-form-item v-if="formData.isNodes" label="节点过滤" name="ids">
          <t-input v-model="formData.ids" placeholder="如0:3,0:1"></t-input>
        </t-form-item>
        <t-form-item style="padding-top: 8px">
          <t-button theme="primary" type="submit">获取数据</t-button>
          <t-button
            v-if="type === 1"
            theme="warning"
            variant="outline"
            type="button"
            @click="handleClickGetFigmaAuth('reAuth')"
            >重新授权</t-button
          >
          <t-button
            v-if="type === 2"
            theme="warning"
            variant="outline"
            type="button"
            @click="handleClickGetFigmaPersonalToken"
            >如何获取</t-button
          >
        </t-form-item>
        <iframe
          v-if="formData?.fileUrl && data?.thumbnailUrl"
          style="border: 1px solid rgba(0, 0, 0, 0.1)"
          width="460"
          height="450"
          :src="`https://www.figma.com/embed?embed_host=share&url=${formData.fileUrl} `"
          allowfullscreen
        />
      </t-form>
    </div>
    <t-loading size="small" :loading="loading" show-overlay>
      <vue-json-pretty class="jsonDiv" :deep-collapse-children="true" :deep="3" :data="data" />
    </t-loading>
  </div>
</template>
<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty';
import { ref, onMounted, computed } from 'vue';
import 'vue-json-pretty/lib/styles.css';

const getUrlQuery = (params) => {
  return Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
};

const redirectUri =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001/#/figma'
    : 'https://pengyyyyy.github.io/figma-api-live-preview/#/figma';

const data = ref();
const loading = ref(false);
const authToken = ref(localStorage.getItem('figmaAuthToken'));

onMounted(async () => {
  const query = window.location.search.substring(1).split('&');

  const params = Object.create(null);
  for (let i = 0; i < query.length; i++) {
    const pos = query[i].split('=');
    if (pos[0]) {
      params[pos[0]] = pos[1] ? pos[1] : '';
    }
  }
  if (params.code && !authToken.value) {
    const { state, code } = params;
    const storageState = localStorage.getItem('figmaAuthState');
    if (storageState !== state) return;
    const res = await fetch(
      `https://service-kyuf6ars-1257200260.gz.apigw.tencentcs.com/release/figma/auth?${getUrlQuery({
        code,
        redirectUri,
      })}`,
    );
    const result = await res.json();
    authToken.value = result.data.access_token;
    localStorage.setItem('figmaAuthToken', authToken.value);
  }
});

const type = ref(1);
const rules = computed(() => ({
  token: [
    {
      required: type.value !== 1,
      message: '请输入AccessToken',
    },
  ],
  fileUrl: [
    {
      required: true,
      message: '请输入fileUrl',
    },
  ],
  ids: [
    {
      required: true,
      message: '请输入',
    },
  ],
}));
const formData = ref({
  token: '',
  fileUrl: '',
  depth: 0,
  havePath: false,
  isNodes: false,
  ids: '',
});

const onSubmit = async ({ validateResult }) => {
  if (validateResult !== true) return;
  loading.value = true;
  const res = await fetch(
    `https://service-kyuf6ars-1257200260.gz.apigw.tencentcs.com/release/figma/file?${getUrlQuery({
      ...formData.value,
      authToken: authToken.value,
      type: type.value === 1 ? 'authToken' : 'personalToken',
    })}`,
  );
  const result = await res.json();
  loading.value = false;
  data.value = result.data;
};

const handleClickGetFigmaAuth = (type = '') => {
  if (type === 'reAuth') {
    localStorage.removeItem('figmaAuthToken');
    authToken.value = '';
  }
  const uuid = `${Date.now()}`;
  localStorage.setItem('figmaAuthState', uuid);

  window.location.href = `https://www.figma.com/oauth?client_id=Hn8ZQBrB9AOZaGqPTRZ1w9&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=file_read&state=${uuid}&response_type=code`;
};

const handleClickGetFigmaPersonalToken = () => {
  window.open('https://www.figma.com/developers/api#access-tokens');
};
</script>
<style lang="less">
.outerBox {
  display: flex;
  position: relative;
}
.requestForm {
  width: 500px;
  height: 100vh;
  overflow: auto;
}
.panelInner {
  padding: 20px;
}
.jsonDiv {
  flex: 1;
  height: 100vh;
  width: calc(100vw - 500px);
  overflow: auto;
  border-left: 1px solid #ccc;
  padding: 20px;
}
.auth-token-container {
  width: 350px;
  word-wrap: break-word;
}
.t-form__label {
  padding-right: 12px;
}
</style>

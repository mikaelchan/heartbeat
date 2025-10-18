<template>
  <section class="glass-panel auth-panel">
    <h2 class="section-title">加入 Heartbeat</h2>
    <p class="sub">请与你的另一半一起创建专属心动空间</p>
    <form class="auth-form" @submit.prevent="handleSubmit">
      <label>
        用户名
        <input v-model="username" type="text" required autocomplete="username" />
      </label>
      <label>
        密码
        <input v-model="password" type="password" required autocomplete="new-password" />
      </label>
      <div class="field-group">
        <span class="field-label">注册方式</span>
        <div class="segmented-control" role="radiogroup">
          <button
            type="button"
            role="radio"
            :aria-checked="pairingMode === 'create'"
            :class="{ active: pairingMode === 'create' }"
            @click="pairingMode = 'create'"
          >
            我来开启
          </button>
          <button
            type="button"
            role="radio"
            :aria-checked="pairingMode === 'join'"
            :class="{ active: pairingMode === 'join' }"
            @click="pairingMode = 'join'"
          >
            我来加入
          </button>
        </div>
        <p class="hint" v-if="pairingMode === 'create'">
          系统会为你生成 6 位配对码，发送给另一半注册。
        </p>
        <p class="hint" v-else>
          使用 TA 分享的 6 位配对码完成注册。
        </p>
      </div>
      <label v-if="pairingMode === 'join'">
        配对码
        <input
          v-model="pairCode"
          type="text"
          inputmode="numeric"
          pattern="[0-9]{6}"
          maxlength="6"
          placeholder="请输入 6 位数字"
          required
        />
      </label>
      <label v-else>
        关系确认时间
        <input v-model="relationshipConfirmedAt" type="datetime-local" />
      </label>
      <div class="field-group">
        <span class="field-label">性别</span>
        <div class="segmented-control" role="radiogroup">
          <button
            v-for="option in genderOptions"
            :key="option.value"
            type="button"
            role="radio"
            :aria-checked="gender === option.value"
            :class="{ active: gender === option.value }"
            @click="gender = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      <button type="submit" :disabled="auth.loading">{{ auth.loading ? '注册中...' : '注册' }}</button>
      <p v-if="validationError" class="error">{{ validationError }}</p>
      <p v-else-if="auth.error" class="error">{{ auth.error }}</p>
    </form>
    <p class="switch">
      已经有账号了？
      <RouterLink to="/login">立即登录</RouterLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useHeartbeatStore } from '@/stores/heartbeat';
import type { PairingMode, RegisterPayload, UserGender } from '@/types/auth';

const auth = useAuthStore();
const heartbeat = useHeartbeatStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const pairingMode = ref<PairingMode>('create');
const pairCode = ref('');
const relationshipConfirmedAt = ref(formatDateForInput(new Date()));
const gender = ref<UserGender>('other');
const validationError = ref('');

const genderOptions: Array<{ value: UserGender; label: string }> = [
  { value: 'female', label: '女生' },
  { value: 'other', label: '保密' },
  { value: 'male', label: '男生' }
];

function formatDateForInput(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

const handleSubmit = async () => {
  validationError.value = '';
  if (!username.value || !password.value) return;

  if (pairingMode.value === 'join') {
    const trimmed = pairCode.value.trim();
    if (!/^[0-9]{6}$/.test(trimmed)) {
      validationError.value = '请输入 6 位数字的配对码。';
      return;
    }
  }

  const payload: RegisterPayload = {
    username: username.value,
    password: password.value,
    gender: gender.value,
    pairingMode: pairingMode.value
  };

  if (pairingMode.value === 'create') {
    payload.relationshipConfirmedAt = relationshipConfirmedAt.value;
  } else {
    payload.pairCode = pairCode.value.trim();
  }

  try {
    await auth.register(payload);
    await heartbeat.fetchAll();
    router.replace('/');
  } catch (error) {
    console.error(error);
  }
};
</script>

<style scoped>
.auth-panel {
  max-width: 520px;
  margin: 4rem auto;
  text-align: center;
  backdrop-filter: blur(28px) saturate(150%);
}

.sub {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  margin-top: 2.4rem;
}

.auth-form label {
  text-align: left;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--text-primary);
}

.auth-form input {
  border-radius: 16px;
  border: 1px solid var(--input-border);
  padding: 0.85rem 1.1rem;
  background: var(--input-background);
  color: inherit;
  box-shadow: var(--input-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.auth-form input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.field-group {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: var(--text-primary);
}

.field-label {
  font-weight: 600;
}

.segmented-control {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  background: var(--nav-bg);
  border-radius: 999px;
  padding: 0.35rem;
  position: relative;
  gap: 0.35rem;
}

.segmented-control::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px var(--nav-border);
  pointer-events: none;
}

.segmented-control button {
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1rem;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: var(--text-secondary);
  transition: color 0.2s ease, transform 0.2s ease;
  position: relative;
  z-index: 1;
}

.segmented-control button.active {
  color: var(--nav-active-text);
}

.segmented-control button.active::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--nav-active-bg);
  box-shadow: var(--nav-active-shadow);
  z-index: -1;
}

.segmented-control button:active {
  transform: scale(0.97);
}

.hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.auth-form button[type='submit'] {
  border-radius: 999px;
  border: none;
  padding: 0.85rem 1.1rem;
  font-weight: 700;
  cursor: pointer;
  background: var(--primary-button-bg);
  color: var(--primary-button-text);
  box-shadow: var(--primary-button-shadow);
  transition: transform 0.2s ease;
}

.auth-form button[type='submit']:hover:not(:disabled) {
  transform: translateY(-1px);
  background: var(--primary-button-bg-hover);
}

.error {
  color: var(--form-error);
  margin: 0;
}

.switch {
  margin-top: 1.75rem;
  color: var(--text-secondary);
}

.switch a {
  color: var(--link);
  font-weight: 600;
}
</style>

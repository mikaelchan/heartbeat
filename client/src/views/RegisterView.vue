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
        <div class="mode-toggle" role="radiogroup">
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
        <div class="gender-slider">
          <input
            id="gender-slider"
            v-model.number="genderSliderValue"
            type="range"
            min="0"
            max="2"
            step="1"
            aria-labelledby="gender-slider"
          />
          <div class="slider-labels">
            <span v-for="(option, index) in genderOptions" :key="option.value" :class="{ active: genderSliderValue === index }">
              {{ option.label }}
            </span>
          </div>
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
import { computed, ref } from 'vue';
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

const genderSliderValue = computed({
  get: () => genderOptions.findIndex((option) => option.value === gender.value),
  set: (value: number) => {
    const option = genderOptions[value];
    gender.value = option ? option.value : 'other';
  }
});

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
  color: #0f172a;
}

.auth-form input {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 0.85rem 1.1rem;
  background: rgba(255, 255, 255, 0.95);
  color: inherit;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
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
  color: #0f172a;
}

.field-label {
  font-weight: 600;
}

.mode-toggle {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  background: rgba(15, 23, 42, 0.06);
  border-radius: 999px;
  padding: 0.35rem;
  position: relative;
  gap: 0.35rem;
}

.mode-toggle::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.05);
  pointer-events: none;
}

.mode-toggle button {
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

.mode-toggle button.active {
  color: #0f172a;
}

.mode-toggle button.active::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.18);
  z-index: -1;
}

.mode-toggle button:active {
  transform: scale(0.97);
}

.hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.gender-slider {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.gender-slider input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
}

.gender-slider input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid rgba(15, 23, 42, 0.12);
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.15);
}

.gender-slider input[type='range']::-moz-range-thumb {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid rgba(15, 23, 42, 0.12);
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.15);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.slider-labels span {
  flex: 1;
  text-align: center;
  opacity: 0.55;
  font-weight: 600;
  color: var(--text-secondary);
}

.slider-labels span.active {
  opacity: 1;
  color: #0f172a;
}

.auth-form button[type='submit'] {
  border-radius: 999px;
  border: none;
  padding: 0.85rem 1.1rem;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #007aff 0%, #5f5cff 100%);
  color: #ffffff;
  box-shadow: 0 20px 36px rgba(0, 122, 255, 0.22);
  transition: transform 0.2s ease;
}

.auth-form button[type='submit']:hover:not(:disabled) {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #0066d6 0%, #4f46e5 100%);
}

.error {
  color: #ff5d5d;
  margin: 0;
}

.switch {
  margin-top: 1.75rem;
  color: var(--text-secondary);
}

.switch a {
  color: #007aff;
  font-weight: 600;
}
</style>

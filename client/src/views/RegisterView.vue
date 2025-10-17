<template>
  <section class="glass-panel auth-panel">
    <h2 class="section-title">加入 Heartbeat</h2>
    <p class="sub">注册后即可定制属于你的专属爱情档案</p>
    <form class="auth-form" @submit.prevent="handleSubmit">
      <label>
        用户名
        <input v-model="username" type="text" required autocomplete="username" />
      </label>
      <label>
        密码
        <input v-model="password" type="password" required autocomplete="new-password" />
      </label>
      <label>
        性别
        <select v-model="gender">
          <option value="male">男生</option>
          <option value="female">女生</option>
          <option value="other">保密</option>
        </select>
      </label>
      <button type="submit" :disabled="auth.loading">{{ auth.loading ? '注册中...' : '注册' }}</button>
      <p v-if="auth.error" class="error">{{ auth.error }}</p>
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
import type { UserGender } from '@/types/auth';

const auth = useAuthStore();
const heartbeat = useHeartbeatStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const gender = ref<UserGender>('other');

const handleSubmit = async () => {
  if (!username.value || !password.value) return;
  try {
    await auth.register(username.value, password.value, gender.value);
    await heartbeat.fetchAll();
    router.replace('/');
  } catch (error) {
    console.error(error);
  }
};
</script>

<style scoped>
.auth-panel {
  max-width: 420px;
  margin: 4rem auto;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.auth-form label {
  text-align: left;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-form input,
.auth-form select {
  border-radius: 12px;
  border: none;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.12);
  color: inherit;
}

.error {
  color: #ff8b8b;
  margin: 0;
}

.switch {
  margin-top: 1.5rem;
}
</style>

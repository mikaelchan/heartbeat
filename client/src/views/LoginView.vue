<template>
  <section class="glass-panel auth-panel">
    <h2 class="section-title">欢迎回来</h2>
    <p class="sub">登录后即可查看属于你们的小宇宙</p>
    <form class="auth-form" @submit.prevent="handleSubmit">
      <label>
        用户名
        <input v-model="username" type="text" required autocomplete="username" />
      </label>
      <label>
        密码
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>
      <button type="submit" :disabled="auth.loading">{{ auth.loading ? '登录中...' : '登录' }}</button>
      <p v-if="auth.error" class="error">{{ auth.error }}</p>
    </form>
    <p class="switch">
      还没有账户？
      <RouterLink to="/register">立即注册</RouterLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useHeartbeatStore } from '@/stores/heartbeat';

const auth = useAuthStore();
const heartbeat = useHeartbeatStore();
const router = useRouter();
const route = useRoute();

const username = ref('');
const password = ref('');

const handleSubmit = async () => {
  if (!username.value || !password.value) return;
  try {
    await auth.login(username.value, password.value);
    await heartbeat.fetchAll();
    const redirect = (route.query.redirect as string) || '/';
    router.replace(redirect);
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

.auth-form input {
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

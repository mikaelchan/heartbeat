<template>
  <section class="glass-panel">
    <h3 class="section-title">我们的心动留言</h3>
    <form class="message-form" @submit.prevent="handleSubmit">
      <label>
        我是谁？
        <select v-model="author">
          <option value="me">{{ selfLabel }}</option>
          <option value="partner">{{ partnerLabel }}</option>
        </select>
      </label>
      <label class="full">
        想说点什么？
        <textarea v-model="content" rows="3" placeholder="写下此刻的心情..."></textarea>
      </label>
      <button type="submit" :disabled="!content.trim()">发送给未来的我们</button>
    </form>
    <div class="timeline">
      <div class="rail"></div>
      <div v-for="message in store.messages" :key="message._id ?? message.createdAt" class="timeline-item" :data-author="message.author">
        <div class="bubble">
          <span class="author">{{ displayAuthor(message.author) }}</span>
          <p class="text">{{ message.content }}</p>
          <span class="time">{{ formatTime(message.createdAt) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { useHeartbeatStore } from '@/stores/heartbeat';
import { useAuthStore } from '@/stores/auth';
import { getPartnerName } from '@/utils/user';

const store = useHeartbeatStore();
const auth = useAuthStore();
const author = ref<'me' | 'partner'>('me');
const content = ref('');

onMounted(async () => {
  if (!store.messages.length) {
    await store.fetchAll();
  }
});

const formatTime = (value: string) => dayjs(value).format('YYYY/MM/DD HH:mm');

const selfLabel = computed(() => auth.user?.username ?? '我');
const partnerLabel = computed(() => getPartnerName(auth.user?.gender ?? 'other'));

const displayAuthor = (value: 'me' | 'partner') => (value === 'me' ? selfLabel.value : partnerLabel.value);

const handleSubmit = async () => {
  if (!content.value.trim()) return;
  await store.addMessage(author.value, content.value.trim());
  content.value = '';
};
</script>

<style scoped>
.message-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: var(--timeline-form-surface);
  border-radius: 18px;
  padding: 1rem;
}

.message-form label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  gap: 0.5rem;
}

.message-form label select,
.message-form label textarea {
  border-radius: 12px;
  border: none;
  padding: 0.6rem 0.75rem;
  font-family: inherit;
  background: var(--timeline-field-surface);
  color: inherit;
}

.message-form .full {
  grid-column: span 2;
}

.message-form button {
  grid-column: span 2;
  justify-self: flex-end;
}

.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.rail {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 100%;
  background: var(--timeline-rail);
  transform: translateX(-50%);
}

.timeline-item {
  display: flex;
  justify-content: flex-start;
  position: relative;
}

.timeline-item[data-author='partner'] {
  justify-content: flex-end;
}

.bubble {
  max-width: min(380px, 70vw);
  padding: 1rem 1.2rem;
  border-radius: 20px;
  background: var(--timeline-bubble);
  box-shadow: var(--timeline-shadow);
}

.timeline-item[data-author='partner'] .bubble {
  background: var(--timeline-bubble-partner);
}

.author {
  font-weight: 600;
  display: block;
  margin-bottom: 0.4rem;
}

.text {
  margin: 0 0 0.6rem;
  line-height: 1.5;
}

.time {
  opacity: 0.7;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .message-form {
    grid-template-columns: 1fr;
  }

  .message-form .full,
  .message-form button {
    grid-column: span 1;
  }

  .rail {
    left: 16px;
    transform: none;
  }

  .timeline-item,
  .timeline-item[data-author='partner'] {
    justify-content: flex-start;
    padding-left: 32px;
  }
}
</style>

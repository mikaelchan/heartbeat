<template>
  <section class="glass-panel">
    <h3 class="section-title">我们的心动留言</h3>
    <form class="message-form" @submit.prevent="handleSubmit">
      <label>
        想说点什么？
        <textarea v-model="content" rows="3" placeholder="写下此刻的心情..."></textarea>
      </label>
      <button type="submit" :disabled="!content.trim()">发送给未来的我们</button>
    </form>
    <div class="timeline">
      <div class="rail"></div>
      <div v-if="isLoading && !messages.length" class="timeline-loading">正在加载留言...</div>
      <TransitionGroup name="fade-up" tag="div" class="timeline-items">
        <div
          v-for="message in messages"
          :key="message._id ?? message.createdAt"
          class="timeline-item"
          :data-author="message.author"
        >
          <span class="timeline-dot"></span>
          <div class="bubble">
            <span class="author">{{ displayAuthor(message.author) }}</span>
            <p class="text">{{ message.content }}</p>
            <span class="time">{{ formatTime(message.createdAt) }}</span>
          </div>
        </div>
      </TransitionGroup>
    </div>
    <div v-if="canLoadMore" class="load-more">
      <button type="button" @click="loadMore" :disabled="isLoading">加载更多故事</button>
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
const content = ref('');

onMounted(async () => {
  if (!store.messages.length) {
    await store.fetchMessages();
  }
});

const formatTime = (value: string) => dayjs(value).format('YYYY/MM/DD HH:mm');

const selfLabel = computed(() => auth.user?.username ?? '我');
const partnerLabel = computed(() => getPartnerName(auth.user?.gender ?? 'other'));
const messages = computed(() => store.messages);
const isLoading = computed(() => store.messagesLoading);
const messageMeta = computed(() => store.messageMeta);
const canLoadMore = computed(() => messageMeta.value.page < messageMeta.value.totalPages);

const displayAuthor = (value: 'me' | 'partner') => (value === 'me' ? selfLabel.value : partnerLabel.value);

const handleSubmit = async () => {
  if (!content.value.trim()) return;
  await store.addMessage('me', content.value.trim());
  content.value = '';
};

const loadMore = async () => {
  if (isLoading.value || messageMeta.value.page >= messageMeta.value.totalPages) return;
  await store.fetchMessages(messageMeta.value.page + 1, messageMeta.value.pageSize, { append: true });
};
</script>

<style scoped>
.message-form {
  display: flex;
  flex-direction: column;
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

.message-form label textarea {
  border-radius: 12px;
  border: none;
  padding: 0.6rem 0.75rem;
  font-family: inherit;
  background: var(--timeline-field-surface);
  color: inherit;
}

.message-form button {
  align-self: flex-end;
}

.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  padding: 0.5rem 0;
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

.timeline-loading {
  text-align: center;
  color: var(--text-secondary);
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.timeline-item {
  position: relative;
  display: flex;
  justify-content: flex-start;
  width: 100%;
}

.timeline-item[data-author='partner'] {
  justify-content: flex-end;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--timeline-dot, linear-gradient(135deg, #ff7096, #ff9671));
  box-shadow: 0 0 0 4px rgba(255, 112, 150, 0.2);
  position: absolute;
  left: 50%;
  top: 1.3rem;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.timeline-item[data-author='partner'] .timeline-dot {
  background: var(--timeline-dot-partner, linear-gradient(135deg, #84fab0, #8fd3f4));
  box-shadow: 0 0 0 4px rgba(132, 250, 176, 0.2);
}

.bubble {
  max-width: min(380px, 70vw);
  padding: 1rem 1.2rem;
  border-radius: 20px;
  background: var(--timeline-bubble);
  box-shadow: var(--timeline-shadow);
  position: relative;
  overflow: hidden;
}

.timeline-item[data-author='me'] .bubble {
  margin-right: auto;
}

.timeline-item[data-author='partner'] .bubble {
  margin-left: auto;
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

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.25s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.load-more {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .message-form button {
    align-self: stretch;
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

  .timeline-dot {
    position: absolute;
    left: 16px;
    top: 1.3rem;
    transform: translate(-50%, -50%);
  }
}
</style>

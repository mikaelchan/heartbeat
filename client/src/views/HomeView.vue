<template>
  <section class="glass-panel" v-if="relationship">
    <div class="hero">
      <div>
        <p class="tag">{{ relationship.coupleNames.join(' · ') }}</p>
        <h2 class="duration gradient-text">{{ durationDisplay }}</h2>
        <p class="started">自 {{ formattedStart }}</p>
      </div>
      <div class="floating-orb"></div>
    </div>
  </section>
  <section class="glass-panel" v-if="relationship">
    <h3 class="section-title">重要时刻</h3>
    <ul class="milestones">
      <li v-for="milestone in relationship.milestones" :key="milestone.label">
        <span class="milestone-label">{{ milestone.label }}</span>
        <span class="milestone-date">{{ formatDate(milestone.date) }}</span>
      </li>
    </ul>
  </section>
  <section class="glass-panel" v-else>
    <p>加载中...</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useHeartbeatStore } from '@/stores/heartbeat';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const store = useHeartbeatStore();
const now = ref(dayjs());
let timer: number | undefined;

onMounted(async () => {
  if (!store.relationship) {
    await store.fetchAll();
  }
  timer = window.setInterval(() => {
    now.value = dayjs();
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer);
  }
});

const relationship = computed(() => store.relationship);

const formattedStart = computed(() =>
  relationship.value ? dayjs(relationship.value.startedOn).format('YYYY 年 M 月 D 日') : ''
);

const durationDisplay = computed(() => {
  if (!relationship.value) return '';
  const diff = dayjs.duration(now.value.diff(dayjs(relationship.value.startedOn)));
  const years = Math.floor(diff.asYears());
  const months = diff.months();
  const days = diff.days();
  const hours = diff.hours();
  const minutes = diff.minutes();
  const seconds = diff.seconds();
  return `${years} 年 ${months} 个月 ${days} 天 ${hours} 小时 ${minutes} 分 ${seconds} 秒`;
});

const formatDate = (value: string) => dayjs(value).format('YYYY 年 M 月 D 日');
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  overflow: hidden;
}

.tag {
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.75;
}

.duration {
  font-size: clamp(2.6rem, 5vw, 4.4rem);
  margin: 0.5rem 0 1rem;
}

.started {
  font-size: 1.1rem;
  opacity: 0.85;
}

.floating-orb {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(123, 161, 255, 0.05));
  animation: float 6s ease-in-out infinite;
  box-shadow: inset 0 0 60px rgba(255, 255, 255, 0.5);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(-10px);
  }
  50% {
    transform: translateY(10px);
  }
}

.milestones {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.milestone-label {
  font-weight: 600;
  display: block;
}

.milestone-date {
  opacity: 0.8;
}
</style>

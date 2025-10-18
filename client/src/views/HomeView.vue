<template>
  <section class="glass-panel pairing-notice" v-if="pairingCode && !hasPartner">
    <h3>邀请你的另一半</h3>
    <p>
      你的专属配对码：<strong>{{ pairingCode }}</strong>
      <br />
      请让 Ta 在注册时填写即可完成配对。
    </p>
  </section>
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
import { useAuthStore } from '@/stores/auth';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const store = useHeartbeatStore();
const auth = useAuthStore();
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
const pairingCode = computed(() => auth.user?.pairingCode ?? null);
const hasPartner = computed(() => Boolean(auth.user?.partnerId));

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
.pairing-notice {
  text-align: center;
  margin-bottom: 1.5rem;
  display: grid;
  gap: 0.75rem;
}

.pairing-notice h3 {
  margin: 0;
  font-size: 1.4rem;
  letter-spacing: -0.01em;
}

.pairing-notice strong {
  font-size: 1.6rem;
  letter-spacing: 0.25em;
  color: var(--accent);
  text-shadow: 0 8px 16px var(--accent-glow);
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  overflow: hidden;
  padding: 1rem 1.25rem;
  border-radius: 28px;
  background: var(--hero-surface);
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--hero-glow);
  pointer-events: none;
}

.tag {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.duration {
  font-size: clamp(2.8rem, 5vw, 4.8rem);
  margin: 0.5rem 0 1.25rem;
}

.started {
  font-size: 1.05rem;
  color: var(--text-secondary);
}

.floating-orb {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--orb-gradient-start), var(--orb-gradient-end));
  animation: float 6s ease-in-out infinite;
  box-shadow: inset 0 0 60px var(--orb-inner-glow), 0 18px 40px var(--orb-outer-glow);
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

.milestones li {
  padding: 1.1rem 1.25rem;
  border-radius: 22px;
  background: var(--milestone-surface);
  box-shadow: var(--milestone-shadow);
}

.milestone-label {
  font-weight: 600;
  display: block;
  margin-bottom: 0.35rem;
}

.milestone-date {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }

  .floating-orb {
    width: 180px;
    height: 180px;
  }
}
</style>

<template>
  <section class="glass-panel home-section pairing-notice" v-if="pairingCode && !hasPartner">
    <h3>邀请你的另一半</h3>
    <p>
      你的专属配对码：<strong>{{ pairingCode }}</strong>
      <br />
      请让 Ta 在注册时填写即可完成配对。
    </p>
  </section>
  <section class="glass-panel home-section" v-if="relationship">
    <div class="hero">
      <div>
        <p class="tag">{{ relationship.coupleNames.join(' · ') }}</p>
        <h2 class="duration gradient-text">{{ durationDisplay }}</h2>
        <p class="started">自 {{ formattedStart }}</p>
      </div>
      <GrowingTree class="tree-illustration" :progress="growthProgress" />
    </div>
  </section>
  <section class="glass-panel home-section" v-if="relationship">
    <h3 class="section-title">重要时刻</h3>
    <div v-if="milestoneLoading" class="milestones-loading">正在加载...</div>
    <template v-else>
      <ul v-if="milestones.length" class="milestones">
        <li v-for="milestone in milestones" :key="milestone.label">
          <span class="milestone-label">{{ milestone.label }}</span>
          <span class="milestone-date">{{ formatDate(milestone.date) }}</span>
        </li>
      </ul>
      <p v-else class="empty-hint">还没有记录重要时刻，去创造一个专属的回忆吧。</p>
    </template>
    <div class="milestone-pagination">
      <button type="button" @click="changeMilestonePage(milestoneMeta.page - 1)" :disabled="!canGoPrev">
        上一页
      </button>
      <span>{{ milestoneMeta.page }} / {{ milestoneMeta.totalPages }}</span>
      <button type="button" @click="changeMilestonePage(milestoneMeta.page + 1)" :disabled="!canGoNext">
        下一页
      </button>
    </div>
  </section>
  <section class="glass-panel home-section" v-else>
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
import GrowingTree from '@/components/GrowingTree.vue';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const store = useHeartbeatStore();
const auth = useAuthStore();
const now = ref(dayjs());
let timer: number | undefined;

onMounted(async () => {
  await store.fetchRelationshipSummary();
  await store.fetchMilestones();
  timer = window.setInterval(() => {
    now.value = dayjs();
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer);
  }
});

const relationship = computed(() => store.relationshipSummary);
const pairingCode = computed(() => auth.user?.pairingCode ?? null);
const hasPartner = computed(() => Boolean(auth.user?.partnerId));
const milestones = computed(() => store.milestones);
const milestoneMeta = computed(() => store.milestoneMeta);
const milestoneLoading = computed(() => store.milestoneLoading);

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

const growthProgress = computed(() => {
  if (!relationship.value) return 0;
  const diff = dayjs.duration(now.value.diff(dayjs(relationship.value.startedOn)));
  const years = diff.asYears();
  return Math.min(Math.max(years / 5, 0), 1);
});

const canGoPrev = computed(
  () => milestoneMeta.value.page > 1 && !milestoneLoading.value && milestoneMeta.value.totalPages > 0
);
const canGoNext = computed(
  () =>
    milestoneMeta.value.page < milestoneMeta.value.totalPages &&
    !milestoneLoading.value &&
    milestoneMeta.value.totalPages > 0
);

const changeMilestonePage = async (page: number) => {
  if (milestoneLoading.value) return;
  if (page < 1 || page > milestoneMeta.value.totalPages) return;
  await store.fetchMilestones(page);
};

const formatDate = (value: string) => dayjs(value).format('YYYY 年 M 月 D 日');
</script>

<style scoped>
.home-section + .home-section {
  margin-top: 2.5rem;
}

.pairing-notice {
  text-align: center;
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

.tree-illustration {
  width: min(240px, 30vw);
  flex-shrink: 0;
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

.empty-hint {
  margin: 1.5rem 0;
  text-align: center;
  color: var(--text-secondary);
}

.milestones-loading {
  margin: 1.5rem 0;
  text-align: center;
}

.milestone-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 1.75rem;
}

.milestone-pagination button {
  min-width: 96px;
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

  .tree-illustration {
    width: min(200px, 45vw);
  }
}
</style>

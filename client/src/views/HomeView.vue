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
    </div>
  </section>
  <section class="glass-panel home-section" v-if="relationship">
    <div class="milestone-header">
      <h3 class="section-title">重要时刻</h3>
    </div>
    <div v-if="milestoneLoading" class="milestones-loading">正在加载...</div>
    <template v-else>
      <ul class="milestones">
        <li class="milestone-card add-card" @click="openMilestoneDialog">
          <span class="add-icon">＋</span>
          <p>记录新的瞬间</p>
        </li>
        <li v-for="milestone in milestones" :key="milestone.label" class="milestone-card">
          <div v-if="milestone.imageUrl" class="milestone-image">
            <img :src="milestone.imageUrl" :alt="milestone.label" />
          </div>
          <div class="milestone-content">
            <span class="milestone-label">{{ milestone.label }}</span>
            <span class="milestone-date">{{ formatDate(milestone.date) }}</span>
          </div>
        </li>
      </ul>
      <p v-if="!milestones.length" class="empty-hint">还没有记录重要时刻，去创造一个专属的回忆吧。</p>
    </template>
    <div v-if="milestoneMeta.totalPages > 1" class="milestone-pagination">
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
  <div v-if="showMilestoneDialog" class="milestone-dialog-overlay" @click.self="closeMilestoneDialog">
    <form class="milestone-dialog" @submit.prevent="submitMilestone">
      <h4>记录新的重要时刻</h4>
      <label>
        时刻名称
        <input v-model="newMilestone.label" type="text" placeholder="写下新的里程碑..." required />
      </label>
      <label>
        日期
        <input v-model="newMilestone.date" type="date" required />
      </label>
      <label>
        上传照片（可选）
        <input
          ref="milestoneFileInput"
          type="file"
          accept="image/*"
          @change="onMilestoneFileChange"
        />
      </label>
      <p class="milestone-optional-hint">先记录下重要的文字，照片可以以后再补上。</p>
      <div v-if="newMilestone.imagePreview" class="milestone-image-preview">
        <img :src="newMilestone.imagePreview" alt="预览" />
        <button type="button" class="remove-image" @click="removeMilestoneImage">移除图片</button>
      </div>
      <div class="dialog-actions">
        <button type="button" class="ghost" @click="closeMilestoneDialog">取消</button>
        <button type="submit" :disabled="!canSubmitMilestone || milestoneSubmitting">
          {{ milestoneSubmitting ? '记录中...' : '确定' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useHeartbeatStore } from '@/stores/heartbeat';
import { useAuthStore } from '@/stores/auth';
import { readFileAsDataUrl } from '@/utils/file';
import { uploadImage } from '@/utils/upload';

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
const milestoneSubmitting = ref(false);
const showMilestoneDialog = ref(false);
const newMilestone = reactive({
  label: '',
  date: '',
  imageFile: null as File | null,
  imagePreview: ''
});
const milestoneFileInput = ref<HTMLInputElement | null>(null);

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

const resetMilestoneForm = () => {
  newMilestone.label = '';
  newMilestone.date = '';
  newMilestone.imageFile = null;
  newMilestone.imagePreview = '';
  if (milestoneFileInput.value) {
    milestoneFileInput.value.value = '';
  }
};

const openMilestoneDialog = () => {
  resetMilestoneForm();
  showMilestoneDialog.value = true;
};

const closeMilestoneDialog = () => {
  showMilestoneDialog.value = false;
  resetMilestoneForm();
};

const onMilestoneFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    newMilestone.imageFile = null;
    newMilestone.imagePreview = '';
    return;
  }

  newMilestone.imageFile = file;
  try {
    newMilestone.imagePreview = await readFileAsDataUrl(file);
  } catch (error) {
    console.error('Failed to read milestone image', error);
    newMilestone.imageFile = null;
    newMilestone.imagePreview = '';
  }
};

const removeMilestoneImage = () => {
  newMilestone.imageFile = null;
  newMilestone.imagePreview = '';
  if (milestoneFileInput.value) {
    milestoneFileInput.value.value = '';
  }
};

const canSubmitMilestone = computed(
  () => Boolean(newMilestone.label.trim() && newMilestone.date)
);

const submitMilestone = async () => {
  if (!canSubmitMilestone.value || milestoneSubmitting.value) return;
  milestoneSubmitting.value = true;
  try {
    let imageUrl: string | undefined;
    if (newMilestone.imageFile) {
      const result = await uploadImage(newMilestone.imageFile);
      imageUrl = result.url;
    }
    await store.addMilestone(newMilestone.label, newMilestone.date, imageUrl);
    closeMilestoneDialog();
  } finally {
    milestoneSubmitting.value = false;
  }
};
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


.milestone-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.milestones {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.milestone-card {
  padding: 1.1rem 1.25rem;
  border-radius: 22px;
  background: var(--milestone-surface);
  box-shadow: var(--milestone-shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.milestone-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(17, 25, 40, 0.18);
}

.milestone-card.add-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  border: 2px dashed var(--dialog-ghost-border);
  background: var(--interactive-muted);
  color: var(--text-secondary);
}

.milestone-card.add-card:hover {
  border-color: var(--accent);
  background: var(--interactive-muted-hover);
}

.add-icon {
  font-size: 2rem;
  line-height: 1;
}

.milestone-image {
  width: 100px;
  height: 100px;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.milestone-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.milestone-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
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


.milestone-dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--dialog-overlay);
  display: grid;
  place-items: center;
  padding: 1.5rem;
  z-index: 60;
}

.milestone-dialog {
  background: var(--dialog-surface);
  border-radius: 24px;
  padding: 2rem;
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  border: 1px solid var(--dialog-border);
  color: var(--text-primary);
}

.milestone-dialog h4 {
  margin: 0 0 0.5rem;
}

.milestone-dialog label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 600;
}

.milestone-optional-hint {
  margin: -0.25rem 0 0.25rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.milestone-dialog input[type='text'],
.milestone-dialog input[type='date'],
.milestone-dialog input[type='file'] {
  border-radius: 12px;
  border: 1px solid var(--dialog-input-border);
  padding: 0.65rem 0.85rem;
  background: var(--dialog-input-background);
  color: inherit;
  font-family: inherit;
}

.milestone-dialog input[type='file'] {
  padding: 0.45rem 0.85rem;
}

.milestone-image-preview {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  max-height: 220px;
}

.milestone-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-image {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.dialog-actions button {
  min-width: 96px;
}

.dialog-actions .ghost {
  background: transparent;
  border: 1px solid var(--dialog-ghost-border);
  color: inherit;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }

  .milestone-card {
    gap: 0.85rem;
  }

  .milestone-image {
    width: 80px;
    height: 80px;
  }
}
</style>

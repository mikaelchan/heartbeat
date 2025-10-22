<template>
  <div class="plans-view">
    <section class="glass-panel plans-shell">
      <div class="calendar-header">
        <button class="calendar-nav" @click="goPrevMonth" aria-label="上一月">‹</button>
        <div class="calendar-heading">
          <h3 class="section-title">{{ currentMonthLabel }}</h3>
          <p class="sub">把梦想一件件变成现实</p>
        </div>
        <button class="calendar-nav" @click="goNextMonth" aria-label="下一月">›</button>
      </div>
      <div class="calendar-grid">
        <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
        <div
          v-for="(cell, index) in calendarCells"
          :key="index"
          class="calendar-cell"
          :class="{ today: cell.isToday, 'other-month': !cell.inCurrentMonth }"
          @click="openPlanDialog(cell.date)"
        >
          <span class="date-number">{{ cell.date.date() }}</span>
          <div v-if="cell.entries.length" class="cell-plans">
            <div
              v-for="entry in cell.entries"
              :key="entry.id"
              class="plan-pill"
              :data-status="entry.status"
              :data-source="entry.source"
            >
              <p class="plan-title">{{ entry.title }}</p>
              <div v-if="entry.attachments.length" class="attachments">
                <img
                  v-for="(attachment, idx) in entry.attachments"
                  :key="idx"
                  :src="attachment"
                  :alt="entry.title"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="glass-panel bucket-shell">
      <div class="bucket-header">
        <h3 class="section-title">{{ bucketTitle }}</h3>
        <button type="button" class="add-bucket-button" @click="openBucketCreateDialog">
          添加待打卡事项
        </button>
      </div>
      <div class="bucket-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: bucketProgress + '%' }"></div>
        </div>
        <span v-if="bucketTotal">{{ completedBucket }} / {{ bucketTotal }} 已完成</span>
        <span v-else>暂未开始心动打卡</span>
      </div>
      <ul class="bucket-list">
        <li
          v-for="item in store.bucket"
          :key="item._id ?? item.order"
          :class="{ completed: item.completed }"
        >
          <button
            v-if="!item.completed"
            type="button"
            class="bucket-status-badge mark-complete"
            @click.stop="openBucketCompletionDialog(item)"
          >
            记录完成
          </button>
          <button
            v-else
            type="button"
            class="bucket-status-badge ghost"
            @click.stop="markBucketIncomplete(item)"
          >
            标记为未完成
          </button>
          <div class="bucket-content">
            <span class="order">#{{ item.order.toString().padStart(2, '0') }}</span>
            <div class="bucket-text">
              <span class="title">{{ item.title }}</span>
              <span v-if="item.completed && item.completedOn" class="completed-date">
                完成于 {{ formatDisplayDate(item.completedOn) }}
              </span>
            </div>
          </div>
          <div v-if="item.completed && item.photoUrl" class="bucket-thumbnail">
            <img :src="item.photoUrl" :alt="item.title" />
          </div>
        </li>
      </ul>
    </section>
    <div v-if="showPlanDialog" class="plan-dialog-overlay" @click.self="closePlanDialog">
      <form class="plan-dialog" @submit.prevent="submitPlan">
        <h3>创建新的计划</h3>
        <div class="dialog-row">
          <label>
            计划标题
            <input v-model="newPlan.title" type="text" placeholder="我们要去做什么？" required />
          </label>
          <label>
            计划日期（可选）
            <input v-model="newPlan.scheduledOn" type="date" />
          </label>
        </div>
        <label>
          状态
          <select v-model="newPlan.status">
            <option value="upcoming">即将开始</option>
            <option value="in-progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
        </label>
        <label>
          详细描述
          <textarea v-model="newPlan.description" rows="3" placeholder="写下关于这个计划的细节..."></textarea>
        </label>
        <label>
          附件（可选，使用换行分隔多个链接）
          <textarea v-model="newPlan.attachments" rows="2" placeholder="https://example.com/photo"></textarea>
        </label>
        <div class="dialog-footer">
          <button type="button" class="ghost" @click="closePlanDialog">取消</button>
          <button type="submit" :disabled="!canSubmitPlan || planSubmitting">
            {{ planSubmitting ? '创建中...' : '保存计划' }}
          </button>
        </div>
      </form>
    </div>
  </div>
    <div
      v-if="showBucketDialog"
      class="plan-dialog-overlay"
      @click.self="closeBucketCompletionDialog"
    >
      <form class="plan-dialog bucket-dialog" @submit.prevent="submitBucketCompletion">
        <h3>记录打卡完成</h3>
        <p class="bucket-dialog-hint">为这一刻选一个日期，也可以附上一张小小的照片。</p>
        <label>
          完成日期
          <input v-model="bucketDialog.completedOn" type="date" required />
        </label>
        <label>
          图片链接（可选）
          <input v-model="bucketDialog.photoUrl" type="url" placeholder="https://..." />
        </label>
        <div class="dialog-footer">
          <button type="button" class="ghost" @click="closeBucketCompletionDialog">取消</button>
          <button type="submit" :disabled="bucketSubmitting">{{ bucketSubmitting ? '保存中...' : '保存' }}</button>
        </div>
      </form>
    </div>
    <div
      v-if="showBucketCreateDialog"
      class="plan-dialog-overlay"
      @click.self="closeBucketCreateDialog"
    >
      <form class="plan-dialog bucket-dialog" @submit.prevent="submitBucketCreate">
        <h3>添加待打卡事项</h3>
        <label>
          事项名称
          <input
            v-model="bucketCreateTitle"
            type="text"
            placeholder="我们想完成的事情..."
            required
          />
        </label>
        <div class="dialog-footer">
          <button type="button" class="ghost" @click="closeBucketCreateDialog">取消</button>
          <button
            type="submit"
            :disabled="!canSubmitBucketCreate || bucketCreateSubmitting"
          >
            {{ bucketCreateSubmitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { useHeartbeatStore } from '@/stores/heartbeat';
import type { BucketItem, Plan } from '@/types';

const store = useHeartbeatStore();
const focusDate = ref(dayjs());
const planSubmitting = ref(false);
const createEmptyPlan = () => ({
  title: '',
  description: '',
  scheduledOn: '',
  status: 'upcoming' as Plan['status'],
  attachments: ''
});
const newPlan = ref(createEmptyPlan());
const showPlanDialog = ref(false);
const showBucketDialog = ref(false);
const showBucketCreateDialog = ref(false);
const bucketSubmitting = ref(false);
const bucketCreateSubmitting = ref(false);
const bucketDialog = reactive({
  item: null as BucketItem | null,
  completedOn: dayjs().format('YYYY-MM-DD'),
  photoUrl: ''
});
const bucketCreateTitle = ref('');

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

onMounted(async () => {
  if (!store.plans.length) {
    await store.fetchPlans();
  }
  if (!store.bucket.length) {
    await store.fetchBucket();
  }
});

const currentMonthLabel = computed(() => focusDate.value.format('YYYY 年 M 月'));

interface CalendarEntry {
  id: string;
  title: string;
  status: Plan['status'];
  attachments: string[];
  source: 'plan' | 'bucket';
  date: Dayjs;
}

interface CalendarCell {
  date: Dayjs;
  inCurrentMonth: boolean;
  isToday: boolean;
  entries: CalendarEntry[];
}

const calendarEntries = computed<CalendarEntry[]>(() => {
  const plans = store.plans
    .map((plan) => {
      const displayDate = plan.completedOn ?? plan.scheduledOn;
      if (!displayDate) return null;
      const date = dayjs(displayDate);
      if (!date.isValid()) return null;
      return {
        id: plan._id ?? `plan-${plan.title}-${displayDate}`,
        title: plan.title,
        status: plan.status,
        attachments: plan.attachments ?? [],
        source: 'plan' as const,
        date
      };
    })
    .filter((entry): entry is CalendarEntry => Boolean(entry));

  const bucket = store.bucket
    .filter((item) => item.completed && item.completedOn)
    .map((item) => {
      const date = dayjs(item.completedOn as string);
      if (!date.isValid()) return null;
      return {
        id: `bucket-${item._id ?? item.order}`,
        title: item.title,
        status: 'completed' as Plan['status'],
        attachments: item.photoUrl ? [item.photoUrl] : [],
        source: 'bucket' as const,
        date
      };
    })
    .filter((entry): entry is CalendarEntry => Boolean(entry));

  return [...plans, ...bucket];
});

const calendarCells = computed<CalendarCell[]>(() => {
  const startOfMonth = focusDate.value.startOf('month');
  const endOfMonth = focusDate.value.endOf('month');
  const startWeek = startOfMonth.startOf('week');
  const endWeek = endOfMonth.endOf('week');
  const cells: CalendarCell[] = [];
  let cursor = startWeek;
  while (cursor.isBefore(endWeek) || cursor.isSame(endWeek)) {
    const dayEntries = calendarEntries.value.filter((entry) => entry.date.isSame(cursor, 'day'));
    cells.push({
      date: cursor,
      inCurrentMonth: cursor.isSame(focusDate.value, 'month'),
      isToday: cursor.isSame(dayjs(), 'day'),
      entries: dayEntries
    });
    cursor = cursor.add(1, 'day');
  }
  return cells;
});

const goPrevMonth = () => {
  focusDate.value = focusDate.value.subtract(1, 'month');
};

const goNextMonth = () => {
  focusDate.value = focusDate.value.add(1, 'month');
};

const bucketTotal = computed(() => store.bucket.length);
const completedBucket = computed(() => store.bucket.filter((item) => item.completed).length);
const bucketProgress = computed(() =>
  bucketTotal.value === 0 ? 0 : (completedBucket.value / bucketTotal.value) * 100
);
const bucketTitle = computed(() =>
  bucketTotal.value ? `${bucketTotal.value} 件心动打卡` : '心动打卡清单'
);
const canSubmitBucketCreate = computed(() => Boolean(bucketCreateTitle.value.trim()));

const canSubmitPlan = computed(() => Boolean(newPlan.value.title.trim()));

const resetPlanForm = (date?: Dayjs) => {
  newPlan.value = createEmptyPlan();
  if (date) {
    newPlan.value.scheduledOn = date.format('YYYY-MM-DD');
  }
};

const openPlanDialog = (date?: Dayjs) => {
  resetPlanForm(date);
  showPlanDialog.value = true;
};

const closePlanDialog = () => {
  showPlanDialog.value = false;
  resetPlanForm();
};

const submitPlan = async () => {
  if (!canSubmitPlan.value || planSubmitting.value) return;
  planSubmitting.value = true;
  try {
    await store.addPlan({
      title: newPlan.value.title,
      description: newPlan.value.description,
      scheduledOn: newPlan.value.scheduledOn,
      status: newPlan.value.status,
      attachments: newPlan.value.attachments
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    });
    closePlanDialog();
  } finally {
    planSubmitting.value = false;
  }
};

const formatDisplayDate = (value: string) => dayjs(value).format('YYYY 年 M 月 D 日');

const closeBucketCompletionDialog = () => {
  showBucketDialog.value = false;
  bucketDialog.item = null;
  bucketDialog.completedOn = dayjs().format('YYYY-MM-DD');
  bucketDialog.photoUrl = '';
};

const openBucketCompletionDialog = (item: BucketItem) => {
  if (bucketSubmitting.value) return;
  bucketDialog.item = item;
  bucketDialog.completedOn = dayjs().format('YYYY-MM-DD');
  bucketDialog.photoUrl = item.photoUrl ?? '';
  showBucketDialog.value = true;
};

const markBucketIncomplete = async (item: BucketItem) => {
  if (bucketSubmitting.value) return;
  bucketSubmitting.value = true;
  try {
    await store.updateBucketItem(item, { completed: false });
  } finally {
    bucketSubmitting.value = false;
  }
};

const submitBucketCompletion = async () => {
  if (!bucketDialog.item || bucketSubmitting.value) return;
  const date = bucketDialog.completedOn;
  if (!date) return;
  bucketSubmitting.value = true;
  try {
    await store.updateBucketItem(bucketDialog.item, {
      completed: true,
      completedOn: date,
      photoUrl: bucketDialog.photoUrl.trim() || undefined
    });
    closeBucketCompletionDialog();
  } finally {
    bucketSubmitting.value = false;
  }
};

const openBucketCreateDialog = () => {
  bucketCreateTitle.value = '';
  showBucketCreateDialog.value = true;
};

const closeBucketCreateDialog = () => {
  showBucketCreateDialog.value = false;
  bucketCreateTitle.value = '';
};

const submitBucketCreate = async () => {
  if (!canSubmitBucketCreate.value || bucketCreateSubmitting.value) return;
  bucketCreateSubmitting.value = true;
  try {
    await store.addBucketItem(bucketCreateTitle.value);
    closeBucketCreateDialog();
  } finally {
    bucketCreateSubmitting.value = false;
  }
};
</script>

<style scoped>
.plans-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.plans-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.calendar-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  justify-content: space-between;
}

.calendar-nav {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.6rem;
  background: var(--calendar-nav-background);
}

.calendar-heading {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.75rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  opacity: 0.8;
}

.calendar-cell {
  min-height: 140px;
  border-radius: 18px;
  padding: 0.75rem;
  background: var(--calendar-cell-background);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.calendar-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
}

.calendar-cell.today {
  border: 1px solid var(--calendar-cell-border);
}

.calendar-cell.other-month {
  opacity: 0.5;
}

.date-number {
  font-weight: 600;
}

.cell-plans {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plan-pill {
  border-radius: 12px;
  padding: 0.6rem;
  background: var(--calendar-plan-background);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.plan-pill[data-status='completed'] {
  background: var(--calendar-plan-completed);
}

.plan-pill[data-status='in-progress'] {
  background: var(--calendar-plan-progress);
}

.plan-pill[data-source='bucket'] {
  border: 1px dashed var(--dialog-ghost-border);
}

.attachments {
  display: flex;
  gap: 0.3rem;
}

.attachments img {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
}

.bucket-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.bucket-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
}

.add-bucket-button {
  border-radius: 999px;
  padding: 0.4rem 1.1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: var(--calendar-plan-upcoming);
  color: #0f172a;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.add-bucket-button:active {
  transform: scale(0.97);
  box-shadow: none;
}

.bucket-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: var(--progress-bar-background);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--progress-fill);
  transition: width 0.3s ease;
}

.bucket-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
}

.bucket-list li {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.35rem 2.75rem 1rem 1rem;
  border-radius: 16px;
  background: var(--bucket-card-background);
}

.bucket-list li.completed {
  background: var(--bucket-card-completed);
}

.bucket-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.order {
  font-weight: 600;
  opacity: 0.75;
}

.bucket-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title {
  font-weight: 500;
}

.completed-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.bucket-status-badge {
  position: absolute;
  top: 0.6rem;
  right: 0.75rem;
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid transparent;
  background: var(--interactive-muted);
  color: var(--text-primary);
  box-shadow: var(--shadow-card);
  cursor: pointer;
}

.bucket-status-badge.mark-complete {
  background: var(--calendar-plan-upcoming);
  color: #0f172a;
}

.bucket-status-badge.ghost {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--dialog-ghost-border);
  color: var(--text-secondary);
  box-shadow: none;
}

.bucket-status-badge:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.bucket-status-badge:active {
  transform: translateY(1px);
}

.bucket-thumbnail {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  margin-left: auto;
}

.bucket-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plan-dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--dialog-overlay);
  display: grid;
  place-items: center;
  padding: 1.5rem;
  z-index: 80;
}

.plan-dialog {
  width: min(520px, 100%);
  background: var(--dialog-surface);
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  border: 1px solid var(--dialog-border);
  color: var(--text-primary);
}

.plan-dialog h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.plan-dialog label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 600;
}

.plan-dialog input,
.plan-dialog select,
.plan-dialog textarea {
  border-radius: 12px;
  border: 1px solid var(--dialog-input-border);
  padding: 0.65rem 0.85rem;
  background: var(--dialog-input-background);
  color: inherit;
  font-family: inherit;
}

.plan-dialog textarea {
  resize: vertical;
}

.dialog-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.dialog-footer .ghost {
  background: transparent;
  border: 1px solid var(--dialog-ghost-border);
  color: inherit;
}

.bucket-dialog {
  width: min(420px, 100%);
}

.bucket-dialog-hint {
  margin: -0.5rem 0 0.5rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-wrap: wrap;
  }

  .calendar-heading {
    order: 1;
    width: 100%;
  }

  .dialog-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

<template>
  <div class="plans-view">
    <section class="glass-panel plans-shell">
      <div class="calendar-header">
        <button class="calendar-nav" @click="goPrevMonth">‹</button>
        <div class="calendar-heading">
          <h3 class="section-title">{{ currentMonthLabel }}</h3>
          <p class="sub">把梦想一件件变成现实</p>
        </div>
        <div class="header-actions">
          <button type="button" class="primary" @click="openPlanDialog()">＋ 添加计划</button>
          <button class="calendar-nav" @click="goNextMonth">›</button>
        </div>
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
          <div v-if="cell.plans.length" class="cell-plans">
            <div
              v-for="plan in cell.plans"
              :key="plan._id ?? plan.title"
              class="plan-pill"
              :data-status="plan.status"
              @click.stop
            >
              <p class="plan-title">{{ plan.title }}</p>
              <div v-if="plan.attachments?.length" class="attachments">
                <img v-for="(attachment, idx) in plan.attachments" :key="idx" :src="attachment" :alt="plan.title" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="glass-panel bucket-shell" @click="openPlanDialog()">
      <div class="bucket-header">
        <h3 class="section-title">{{ bucketTitle }}</h3>
        <button type="button" class="ghost" @click.stop="openPlanDialog()">＋ 添加计划</button>
      </div>
      <div class="bucket-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: bucketProgress + '%' }"></div>
        </div>
        <span v-if="bucketTotal">{{ completedBucket }} / {{ bucketTotal }} 已完成</span>
        <span v-else>暂未开始心动打卡</span>
      </div>
      <ul class="bucket-list">
        <li v-for="item in store.bucket" :key="item._id ?? item.order" :class="{ completed: item.completed }">
          <span class="order">#{{ item.order.toString().padStart(2, '0') }}</span>
          <span class="title">{{ item.title }}</span>
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
            计划日期
            <input v-model="newPlan.scheduledOn" type="date" required />
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
          <textarea v-model="newPlan.description" rows="3" placeholder="写下关于这个计划的细节..." required></textarea>
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
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { useHeartbeatStore } from '@/stores/heartbeat';
import type { Plan } from '@/types';

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

interface CalendarCell {
  date: Dayjs;
  inCurrentMonth: boolean;
  isToday: boolean;
  plans: Plan[];
}

const calendarCells = computed<CalendarCell[]>(() => {
  const startOfMonth = focusDate.value.startOf('month');
  const endOfMonth = focusDate.value.endOf('month');
  const startWeek = startOfMonth.startOf('week');
  const endWeek = endOfMonth.endOf('week');
  const cells: CalendarCell[] = [];
  let cursor = startWeek;
  while (cursor.isBefore(endWeek) || cursor.isSame(endWeek)) {
    const dayPlans = store.plans.filter((plan) => dayjs(plan.scheduledOn).isSame(cursor, 'day'));
    cells.push({
      date: cursor,
      inCurrentMonth: cursor.isSame(focusDate.value, 'month'),
      isToday: cursor.isSame(dayjs(), 'day'),
      plans: dayPlans
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

const canSubmitPlan = computed(
  () => newPlan.value.title.trim() && newPlan.value.description.trim() && newPlan.value.scheduledOn
);

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

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-actions .primary {
  border-radius: 999px;
  padding: 0.6rem 1.3rem;
  font-weight: 600;
  background: var(--primary-button-bg);
  color: var(--primary-button-text);
  box-shadow: var(--primary-button-shadow);
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
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.bucket-header .ghost {
  border-radius: 999px;
  padding: 0.45rem 1rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid var(--surface-border, rgba(15, 23, 42, 0.12));
  color: inherit;
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
  display: flex;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-radius: 16px;
  background: var(--bucket-card-background);
}

.bucket-list li.completed {
  background: var(--bucket-card-completed);
}

.order {
  font-weight: 600;
  opacity: 0.75;
}

.title {
  font-weight: 500;
}

.plan-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(13, 16, 28, 0.68);
  display: grid;
  place-items: center;
  padding: 1.5rem;
  z-index: 80;
}

.plan-dialog {
  width: min(520px, 100%);
  background: var(--panel-surface, rgba(25, 33, 59, 0.95));
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
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
  border: none;
  padding: 0.65rem 0.85rem;
  background: var(--plan-field-surface, rgba(255, 255, 255, 0.08));
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
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: inherit;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-wrap: wrap;
  }

  .calendar-heading {
    order: 1;
    width: 100%;
  }

  .header-actions {
    order: 2;
    width: 100%;
    justify-content: space-between;
  }

  .header-actions .primary {
    flex: 1;
    text-align: center;
  }

  .dialog-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

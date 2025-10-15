<template>
  <section class="glass-panel plans-shell">
    <div class="calendar-header">
      <button @click="goPrevMonth">‹</button>
      <div>
        <h3 class="section-title">{{ currentMonthLabel }}</h3>
        <p class="sub">把梦想一件件变成现实</p>
      </div>
      <button @click="goNextMonth">›</button>
    </div>
    <div class="calendar-grid">
      <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
      <div
        v-for="(cell, index) in calendarCells"
        :key="index"
        class="calendar-cell"
        :class="{ today: cell.isToday, 'other-month': !cell.inCurrentMonth }"
      >
        <span class="date-number">{{ cell.date.date() }}</span>
        <div v-if="cell.plans.length" class="cell-plans">
          <div v-for="plan in cell.plans" :key="plan._id ?? plan.title" class="plan-pill" :data-status="plan.status">
            <p class="plan-title">{{ plan.title }}</p>
            <div v-if="plan.attachments?.length" class="attachments">
              <img v-for="(attachment, idx) in plan.attachments" :key="idx" :src="attachment" :alt="plan.title" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="glass-panel">
    <h3 class="section-title">100 件心动打卡</h3>
    <div class="bucket-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: bucketProgress + '%' }"></div>
      </div>
      <span>{{ completedBucket }} / {{ bucketTotal }} 已完成</span>
    </div>
    <ul class="bucket-list">
      <li v-for="item in store.bucket" :key="item._id ?? item.order" :class="{ completed: item.completed }">
        <span class="order">#{{ item.order.toString().padStart(2, '0') }}</span>
        <span class="title">{{ item.title }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { useHeartbeatStore } from '@/stores/heartbeat';
import type { Plan } from '@/types';

const store = useHeartbeatStore();
const focusDate = ref(dayjs());

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

onMounted(async () => {
  if (!store.plans.length || !store.bucket.length) {
    await store.fetchAll();
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

const bucketTotal = computed(() => store.bucket.length || 100);
const completedBucket = computed(() => store.bucket.filter((item) => item.completed).length);
const bucketProgress = computed(() => (completedBucket.value / bucketTotal.value) * 100);
</script>

<style scoped>
.plans-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-header button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.6rem;
  background: rgba(255, 255, 255, 0.3);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.75rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  opacity: 0.7;
}

.calendar-cell {
  min-height: 140px;
  border-radius: 18px;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.calendar-cell.today {
  border: 1px solid rgba(255, 255, 255, 0.4);
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
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.plan-pill[data-status='completed'] {
  background: rgba(150, 242, 215, 0.28);
}

.plan-pill[data-status='in-progress'] {
  background: rgba(255, 199, 255, 0.28);
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

.bucket-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #ffc7ff, #8ebdff);
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
  background: rgba(255, 255, 255, 0.06);
}

.bucket-list li.completed {
  background: rgba(150, 242, 215, 0.24);
}

.order {
  font-weight: 600;
  opacity: 0.75;
}

.title {
  font-weight: 500;
}
</style>

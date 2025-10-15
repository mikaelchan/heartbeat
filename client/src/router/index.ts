import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import MemoryMapView from '@/views/MemoryMapView.vue';
import PlansView from '@/views/PlansView.vue';
import MessageBoardView from '@/views/MessageBoardView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/memories',
    name: 'memories',
    component: MemoryMapView
  },
  {
    path: '/plans',
    name: 'plans',
    component: PlansView
  },
  {
    path: '/messages',
    name: 'messages',
    component: MessageBoardView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

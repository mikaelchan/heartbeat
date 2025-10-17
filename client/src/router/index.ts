import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import MemoryMapView from '@/views/MemoryMapView.vue';
import PlansView from '@/views/PlansView.vue';
import MessageBoardView from '@/views/MessageBoardView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/memories',
    name: 'memories',
    component: MemoryMapView,
    meta: { requiresAuth: true }
  },
  {
    path: '/plans',
    name: 'plans',
    component: PlansView,
    meta: { requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'messages',
    component: MessageBoardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  if (!authStore.initialized) {
    await authStore.initialize();
  }

  if (to.meta.requiresAuth === false) {
    if (authStore.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
      return { name: 'home' };
    }
    return true;
  }

  if (!authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  return true;
});

export default router;

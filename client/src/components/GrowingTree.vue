<template>
  <div class="tree-wrapper" :class="stageClass">
    <div class="tree" :style="styleVars">
      <div class="trunk"></div>
      <div class="canopy">
        <span class="leaf layer layer-1"></span>
        <span class="leaf layer layer-2"></span>
        <span class="leaf layer layer-3"></span>
      </div>
    </div>
    <div class="ground"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ progress: number }>();

const clamped = computed(() => Math.min(Math.max(props.progress ?? 0, 0), 1));

const stageClass = computed(() => {
  if (clamped.value < 0.25) return 'stage-seedling';
  if (clamped.value < 0.5) return 'stage-sapling';
  if (clamped.value < 0.75) return 'stage-grown';
  return 'stage-ancient';
});

const styleVars = computed(() => ({
  '--growth-scale': (0.6 + clamped.value * 0.5).toString(),
  '--trunk-height': `${40 + clamped.value * 50}%`,
  '--leaf-scale': (0.5 + clamped.value * 0.6).toString(),
  '--leaf-opacity': (0.4 + clamped.value * 0.6).toString()
}));
</script>

<style scoped>
.tree-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.tree {
  position: relative;
  width: 48%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transform-origin: center bottom;
  animation: sway 6s ease-in-out infinite;
  transition: transform 0.6s ease;
  transform: scale(var(--growth-scale));
}

.trunk {
  width: 18%;
  height: var(--trunk-height);
  background: linear-gradient(180deg, #b67835 0%, #7c4b1a 100%);
  border-radius: 40px;
  box-shadow: inset 0 -8px 16px rgba(0, 0, 0, 0.25);
}

.canopy {
  position: absolute;
  bottom: calc(var(--trunk-height) - 4%);
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  place-items: center;
  gap: 0.4rem;
}

.leaf {
  display: block;
  border-radius: 50%;
  opacity: var(--leaf-opacity);
  transform-origin: center bottom;
  transform: scale(var(--leaf-scale));
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.layer-1 {
  width: 220px;
  height: 220px;
  background: radial-gradient(circle at 40% 30%, rgba(128, 200, 144, 0.9), rgba(40, 110, 70, 0.95));
}

.layer-2 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle at 60% 30%, rgba(102, 182, 132, 0.9), rgba(34, 96, 60, 0.95));
}

.layer-3 {
  width: 140px;
  height: 140px;
  background: radial-gradient(circle at 50% 40%, rgba(92, 166, 120, 0.85), rgba(28, 78, 50, 0.9));
}

.ground {
  position: absolute;
  bottom: 0;
  width: 80%;
  height: 10%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 20%, rgba(90, 150, 90, 0.5), rgba(30, 70, 30, 0.65));
  filter: blur(6px);
  opacity: 0.85;
}

.stage-seedling .layer-1,
.stage-seedling .layer-2,
.stage-seedling .layer-3 {
  filter: saturate(0.8);
}

.stage-sapling .layer-1,
.stage-sapling .layer-2,
.stage-sapling .layer-3 {
  filter: saturate(0.9);
}

.stage-ancient .tree {
  animation-duration: 7.5s;
}

.stage-ancient .layer-1,
.stage-ancient .layer-2,
.stage-ancient .layer-3 {
  filter: saturate(1.1) drop-shadow(0 12px 24px rgba(24, 64, 32, 0.35));
}

@keyframes sway {
  0%,
  100% {
    transform: scale(var(--growth-scale)) rotate(-1.8deg);
  }
  50% {
    transform: scale(var(--growth-scale)) rotate(1.8deg);
  }
}

@media (max-width: 768px) {
  .tree {
    width: 60%;
  }

  .layer-1 {
    width: 180px;
    height: 180px;
  }

  .layer-2 {
    width: 150px;
    height: 150px;
  }

  .layer-3 {
    width: 120px;
    height: 120px;
  }
}
</style>

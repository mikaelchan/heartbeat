<?php get_header(); ?>

<main class="main-content">
    <div class="container">
        <!-- Hero Section -->
        <section class="hero-section">
            <div class="hero-content">
                <h1 class="love-timer">
                    在一起<span id="days-together"><?php echo get_days_together(); ?></span>天
                    <span id="hours-minutes"><?php echo get_current_time_display(); ?></span>时
                </h1>
            </div>
        </section>

        <!-- Main Dashboard -->
        <div class="dashboard grid grid-3">
            <!-- Recent Sweet Moments -->
            <div class="card recent-moments">
                <h3>最近甜蜜瞬间</h3>
                <div class="moment-image">
                    <?php 
                    $recent_photo = get_recent_photo();
                    if ($recent_photo): ?>
                        <img src="<?php echo $recent_photo['url']; ?>" alt="最近照片" />
                        <p class="moment-date"><?php echo $recent_photo['date']; ?></p>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Today's Mood -->
            <div class="card mood-card">
                <h3>今日心情 <span class="heart-icon">❤️</span></h3>
                <div class="mood-input">
                    <textarea id="mood-text" placeholder="记录今天的心情..."></textarea>
                    <button class="btn btn-primary" onclick="saveMood()">保存</button>
                </div>
                <div class="recent-moods">
                    <?php echo get_recent_moods(); ?>
                </div>
            </div>

            <!-- Important Anniversary -->
            <div class="card anniversary-card">
                <h3>重要纪念日 <span class="heart-icon">❤️</span></h3>
                <div class="anniversary-countdown">
                    <div class="countdown-number"><?php echo get_next_anniversary_days(); ?></div>
                    <div class="countdown-label">天后到达</div>
                    <div class="anniversary-name"><?php echo get_next_anniversary_name(); ?></div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
            <a href="<?php echo home_url('/photo-gallery'); ?>" class="btn btn-primary">查看合影集</a>
            <a href="<?php echo home_url('/future-plans'); ?>" class="btn btn-primary">未来计划</a>
            <a href="<?php echo home_url('/whisper'); ?>" class="btn btn-primary">悄悄话</a>
        </div>
    </div>
</main>

<style>
.hero-section {
    background: var(--gradient-bg);
    color: white;
    text-align: center;
    padding: 4rem 0;
    border-radius: 30px;
    margin-bottom: 3rem;
    position: relative;
    overflow: hidden;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="hearts" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><text x="10" y="15" text-anchor="middle" fill="rgba(255,255,255,0.1)" font-size="12">♥</text></pattern></defs><rect width="100" height="100" fill="url(%23hearts)"/></svg>');
    opacity: 0.3;
}

.love-timer {
    font-size: 3rem;
    font-weight: 300;
    position: relative;
    z-index: 1;
}

#days-together {
    font-weight: bold;
    color: var(--primary-color);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.dashboard {
    margin-bottom: 3rem;
}

.moment-image img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 15px;
    margin-bottom: 1rem;
}

.moment-date {
    color: #666;
    font-size: 0.9rem;
}

.mood-input textarea {
    width: 100%;
    min-height: 80px;
    border: 2px solid #eee;
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1rem;
    resize: vertical;
}

.anniversary-countdown {
    text-align: center;
}

.countdown-number {
    font-size: 3rem;
    font-weight: bold;
    color: var(--primary-color);
}

.countdown-label {
    color: #666;
    margin-bottom: 0.5rem;
}

.anniversary-name {
    font-weight: bold;
    color: var(--accent-color);
}

.quick-actions {
    text-align: center;
    margin-top: 2rem;
}

.quick-actions .btn {
    margin: 0 1rem;
}

.heart-icon {
    animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

@media (max-width: 768px) {
    .love-timer {
        font-size: 2rem;
    }
    
    .quick-actions .btn {
        display: block;
        margin: 1rem auto;
        max-width: 200px;
    }
}
</style>

<script>
function saveMood() {
    const moodText = document.getElementById('mood-text').value;
    if (!moodText.trim()) return;
    
    fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=save_mood&mood=' + encodeURIComponent(moodText) + '&nonce=<?php echo wp_create_nonce('save_mood'); ?>'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('mood-text').value = '';
            location.reload();
        }
    });
}

// Update time display every minute
setInterval(function() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    document.getElementById('hours-minutes').textContent = `${hours}小时${minutes}分`;
}, 60000);
</script>

<?php get_footer(); ?>

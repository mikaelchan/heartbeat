<footer class="site-footer">
    <div class="container">
        <div class="footer-content">
            <p>&copy; <?php echo date('Y'); ?> Heartbeat - 爱情永恒 💕</p>
            <div class="footer-stats">
                <span>在一起 <?php echo get_days_together(); ?> 天</span>
                <span>共同回忆 <?php echo get_total_memories(); ?> 个</span>
                <span>未来计划 <?php echo get_future_plans_count(); ?> 项</span>
            </div>
        </div>
    </div>
</footer>

<style>
.site-footer {
    background: var(--dark-bg);
    color: var(--text-light);
    padding: 2rem 0;
    margin-top: 4rem;
}

.footer-content {
    text-align: center;
}

.footer-stats {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
}

.footer-stats span {
    background: rgba(255,255,255,0.1);
    padding: 0.5rem 1rem;
    border-radius: 15px;
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .footer-stats {
        gap: 1rem;
    }
    
    .footer-stats span {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
    }
}
</style>

<?php wp_footer(); ?>
</body>
</html>

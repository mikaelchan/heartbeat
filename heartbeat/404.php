<?php get_header(); ?>

<main class="main-content">
    <div class="container">
        <div class="error-404">
            <div class="error-content">
                <h1>💔 页面走丢了</h1>
                <p>抱歉，你要找的页面不存在。</p>
                <p>也许它去寻找真爱了？</p>
                
                <div class="error-actions">
                    <a href="<?php echo home_url(); ?>" class="btn btn-primary">回到首页</a>
                    <a href="<?php echo home_url('/photo-gallery'); ?>" class="btn btn-primary">查看合影集</a>
                </div>
                
                <div class="search-form">
                    <h3>搜索回忆</h3>
                    <?php get_search_form(); ?>
                </div>
            </div>
        </div>
    </div>
</main>

<style>
.error-404 {
    text-align: center;
    padding: 4rem 0;
}

.error-content h1 {
    font-size: 3rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.error-content p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1rem;
}

.error-actions {
    margin: 2rem 0;
}

.error-actions .btn {
    margin: 0 1rem;
}

.search-form {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 20px;
    box-shadow: var(--card-shadow);
}

.search-form h3 {
    color: var(--secondary-color);
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .error-content h1 {
        font-size: 2rem;
    }
    
    .error-actions .btn {
        display: block;
        margin: 1rem auto;
        max-width: 200px;
    }
}
</style>

<?php get_footer(); ?>

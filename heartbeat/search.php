<?php get_header(); ?>

<main class="main-content">
    <div class="container">
        <div class="search-results">
            <div class="search-header">
                <h1>🔍 搜索结果</h1>
                <p>搜索关键词: "<strong><?php echo get_search_query(); ?></strong>"</p>
                <?php get_search_form(); ?>
            </div>

            <div class="results-content">
                <?php if (have_posts()) : ?>
                    <div class="results-grid">
                        <?php while (have_posts()) : the_post(); ?>
                            <div class="result-item card">
                                <?php if (has_post_thumbnail()) : ?>
                                    <div class="result-image">
                                        <?php the_post_thumbnail('medium'); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <div class="result-content">
                                    <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                                    <div class="result-meta">
                                        <span class="result-date"><?php echo get_the_date('Y年m月d日'); ?></span>
                                        <span class="result-type"><?php echo get_post_type_object(get_post_type())->labels->singular_name; ?></span>
                                    </div>
                                    <div class="result-excerpt">
                                        <?php the_excerpt(); ?>
                                    </div>
                                </div>
                            </div>
                        <?php endwhile; ?>
                    </div>
                    
                    <div class="pagination">
                        <?php the_posts_pagination(); ?>
                    </div>
                    
                <?php else : ?>
                    <div class="no-results">
                        <h2>💔 没有找到相关回忆</h2>
                        <p>很抱歉，没有找到与 "<strong><?php echo get_search_query(); ?></strong>" 相关的内容。</p>
                        
                        <div class="search-suggestions">
                            <h3>试试这些建议：</h3>
                            <ul>
                                <li>检查拼写是否正确</li>
                                <li>尝试使用更简单的关键词</li>
                                <li>使用不同的关键词组合</li>
                            </ul>
                        </div>
                        
                        <div class="quick-links">
                            <h3>或者浏览这些页面：</h3>
                            <a href="<?php echo home_url('/photo-gallery'); ?>" class="btn btn-primary">查看合影集</a>
                            <a href="<?php echo home_url('/future-plans'); ?>" class="btn btn-primary">未来计划</a>
                            <a href="<?php echo home_url('/whisper'); ?>" class="btn btn-primary">悄悄话</a>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</main>

<style>
.search-header {
    text-align: center;
    margin-bottom: 3rem;
    padding: 2rem;
    background: var(--gradient-bg);
    color: white;
    border-radius: 20px;
}

.search-header h1 {
    margin-bottom: 1rem;
}

.search-header form {
    max-width: 400px;
    margin: 1rem auto 0;
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.result-item {
    transition: transform 0.3s ease;
}

.result-item:hover {
    transform: translateY(-5px);
}

.result-image img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 10px;
    margin-bottom: 1rem;
}

.result-content h3 {
    margin-bottom: 0.5rem;
}

.result-content h3 a {
    color: var(--primary-color);
    text-decoration: none;
}

.result-content h3 a:hover {
    text-decoration: underline;
}

.result-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #666;
}

.result-excerpt {
    color: #666;
    line-height: 1.6;
}

.no-results {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 20px;
    box-shadow: var(--card-shadow);
}

.no-results h2 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.search-suggestions {
    margin: 2rem 0;
    text-align: left;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}

.search-suggestions h3 {
    color: var(--secondary-color);
    margin-bottom: 1rem;
}

.search-suggestions ul {
    padding-left: 1.5rem;
}

.search-suggestions li {
    margin-bottom: 0.5rem;
}

.quick-links {
    margin-top: 2rem;
}

.quick-links h3 {
    color: var(--secondary-color);
    margin-bottom: 1rem;
}

.quick-links .btn {
    margin: 0 0.5rem;
}

.pagination {
    text-align: center;
    margin-top: 2rem;
}

@media (max-width: 768px) {
    .results-grid {
        grid-template-columns: 1fr;
    }
    
    .quick-links .btn {
        display: block;
        margin: 1rem auto;
        max-width: 200px;
    }
}
</style>

<?php get_footer(); ?>

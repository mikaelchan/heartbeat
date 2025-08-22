<form role="search" method="get" class="search-form" action="<?php echo esc_url(home_url('/')); ?>">
    <div class="search-input-group">
        <input type="search" 
               class="search-field" 
               placeholder="搜索回忆..." 
               value="<?php echo get_search_query(); ?>" 
               name="s" 
               title="搜索" />
        <button type="submit" class="search-submit">
            <span class="search-icon">🔍</span>
            <span class="screen-reader-text">搜索</span>
        </button>
    </div>
</form>

<style>
.search-form {
    position: relative;
    max-width: 400px;
    margin: 0 auto;
}

.search-input-group {
    display: flex;
    background: white;
    border-radius: 25px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.search-field {
    flex: 1;
    padding: 12px 20px;
    border: none;
    outline: none;
    font-size: 16px;
    background: transparent;
}

.search-field::placeholder {
    color: #999;
}

.search-submit {
    padding: 12px 20px;
    border: none;
    background: var(--primary-color);
    color: white;
    cursor: pointer;
    transition: background 0.3s ease;
}

.search-submit:hover {
    background: var(--primary-color);
    opacity: 0.9;
}

.search-icon {
    font-size: 16px;
}

.screen-reader-text {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

@media (max-width: 768px) {
    .search-form {
        max-width: 100%;
    }
    
    .search-field {
        font-size: 16px; /* Prevent zoom on iOS */
    }
}
</style>

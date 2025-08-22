<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php wp_title('|', true, 'right'); ?><?php bloginfo('name'); ?></title>
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<header class="site-header">
    <div class="container">
        <div class="header-content">
            <a href="<?php echo home_url(); ?>" class="logo">💖 Heartbeat</a>
            
            <nav class="main-nav">
                <ul>
                    <li><a href="<?php echo home_url(); ?>" <?php if(is_home()) echo 'class="active"'; ?>>首页</a></li>
                    <li><a href="<?php echo home_url('/photo-gallery'); ?>" <?php if(is_page('photo-gallery')) echo 'class="active"'; ?>>合照集</a></li>
                    <li><a href="<?php echo home_url('/future-plans'); ?>" <?php if(is_page('future-plans')) echo 'class="active"'; ?>>未来计划</a></li>
                    <li><a href="<?php echo home_url('/whisper'); ?>" <?php if(is_page('whisper')) echo 'class="active"'; ?>>悄悄话</a></li>
                </ul>
            </nav>
            
            <div class="search-bar">
                <form role="search" method="get" action="<?php echo home_url('/'); ?>">
                    <input type="search" placeholder="搜索回忆..." value="<?php echo get_search_query(); ?>" name="s" />
                    <button type="submit">🔍</button>
                </form>
            </div>
        </div>
    </div>
</header>

<style>
.search-bar {
    position: relative;
}

.search-bar input {
    padding: 8px 40px 8px 15px;
    border: none;
    border-radius: 20px;
    background: rgba(255,255,255,0.1);
    color: white;
    width: 200px;
    transition: all 0.3s ease;
}

.search-bar input:focus {
    outline: none;
    background: rgba(255,255,255,0.2);
    width: 250px;
}

.search-bar input::placeholder {
    color: rgba(255,255,255,0.7);
}

.search-bar button {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 5px;
}

@media (max-width: 768px) {
    .search-bar {
        margin-top: 1rem;
    }
    
    .search-bar input {
        width: 100%;
    }
}
</style>

<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
header('X-Frame-Options: SAMEORIGIN');
?>
<html <?php language_attributes(); ?>>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="profile" href="https://gmpg.org/xfn/11">

<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
    <?php wp_body_open(); ?>
    <header class="site-header no-select" role="banner">
        <?php if (false): ?>
            <div class="site-branding">
                <a href="<?= esc_url(home_url('/')); ?>">
                    <div class="site-title-logo">
                        <img alt="<?= esc_attr(get_bloginfo('name')); ?>"
                            src="<?= esc_url(get_theme_mod('custom_logo')); ?>"
                            width="auto" height="auto"
                            loading="eager"
                            decoding="async"
                            fetchpriority="high">
                    </div>
                    <div class="site-title">
                        <?= esc_html(get_bloginfo('name')); ?>
                    </div>
                </a>
            </div>
        <?php endif; ?>
        <div class="nav-search-wrapper">
            <!-- Nav menu -->
            <nav>
                <?php
                wp_nav_menu([
                    'depth' => 2,
                    'theme_location' => 'primary',
                    'container' => false
                ]);
                ?>
            </nav>

            <!-- Search and background switch -->
            <div class="nav-search-divider"></div>

            <div class="searchbox js-toggle-search">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <span class="screen-reader-text">
                    <?php esc_html_e('Search', 'heartbeat'); ?>
                </span>
            </div>
        </div>

        <!-- User Menu Section -->
        <div class="user-menu-wrapper">
            <?php header_user_menu(); ?>
        </div>


    </header>
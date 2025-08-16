<?php

show_admin_bar(false);


function header_user_menu()
{
    global $current_user;
    wp_get_current_user();
    if (is_user_logged_in()) {
?>
        <div class="header-user-avatar">
            <img alt="header_user_avatar" src="<?php echo get_avatar_url($current_user->ID,  [64]); ?>" width="35" height="35">
            <div class="header-user-menu">
                <div class="header-user-name">
                    <?php _e("Signed in as", "heartbeat") ?>
                    <div class="header-user-name-u"><?php echo $current_user->display_name; ?></div>
                </div>
                <div class="user-menu-option">
                    <?php if (current_user_can('manage_options')) { ?>
                        <a href="<?php bloginfo('url'); ?>/wp-admin/" target="_blank"><?php _e('Dashboard', 'heartbeat')/*管理中心*/ ?></a>
                        <a href="<?php bloginfo('url'); ?>/wp-admin/post-new.php" target="_blank"><?php _e('New post', 'heartbeat')/*撰写文章*/ ?></a>
                    <?php } ?>
                    <a href="<?php bloginfo('url'); ?>/wp-admin/profile.php" target="_blank"><?php _e('Profile', 'heartbeat')/*个人资料*/ ?></a>
                    <a href="<?php echo wp_logout_url(get_bloginfo('url')); ?>" target="_top" data-no-pjax><?php _e('Sign out', 'heartbeat')/*退出登录*/ ?></a>
                </div>
            </div>
        </div>
    <?php
    } else {
        global $wp;
        $login_url = wp_login_url(add_query_arg($wp->query_vars, home_url($wp->request)));
    ?>
        <div class="header-user-avatar">
            <a href="<?= $login_url ?>">
                <i class="fa-solid fa-circle-user"></i>
            </a>
            <div class="header-user-menu">
                <div class="header-user-name no-logged">
                    <a id="login-link" href="<?= $login_url ?>" data-no-pjax style="font-weight:bold;text-decoration:none"><?php _e('Log in', 'heartbeat')/*登录*/ ?></a>
                </div>
            </div>
        </div>
<?php
    }
}
?>
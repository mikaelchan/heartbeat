<?php
// Heartbeat Theme Functions

// Theme Setup
function heartbeat_theme_setup() {
    show_admin_bar(false);
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
    add_theme_support('custom-logo');
    
    // Register navigation menus
    register_nav_menus(array(
        'primary' => '主导航菜单',
    ));
}
add_action('after_setup_theme', 'heartbeat_theme_setup');

// Enqueue styles and scripts
function heartbeat_scripts() {
    wp_enqueue_style('heartbeat-style', get_stylesheet_uri());
    wp_enqueue_script('heartbeat-script', get_template_directory_uri() . '/js/heartbeat.js', array('jquery'), '1.0', true);
    
    // Localize script for AJAX
    wp_localize_script('heartbeat-script', 'heartbeat_ajax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('heartbeat_nonce')
    ));
}
add_action('wp_enqueue_scripts', 'heartbeat_scripts');

// Create custom database tables on theme activation
function heartbeat_create_tables() {
    global $wpdb;
    
    $charset_collate = $wpdb->get_charset_collate();
    
    // Love timeline table
    $table_timeline = $wpdb->prefix . 'heartbeat_timeline';
    $sql_timeline = "CREATE TABLE $table_timeline (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        event_date date NOT NULL,
        event_type varchar(50) NOT NULL,
        title varchar(255) NOT NULL,
        description text,
        image_url varchar(500),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    
    // Moods table
    $table_moods = $wpdb->prefix . 'heartbeat_moods';
    $sql_moods = "CREATE TABLE $table_moods (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        mood_date date NOT NULL,
        mood_text text NOT NULL,
        mood_rating int(1) DEFAULT 5,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    
    // Future plans table
    $table_plans = $wpdb->prefix . 'heartbeat_plans';
    $sql_plans = "CREATE TABLE $table_plans (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        plan_title varchar(255) NOT NULL,
        plan_description text,
        target_date date,
        status varchar(20) DEFAULT 'pending',
        progress int(3) DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    
    // Photos table
    $table_photos = $wpdb->prefix . 'heartbeat_photos';
    $sql_photos = "CREATE TABLE $table_photos (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        photo_url varchar(500) NOT NULL,
        caption text,
        photo_date date NOT NULL,
        category varchar(50) DEFAULT 'general',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    
    // Messages table for whisper page
    $table_messages = $wpdb->prefix . 'heartbeat_messages';
    $sql_messages = "CREATE TABLE $table_messages (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        sender varchar(50) NOT NULL,
        message text NOT NULL,
        message_date datetime DEFAULT CURRENT_TIMESTAMP,
        is_read boolean DEFAULT false,
        PRIMARY KEY (id)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql_timeline);
    dbDelta($sql_moods);
    dbDelta($sql_plans);
    dbDelta($sql_photos);
    dbDelta($sql_messages);
    
    // Insert initial data
    heartbeat_insert_initial_data();
    
    // Create required pages
    heartbeat_create_pages();
}

// Insert initial sample data
function heartbeat_insert_initial_data() {
    global $wpdb;
    
    // Set relationship start date (you can modify this)
    $start_date = '2023-01-14'; // Example: Valentine's Day 2023
    update_option('heartbeat_start_date', $start_date);
    
    // Insert sample timeline events
    $timeline_table = $wpdb->prefix . 'heartbeat_timeline';
    $wpdb->insert($timeline_table, array(
        'event_date' => $start_date,
        'event_type' => 'milestone',
        'title' => '我们在一起了',
        'description' => '这是我们爱情故事的开始'
    ));
    
    // Insert sample mood
    $moods_table = $wpdb->prefix . 'heartbeat_moods';
    $wpdb->insert($moods_table, array(
        'mood_date' => date('Y-m-d'),
        'mood_text' => '今天心情很好，想念你 💕',
        'mood_rating' => 5
    ));
    
    // Insert sample future plan
    $plans_table = $wpdb->prefix . 'heartbeat_plans';
    $wpdb->insert($plans_table, array(
        'plan_title' => '一起旅行',
        'plan_description' => '计划去一个美丽的地方度假',
        'target_date' => date('Y-m-d', strtotime('+30 days')),
        'status' => 'planning',
        'progress' => 20
    ));
}

// Create required pages for the theme
function heartbeat_create_pages() {
    // Define pages to create
    $pages = array(
        array(
            'title' => '照片集',
            'slug' => 'photo-gallery',
            'content' => '这是我们的照片集页面，记录着美好的回忆。'
        ),
        array(
            'title' => '未来计划',
            'slug' => 'future-plans',
            'content' => '这是我们的未来计划页面，规划着美好的未来。'
        ),
        array(
            'title' => '悄悄话',
            'slug' => 'whisper',
            'content' => '这是我们的悄悄话页面，分享着彼此的心声。'
        )
    );
    
    foreach ($pages as $page_data) {
        // Check if page already exists
        $existing_page = get_page_by_path($page_data['slug']);
        
        if (!$existing_page) {
            // Create the page
            $page_id = wp_insert_post(array(
                'post_title' => $page_data['title'],
                'post_name' => $page_data['slug'],
                'post_content' => $page_data['content'],
                'post_status' => 'publish',
                'post_type' => 'page',
                'post_author' => 1
            ));
            
            if ($page_id && !is_wp_error($page_id)) {
                // Set page template if needed
                update_post_meta($page_id, '_wp_page_template', 'page-' . $page_data['slug'] . '.php');
            }
        }
    }
}

// Include customizer, admin settings, and setup wizard
require_once get_template_directory() . '/inc/customizer.php';
require_once get_template_directory() . '/inc/admin-settings.php';
require_once get_template_directory() . '/inc/setup-wizard.php';

// Activate theme hook
add_action('after_switch_theme', 'heartbeat_create_tables');

// Add admin action to create pages manually
function heartbeat_create_pages_manually() {
    if (current_user_can('manage_options')) {
        heartbeat_create_pages();
        wp_redirect(admin_url('themes.php?page_created=1'));
        exit;
    }
}
add_action('admin_action_create_heartbeat_pages', 'heartbeat_create_pages_manually');

// Helper Functions

// Get days together
function get_days_together() {
    $start_date = get_theme_mod('heartbeat_start_date', get_option('heartbeat_start_date', '2023-01-14'));
    $start = new DateTime($start_date);
    $now = new DateTime();
    $diff = $now->diff($start);
    return $diff->days;
}

// Get current time display
function get_current_time_display() {
    $now = new DateTime();
    return $now->format('G') . '小时' . $now->format('i') . '分';
}

// Get recent photo
function get_recent_photo() {
    global $wpdb;
    $table = $wpdb->prefix . 'heartbeat_photos';
    $photo = $wpdb->get_row("SELECT * FROM $table ORDER BY photo_date DESC LIMIT 1", ARRAY_A);
    
    if ($photo) {
        return array(
            'url' => $photo['photo_url'],
            'date' => date('Y年m月d日', strtotime($photo['photo_date']))
        );
    }
    
    // Return placeholder if no photos
    return array(
        'url' => get_template_directory_uri() . '/images/placeholder-couple.jpg',
        'date' => '等待上传照片'
    );
}

// Get recent moods
function get_recent_moods() {
    global $wpdb;
    $table = $wpdb->prefix . 'heartbeat_moods';
    $moods = $wpdb->get_results("SELECT * FROM $table ORDER BY mood_date DESC LIMIT 3", ARRAY_A);
    
    $output = '';
    foreach ($moods as $mood) {
        $date = date('m月d日', strtotime($mood['mood_date']));
        $output .= "<div class='mood-item'>";
        $output .= "<span class='mood-date'>$date</span>";
        $output .= "<p class='mood-text'>" . esc_html($mood['mood_text']) . "</p>";
        $output .= "</div>";
    }
    
    return $output ?: '<p>还没有心情记录</p>';
}

// Get next anniversary
function get_next_anniversary_days() {
    $start_date = get_option('heartbeat_start_date', date('Y-m-d'));
    $start = new DateTime($start_date);
    $now = new DateTime();
    
    // Calculate next monthly anniversary
    $next_month = clone $now;
    $next_month->modify('first day of next month');
    $next_month->setDate($next_month->format('Y'), $next_month->format('m'), $start->format('d'));
    
    if ($next_month <= $now) {
        $next_month->modify('+1 month');
    }
    
    $diff = $next_month->diff($now);
    return $diff->days;
}

function get_next_anniversary_name() {
    return '月度纪念日';
}

// Get total memories count
function get_total_memories() {
    global $wpdb;
    $photos_table = $wpdb->prefix . 'heartbeat_photos';
    $timeline_table = $wpdb->prefix . 'heartbeat_timeline';
    
    $photos_count = $wpdb->get_var("SELECT COUNT(*) FROM $photos_table");
    $timeline_count = $wpdb->get_var("SELECT COUNT(*) FROM $timeline_table");
    
    return $photos_count + $timeline_count;
}

// Get future plans count
function get_future_plans_count() {
    global $wpdb;
    $table = $wpdb->prefix . 'heartbeat_plans';
    return $wpdb->get_var("SELECT COUNT(*) FROM $table WHERE status != 'completed'");
}

// AJAX handler for saving mood
function save_mood_handler() {
    check_ajax_referer('save_mood', 'nonce');
    
    $mood = sanitize_textarea_field($_POST['mood']);
    
    if (empty($mood)) {
        wp_die();
    }
    
    global $wpdb;
    $table = $wpdb->prefix . 'heartbeat_moods';
    
    $result = $wpdb->insert($table, array(
        'mood_date' => date('Y-m-d'),
        'mood_text' => $mood,
        'mood_rating' => 5
    ));
    
    if ($result) {
        wp_send_json_success('心情保存成功');
    } else {
        wp_send_json_error('保存失败');
    }
}
add_action('wp_ajax_save_mood', 'save_mood_handler');
add_action('wp_ajax_nopriv_save_mood', 'save_mood_handler');

// AJAX handler for sending whisper
function send_whisper_handler() {
    check_ajax_referer('heartbeat_nonce', 'nonce');
    
    $message = sanitize_textarea_field($_POST['message']);
    $sender = sanitize_text_field($_POST['sender']);
    
    if (empty($message) || empty($sender)) {
        wp_send_json_error('悄悄话不能为空');
    }
    
    global $wpdb;
    $table = $wpdb->prefix . 'heartbeat_messages';
    
    $result = $wpdb->insert($table, array(
        'sender' => $sender,
        'message' => $message,
        'message_date' => current_time('mysql')
    ));
    
    if ($result) {
        wp_send_json_success('悄悄话发布成功');
    } else {
        wp_send_json_error('发布失败');
    }
}
add_action('wp_ajax_send_whisper', 'send_whisper_handler');
add_action('wp_ajax_nopriv_send_whisper', 'send_whisper_handler');
?>

<?php
// Heartbeat Admin Settings Page

// Add admin menu
function heartbeat_admin_menu() {
    add_theme_page(
        'Heartbeat 设置',
        'Heartbeat 设置',
        'manage_options',
        'heartbeat-settings',
        'heartbeat_admin_page'
    );
}
add_action('admin_menu', 'heartbeat_admin_menu');

// Admin page content
function heartbeat_admin_page() {
    if (isset($_POST['submit'])) {
        heartbeat_save_settings();
        echo '<div class="notice notice-success"><p>设置已保存！</p></div>';
    }
    
    $start_date = get_option('heartbeat_start_date', '2023-01-14');
    $name_1 = get_option('heartbeat_name_1', '小人皮');
    $name_2 = get_option('heartbeat_name_2', '宝贝');
    ?>
    
    <div class="wrap">
        <h1>💖 Heartbeat 主题设置</h1>
        
        <div class="heartbeat-admin-container">
            <div class="heartbeat-admin-main">
                <form method="post" action="">
                    <?php wp_nonce_field('heartbeat_settings', 'heartbeat_nonce'); ?>
                    
                    <div class="heartbeat-section">
                        <h2>基本设置</h2>
                        <table class="form-table">
                            <tr>
                                <th scope="row">恋爱开始日期</th>
                                <td>
                                    <input type="date" name="heartbeat_start_date" value="<?php echo esc_attr($start_date); ?>" />
                                    <p class="description">设置你们在一起的开始日期</p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">第一个人昵称</th>
                                <td>
                                    <input type="text" name="heartbeat_name_1" value="<?php echo esc_attr($name_1); ?>" />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">第二个人昵称</th>
                                <td>
                                    <input type="text" name="heartbeat_name_2" value="<?php echo esc_attr($name_2); ?>" />
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="heartbeat-section">
                        <h2>数据管理</h2>
                        <table class="form-table">
                            <tr>
                                <th scope="row">数据统计</th>
                                <td>
                                    <p><strong>在一起天数:</strong> <?php echo get_days_together(); ?> 天</p>
                                    <p><strong>照片数量:</strong> <?php echo heartbeat_get_photos_count(); ?> 张</p>
                                    <p><strong>心情记录:</strong> <?php echo heartbeat_get_moods_count(); ?> 条</p>
                                    <p><strong>未来计划:</strong> <?php echo heartbeat_get_plans_count(); ?> 项</p>
                                    <p><strong>聊天消息:</strong> <?php echo heartbeat_get_messages_count(); ?> 条</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="heartbeat-section">
                        <h2>快速操作</h2>
                        <p>
                            <a href="<?php echo admin_url('admin.php?page=heartbeat-settings&action=reset_data'); ?>" 
                               class="button button-secondary" 
                               onclick="return confirm('确定要重置所有数据吗？此操作不可恢复！')">
                                重置所有数据
                            </a>
                            <a href="<?php echo admin_url('admin.php?page=heartbeat-settings&action=export_data'); ?>" 
                               class="button button-secondary">
                                导出数据
                            </a>
                        </p>
                    </div>
                    
                    <?php submit_button('保存设置'); ?>
                </form>
            </div>
            
            <div class="heartbeat-admin-sidebar">
                <div class="heartbeat-widget">
                    <h3>💕 关于 Heartbeat</h3>
                    <p>Heartbeat 是一个专为情侣设计的WordPress主题，帮助你们记录美好的恋爱时光。</p>
                    <p><strong>版本:</strong> 1.0</p>
                    <p><strong>开发者:</strong> Michael</p>
                </div>
                
                <div class="heartbeat-widget">
                    <h3>🎯 快速链接</h3>
                    <ul>
                        <li><a href="<?php echo home_url(); ?>">查看首页</a></li>
                        <li><a href="<?php echo home_url('/photo-gallery'); ?>">管理照片</a></li>
                        <li><a href="<?php echo home_url('/future-plans'); ?>">查看计划</a></li>
                        <li><a href="<?php echo home_url('/whisper'); ?>">悄悄话</a></li>
                    </ul>
                </div>
                
                <div class="heartbeat-widget">
                    <h3>💡 使用提示</h3>
                    <ul>
                        <li>定期备份你们的数据</li>
                        <li>上传高质量的照片</li>
                        <li>记录每天的心情</li>
                        <li>设置有意义的目标</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    
    <style>
    .heartbeat-admin-container {
        display: flex;
        gap: 20px;
        margin-top: 20px;
    }
    
    .heartbeat-admin-main {
        flex: 2;
    }
    
    .heartbeat-admin-sidebar {
        flex: 1;
    }
    
    .heartbeat-section {
        background: white;
        padding: 20px;
        margin-bottom: 20px;
        border: 1px solid #ccd0d4;
        border-radius: 5px;
    }
    
    .heartbeat-section h2 {
        margin-top: 0;
        color: #ff6b9d;
    }
    
    .heartbeat-widget {
        background: white;
        padding: 15px;
        margin-bottom: 15px;
        border: 1px solid #ccd0d4;
        border-radius: 5px;
    }
    
    .heartbeat-widget h3 {
        margin-top: 0;
        color: #4ecdc4;
    }
    
    .heartbeat-widget ul {
        margin: 0;
        padding-left: 20px;
    }
    
    .heartbeat-widget li {
        margin-bottom: 5px;
    }
    </style>
    <?php
}

// Save settings
function heartbeat_save_settings() {
    if (!wp_verify_nonce($_POST['heartbeat_nonce'], 'heartbeat_settings')) {
        return;
    }
    
    if (!current_user_can('manage_options')) {
        return;
    }
    
    update_option('heartbeat_start_date', sanitize_text_field($_POST['heartbeat_start_date']));
    update_option('heartbeat_name_1', sanitize_text_field($_POST['heartbeat_name_1']));
    update_option('heartbeat_name_2', sanitize_text_field($_POST['heartbeat_name_2']));
}

// Handle admin actions
function heartbeat_handle_admin_actions() {
    if (!isset($_GET['page']) || $_GET['page'] !== 'heartbeat-settings') {
        return;
    }
    
    if (!isset($_GET['action'])) {
        return;
    }
    
    if (!current_user_can('manage_options')) {
        return;
    }
    
    switch ($_GET['action']) {
        case 'reset_data':
            heartbeat_reset_all_data();
            wp_redirect(admin_url('admin.php?page=heartbeat-settings&message=reset'));
            exit;
            
        case 'export_data':
            heartbeat_export_data();
            break;
    }
}
add_action('admin_init', 'heartbeat_handle_admin_actions');

// Reset all data
function heartbeat_reset_all_data() {
    global $wpdb;
    
    $tables = array(
        $wpdb->prefix . 'heartbeat_timeline',
        $wpdb->prefix . 'heartbeat_moods',
        $wpdb->prefix . 'heartbeat_plans',
        $wpdb->prefix . 'heartbeat_photos',
        $wpdb->prefix . 'heartbeat_messages'
    );
    
    foreach ($tables as $table) {
        $wpdb->query("TRUNCATE TABLE $table");
    }
    
    // Re-insert initial data
    heartbeat_insert_initial_data();
}

// Export data
function heartbeat_export_data() {
    global $wpdb;
    
    $data = array();
    
    // Export all tables
    $tables = array(
        'timeline' => $wpdb->prefix . 'heartbeat_timeline',
        'moods' => $wpdb->prefix . 'heartbeat_moods',
        'plans' => $wpdb->prefix . 'heartbeat_plans',
        'photos' => $wpdb->prefix . 'heartbeat_photos',
        'messages' => $wpdb->prefix . 'heartbeat_messages'
    );
    
    foreach ($tables as $key => $table) {
        $data[$key] = $wpdb->get_results("SELECT * FROM $table", ARRAY_A);
    }
    
    // Add settings
    $data['settings'] = array(
        'start_date' => get_option('heartbeat_start_date'),
        'name_1' => get_option('heartbeat_name_1'),
        'name_2' => get_option('heartbeat_name_2'),
        'export_date' => current_time('mysql')
    );
    
    $filename = 'heartbeat-data-' . date('Y-m-d-H-i-s') . '.json';
    
    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Helper functions for data counts
function heartbeat_get_photos_count() {
    global $wpdb;
    $table = $wpdb->prefix . 'heartbeat_photos';
    return $wpdb->get_var("SELECT COUNT(*) FROM $table");
}

function heartbeat_get_moods_count() {
    global $wpdb;
    $table = $wpdb->prefix . 'heartbeat_moods';
    return $wpdb->get_var("SELECT COUNT(*) FROM $table");
}

function heartbeat_get_plans_count() {
    global $wpdb;
    $table = $wpdb->prefix . 'heartbeat_plans';
    return $wpdb->get_var("SELECT COUNT(*) FROM $table");
}

function heartbeat_get_messages_count() {
    global $wpdb;
    $table = $wpdb->prefix . 'heartbeat_messages';
    return $wpdb->get_var("SELECT COUNT(*) FROM $table");
}
?>

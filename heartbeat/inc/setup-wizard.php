<?php
// Heartbeat Theme Setup Wizard

// Add setup wizard to admin menu
function heartbeat_setup_wizard_menu() {
    if (get_option('heartbeat_setup_complete')) {
        return;
    }
    
    add_dashboard_page(
        'Heartbeat 设置向导',
        'Heartbeat 设置向导',
        'manage_options',
        'heartbeat-setup',
        'heartbeat_setup_wizard_page'
    );
}
add_action('admin_menu', 'heartbeat_setup_wizard_menu');

// Setup wizard page
function heartbeat_setup_wizard_page() {
    $step = isset($_POST['current_step']) ? intval($_POST['current_step']) : 1;
    
    if (isset($_POST['submit_step'])) {
        heartbeat_process_setup_step($step);
        $step++;
        if ($step > 4) {
            update_option('heartbeat_setup_complete', true);
            wp_redirect(admin_url('admin.php?page=heartbeat-settings&setup=complete'));
            exit;
        }
    }
    ?>
    
    <div class="wrap heartbeat-setup">
        <h1>💖 欢迎使用 Heartbeat 主题</h1>
        <p class="description">让我们一起设置你们的爱情主题！</p>
        
        <div class="heartbeat-setup-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: <?php echo ($step / 4) * 100; ?>%"></div>
            </div>
            <p>步骤 <?php echo $step; ?> / 4</p>
        </div>
        
        <div class="heartbeat-setup-content">
            <?php
            switch ($step) {
                case 1:
                    heartbeat_setup_step_1();
                    break;
                case 2:
                    heartbeat_setup_step_2();
                    break;
                case 3:
                    heartbeat_setup_step_3();
                    break;
                case 4:
                    heartbeat_setup_step_4();
                    break;
            }
            ?>
        </div>
    </div>
    
    <style>
    .heartbeat-setup {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .heartbeat-setup h1 {
        text-align: center;
        color: #ff6b9d;
        margin-bottom: 10px;
    }
    
    .heartbeat-setup .description {
        text-align: center;
        font-size: 16px;
        margin-bottom: 30px;
    }
    
    .heartbeat-setup-progress {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        margin-bottom: 30px;
        text-align: center;
    }
    
    .progress-bar {
        width: 100%;
        height: 10px;
        background: #eee;
        border-radius: 5px;
        overflow: hidden;
        margin-bottom: 10px;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(135deg, #ff6b9d, #4ecdc4);
        transition: width 0.3s ease;
    }
    
    .heartbeat-setup-content {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .setup-step h2 {
        color: #4ecdc4;
        margin-bottom: 20px;
    }
    
    .form-table th {
        width: 200px;
    }
    
    .setup-actions {
        text-align: center;
        margin-top: 30px;
    }
    
    .button-primary {
        background: #ff6b9d !important;
        border-color: #ff6b9d !important;
        padding: 10px 30px !important;
        font-size: 16px !important;
    }
    
    .sample-preview {
        border: 2px solid #eee;
        border-radius: 10px;
        padding: 15px;
        margin: 15px 0;
        background: #f9f9f9;
    }
    
    .color-preview {
        display: inline-block;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 10px;
        vertical-align: middle;
    }
    </style>
    <?php
}

// Step 1: Basic Information
function heartbeat_setup_step_1() {
    ?>
    <div class="setup-step">
        <h2>📝 基本信息</h2>
        <p>首先，让我们设置一些基本信息来个性化你们的主题。</p>
        
        <form method="post">
            <input type="hidden" name="current_step" value="1">
            <table class="form-table">
                <tr>
                    <th scope="row">恋爱开始日期</th>
                    <td>
                        <input type="date" name="start_date" value="<?php echo date('Y-m-d'); ?>" required />
                        <p class="description">选择你们在一起的开始日期</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">第一个人昵称</th>
                    <td>
                        <input type="text" name="name_1" value="小人皮" required />
                        <p class="description">可以是真名或昵称</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">第二个人昵称</th>
                    <td>
                        <input type="text" name="name_2" value="宝贝" required />
                        <p class="description">可以是真名或昵称</p>
                    </td>
                </tr>
            </table>
            
            <div class="setup-actions">
                <input type="submit" name="submit_step" class="button button-primary" value="下一步 →" />
            </div>
        </form>
    </div>
    <?php
}

// Step 2: Color Scheme
function heartbeat_setup_step_2() {
    ?>
    <div class="setup-step">
        <h2>🎨 颜色主题</h2>
        <p>选择一个你们喜欢的颜色搭配。</p>
        
        <form method="post">
            <input type="hidden" name="current_step" value="2">
            <div class="color-schemes">
                <label>
                    <input type="radio" name="color_scheme" value="default" checked />
                    <span class="color-preview" style="background: #ff6b9d;"></span>
                    <span class="color-preview" style="background: #4ecdc4;"></span>
                    默认配色（粉色 + 青色）
                </label><br><br>
                
                <label>
                    <input type="radio" name="color_scheme" value="romantic" />
                    <span class="color-preview" style="background: #ff69b4;"></span>
                    <span class="color-preview" style="background: #ffc0cb;"></span>
                    浪漫配色（热粉 + 浅粉）
                </label><br><br>
                
                <label>
                    <input type="radio" name="color_scheme" value="elegant" />
                    <span class="color-preview" style="background: #9b59b6;"></span>
                    <span class="color-preview" style="background: #3498db;"></span>
                    优雅配色（紫色 + 蓝色）
                </label><br><br>
                
                <label>
                    <input type="radio" name="color_scheme" value="warm" />
                    <span class="color-preview" style="background: #e74c3c;"></span>
                    <span class="color-preview" style="background: #f39c12;"></span>
                    温暖配色（红色 + 橙色）
                </label>
            </div>
            
            <div class="setup-actions">
                <input type="submit" name="submit_step" class="button button-primary" value="下一步 →" />
            </div>
        </form>
    </div>
    <?php
}

// Step 3: Features
function heartbeat_setup_step_3() {
    ?>
    <div class="setup-step">
        <h2>⚙️ 功能设置</h2>
        <p>选择你想要启用的功能。</p>
        
        <form method="post">
            <input type="hidden" name="current_step" value="3">
            <table class="form-table">
                <tr>
                    <th scope="row">心情记录</th>
                    <td>
                        <label>
                            <input type="checkbox" name="enable_mood" value="1" checked />
                            启用每日心情记录功能
                        </label>
                        <p class="description">记录每天的心情和感受</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">照片上传</th>
                    <td>
                        <label>
                            <input type="checkbox" name="enable_upload" value="1" checked />
                            启用照片上传功能
                        </label>
                        <p class="description">允许上传和管理照片</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">悄悄话</th>
                    <td>
                        <label>
                            <input type="checkbox" name="enable_chat" value="1" checked />
                            启用悄悄话聊天功能
                        </label>
                        <p class="description">私密的聊天空间</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">未来计划</th>
                    <td>
                        <label>
                            <input type="checkbox" name="enable_plans" value="1" checked />
                            启用未来计划功能
                        </label>
                        <p class="description">设置和追踪共同目标</p>
                    </td>
                </tr>
            </table>
            
            <div class="setup-actions">
                <input type="submit" name="submit_step" class="button button-primary" value="下一步 →" />
            </div>
        </form>
    </div>
    <?php
}

// Step 4: Sample Data
function heartbeat_setup_step_4() {
    ?>
    <div class="setup-step">
        <h2>📊 示例数据</h2>
        <p>是否要导入一些示例数据来快速体验主题功能？</p>
        
        <div class="sample-preview">
            <h4>示例数据包括：</h4>
            <ul>
                <li>💕 几条示例心情记录</li>
                <li>📸 示例照片（占位图）</li>
                <li>🎯 示例未来计划</li>
                <li>💬 示例聊天消息</li>
                <li>📅 示例重要日期</li>
            </ul>
        </div>
        
        <form method="post">
            <input type="hidden" name="current_step" value="4">
            <table class="form-table">
                <tr>
                    <th scope="row">导入示例数据</th>
                    <td>
                        <label>
                            <input type="radio" name="import_sample" value="yes" checked />
                            是的，导入示例数据（推荐）
                        </label><br>
                        <label>
                            <input type="radio" name="import_sample" value="no" />
                            不，我想从空白开始
                        </label>
                        <p class="description">你可以随时在后台删除示例数据</p>
                    </td>
                </tr>
            </table>
            
            <div class="setup-actions">
                <input type="submit" name="submit_step" class="button button-primary" value="完成设置 ✨" />
            </div>
        </form>
    </div>
    <?php
}

// Process setup steps
function heartbeat_process_setup_step($step) {
    // Only process when the setup form is submitted
    if (empty($_POST['submit_step'])) {
        return;
    }

    // Verify nonce if provided; if missing or invalid, abort processing for safety
    if (isset($_POST['_wpnonce'])) {
        if (!wp_verify_nonce(sanitize_text_field($_POST['_wpnonce']), 'heartbeat_setup_step_' . $step)) {
            return;
        }
    } else {
        // No nonce supplied — do not proceed
        return;
    }
    
    switch ($step) {
        case 1:
            $start_date = isset($_POST['start_date']) ? sanitize_text_field($_POST['start_date']) : '';
            $name_1 = isset($_POST['name_1']) ? sanitize_text_field($_POST['name_1']) : '';
            $name_2 = isset($_POST['name_2']) ? sanitize_text_field($_POST['name_2']) : '';

            if ($start_date !== '') {
                update_option('heartbeat_start_date', $start_date);
            }
            if ($name_1 !== '') {
                update_option('heartbeat_name_1', $name_1);
            }
            if ($name_2 !== '') {
                update_option('heartbeat_name_2', $name_2);
            }
            break;
            
        case 2:
            $color_schemes = array(
                'default' => array('primary' => '#ff6b9d', 'secondary' => '#4ecdc4'),
                'romantic' => array('primary' => '#ff69b4', 'secondary' => '#ffc0cb'),
                'elegant' => array('primary' => '#9b59b6', 'secondary' => '#3498db'),
                'warm' => array('primary' => '#e74c3c', 'secondary' => '#f39c12')
            );
            
            $scheme = isset($_POST['color_scheme']) ? sanitize_text_field($_POST['color_scheme']) : 'default';
            if (isset($color_schemes[$scheme])) {
                set_theme_mod('heartbeat_primary_color', $color_schemes[$scheme]['primary']);
                set_theme_mod('heartbeat_secondary_color', $color_schemes[$scheme]['secondary']);
            }
            break;
            
        case 3:
            // Use boolean values for enabled features
            set_theme_mod('heartbeat_enable_mood', (bool) (isset($_POST['enable_mood']) && $_POST['enable_mood']));
            set_theme_mod('heartbeat_enable_upload', (bool) (isset($_POST['enable_upload']) && $_POST['enable_upload']));
            set_theme_mod('heartbeat_enable_chat', (bool) (isset($_POST['enable_chat']) && $_POST['enable_chat']));
            set_theme_mod('heartbeat_enable_plans', (bool) (isset($_POST['enable_plans']) && $_POST['enable_plans']));
            break;
            
        case 4:
            $import_sample = isset($_POST['import_sample']) ? sanitize_text_field($_POST['import_sample']) : 'no';
            if ($import_sample === 'yes') {
                heartbeat_import_sample_data();
            }
            break;
    }
}

// Import sample data
function heartbeat_import_sample_data() {
    global $wpdb;
    
    // Sample moods
    $moods_table = $wpdb->prefix . 'heartbeat_moods';
    $sample_moods = array(
        array('mood_date' => date('Y-m-d'), 'mood_text' => '今天心情很好，想念你 💕', 'mood_rating' => 5),
        array('mood_date' => date('Y-m-d', strtotime('-1 day')), 'mood_text' => '和你一起看电影很开心', 'mood_rating' => 5),
        array('mood_date' => date('Y-m-d', strtotime('-2 days')), 'mood_text' => '期待周末的约会', 'mood_rating' => 4)
    );
    
    foreach ($sample_moods as $mood) {
        $wpdb->insert($moods_table, $mood);
    }
    
    // Sample plans
    $plans_table = $wpdb->prefix . 'heartbeat_plans';
    $sample_plans = array(
        array(
            'plan_title' => '学游泳',
            'plan_description' => '一起学会游泳，享受水中的乐趣',
            'target_date' => date('Y-m-d', strtotime('+60 days')),
            'status' => 'planning',
            'progress' => 30
        ),
        array(
            'plan_title' => '跨年旅行',
            'plan_description' => '计划一次浪漫的跨年旅行',
            'target_date' => date('Y-m-d', strtotime('+120 days')),
            'status' => 'planning',
            'progress' => 60
        )
    );
    
    foreach ($sample_plans as $plan) {
        $wpdb->insert($plans_table, $plan);
    }
    
    // Sample messages
    $messages_table = $wpdb->prefix . 'heartbeat_messages';
    $name_1 = get_option('heartbeat_name_1', '小人皮');
    $name_2 = get_option('heartbeat_name_2', '宝贝');
    
    $sample_messages = array(
        array('sender' => $name_1, 'message' => '今天想你了 💕', 'message_date' => current_time('mysql')),
        array('sender' => $name_2, 'message' => '我也想你呀 😘', 'message_date' => current_time('mysql')),
        array('sender' => $name_1, 'message' => '晚上一起看电影好不好？', 'message_date' => current_time('mysql')),
        array('sender' => $name_2, 'message' => '好呀！你想看什么？', 'message_date' => current_time('mysql'))
    );
    
    foreach ($sample_messages as $message) {
        $wpdb->insert($messages_table, $message);
    }
}

// Add setup notice
function heartbeat_setup_notice() {
    if (get_option('heartbeat_setup_complete')) {
        return;
    }
    
    $screen = get_current_screen();
    if ($screen->id === 'dashboard_page_heartbeat-setup') {
        return;
    }
    ?>
    <div class="notice notice-info is-dismissible">
        <p>
            <strong>💖 欢迎使用 Heartbeat 主题！</strong>
            <a href="<?php echo admin_url('admin.php?page=heartbeat-setup'); ?>">点击这里完成设置向导</a>
            来个性化你们的爱情主题。
        </p>
    </div>
    <?php
}
add_action('admin_notices', 'heartbeat_setup_notice');
?>

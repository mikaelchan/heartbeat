<?php
// Heartbeat Theme Customizer

function heartbeat_customizer_register($wp_customize) {
    
    // Add Heartbeat Panel
    $wp_customize->add_panel('heartbeat_panel', array(
        'title' => 'Heartbeat 设置',
        'description' => '自定义你们的爱情主题',
        'priority' => 30,
    ));
    
    // Relationship Settings Section
    $wp_customize->add_section('heartbeat_relationship', array(
        'title' => '恋爱设置',
        'panel' => 'heartbeat_panel',
        'priority' => 10,
    ));
    
    // Start Date Setting
    $wp_customize->add_setting('heartbeat_start_date', array(
        'default' => '2023-01-14',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    
    $wp_customize->add_control('heartbeat_start_date', array(
        'label' => '恋爱开始日期',
        'section' => 'heartbeat_relationship',
        'type' => 'date',
        'description' => '设置你们在一起的开始日期',
    ));
    
    // Couple Names
    $wp_customize->add_setting('heartbeat_name_1', array(
        'default' => '小人皮',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    
    $wp_customize->add_control('heartbeat_name_1', array(
        'label' => '第一个人的昵称',
        'section' => 'heartbeat_relationship',
        'type' => 'text',
    ));
    
    $wp_customize->add_setting('heartbeat_name_2', array(
        'default' => '宝贝',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    
    $wp_customize->add_control('heartbeat_name_2', array(
        'label' => '第二个人的昵称',
        'section' => 'heartbeat_relationship',
        'type' => 'text',
    ));
    
    // Anniversary Type
    $wp_customize->add_setting('heartbeat_anniversary_type', array(
        'default' => 'monthly',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    
    $wp_customize->add_control('heartbeat_anniversary_type', array(
        'label' => '纪念日类型',
        'section' => 'heartbeat_relationship',
        'type' => 'select',
        'choices' => array(
            'monthly' => '每月纪念日',
            'yearly' => '每年纪念日',
            'custom' => '自定义纪念日',
        ),
    ));
    
    // Colors Section
    $wp_customize->add_section('heartbeat_colors', array(
        'title' => '颜色设置',
        'panel' => 'heartbeat_panel',
        'priority' => 20,
    ));
    
    // Primary Color
    $wp_customize->add_setting('heartbeat_primary_color', array(
        'default' => '#ff6b9d',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'heartbeat_primary_color', array(
        'label' => '主要颜色',
        'section' => 'heartbeat_colors',
        'description' => '主题的主要颜色（粉色）',
    )));
    
    // Secondary Color
    $wp_customize->add_setting('heartbeat_secondary_color', array(
        'default' => '#4ecdc4',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'heartbeat_secondary_color', array(
        'label' => '次要颜色',
        'section' => 'heartbeat_colors',
        'description' => '主题的次要颜色（青色）',
    )));
    
    // Features Section
    $wp_customize->add_section('heartbeat_features', array(
        'title' => '功能设置',
        'panel' => 'heartbeat_panel',
        'priority' => 30,
    ));
    
    // Enable Mood Tracking
    $wp_customize->add_setting('heartbeat_enable_mood', array(
        'default' => true,
        'sanitize_callback' => 'wp_validate_boolean',
    ));
    
    $wp_customize->add_control('heartbeat_enable_mood', array(
        'label' => '启用心情记录',
        'section' => 'heartbeat_features',
        'type' => 'checkbox',
    ));
    
    // Enable Photo Upload
    $wp_customize->add_setting('heartbeat_enable_upload', array(
        'default' => true,
        'sanitize_callback' => 'wp_validate_boolean',
    ));
    
    $wp_customize->add_control('heartbeat_enable_upload', array(
        'label' => '启用照片上传',
        'section' => 'heartbeat_features',
        'type' => 'checkbox',
    ));
    
    // Enable Chat
    $wp_customize->add_setting('heartbeat_enable_chat', array(
        'default' => true,
        'sanitize_callback' => 'wp_validate_boolean',
    ));
    
    $wp_customize->add_control('heartbeat_enable_chat', array(
        'label' => '启用悄悄话功能',
        'section' => 'heartbeat_features',
        'type' => 'checkbox',
    ));
    
    // Privacy Section
    $wp_customize->add_section('heartbeat_privacy', array(
        'title' => '隐私设置',
        'panel' => 'heartbeat_panel',
        'priority' => 40,
    ));
    
    // Site Visibility
    $wp_customize->add_setting('heartbeat_site_visibility', array(
        'default' => 'private',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    
    $wp_customize->add_control('heartbeat_site_visibility', array(
        'label' => '网站可见性',
        'section' => 'heartbeat_privacy',
        'type' => 'select',
        'choices' => array(
            'public' => '公开访问',
            'private' => '仅限登录用户',
            'password' => '密码保护',
        ),
    ));
    
    // Password Protection
    $wp_customize->add_setting('heartbeat_site_password', array(
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    
    $wp_customize->add_control('heartbeat_site_password', array(
        'label' => '访问密码',
        'section' => 'heartbeat_privacy',
        'type' => 'password',
        'description' => '当选择密码保护时使用',
    ));
}
add_action('customize_register', 'heartbeat_customizer_register');

// Output custom CSS based on customizer settings
function heartbeat_customizer_css() {
    $primary_color = get_theme_mod('heartbeat_primary_color', '#ff6b9d');
    $secondary_color = get_theme_mod('heartbeat_secondary_color', '#4ecdc4');
    
    ?>
    <style type="text/css">
        :root {
            --primary-color: <?php echo esc_attr($primary_color); ?>;
            --secondary-color: <?php echo esc_attr($secondary_color); ?>;
            --accent-color: <?php echo esc_attr($secondary_color); ?>;
        }
        
        .btn-primary {
            background: <?php echo esc_attr($primary_color); ?> !important;
        }
        
        .btn-primary:hover {
            background: <?php echo esc_attr(heartbeat_darken_color($primary_color, 10)); ?> !important;
        }
        
        .main-nav a.active,
        .main-nav a:hover {
            background: <?php echo esc_attr($primary_color); ?> !important;
        }
        
        #days-together {
            color: <?php echo esc_attr($primary_color); ?> !important;
        }
        
        .goal-title,
        .countdown-number {
            color: <?php echo esc_attr($primary_color); ?> !important;
        }
        
        .anniversary-name {
            color: <?php echo esc_attr($secondary_color); ?> !important;
        }
    </style>
    <?php
}
add_action('wp_head', 'heartbeat_customizer_css');

// Helper function to darken colors
function heartbeat_darken_color($color, $percent) {
    $color = str_replace('#', '', $color);
    $r = hexdec(substr($color, 0, 2));
    $g = hexdec(substr($color, 2, 2));
    $b = hexdec(substr($color, 4, 2));
    
    $r = max(0, min(255, $r - ($r * $percent / 100)));
    $g = max(0, min(255, $g - ($g * $percent / 100)));
    $b = max(0, min(255, $b - ($b * $percent / 100)));
    
    return sprintf('#%02x%02x%02x', $r, $g, $b);
}
?>

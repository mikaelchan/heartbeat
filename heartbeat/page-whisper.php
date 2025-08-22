<?php get_header(); ?>

<main class="main-content">
    <div class="container">
        <!-- Page Header -->
        <div class="whisper-header">
            <h1>悄悄话页面</h1>
            <p>记录我们心中的秘密话语 💕</p>
        </div>

        <!-- Add New Whisper -->
        <div class="add-whisper-section card">
            <h3>写下新的悄悄话</h3>
            <form id="whisper-form">
                <div class="form-group">
                    <label>选择身份</label>
                    <div class="user-selection">
                        <label>
                            <input type="radio" name="sender" value="<?php echo get_option('heartbeat_name_1', '小人皮'); ?>" checked>
                            <span class="user-badge male"><?php echo get_option('heartbeat_name_1', '小人皮'); ?></span>
                        </label>
                        <label>
                            <input type="radio" name="sender" value="<?php echo get_option('heartbeat_name_2', '宝贝'); ?>">
                            <span class="user-badge female"><?php echo get_option('heartbeat_name_2', '宝贝'); ?></span>
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <textarea id="whisper-text" placeholder="写下你想说的悄悄话..." required></textarea>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">发布悄悄话</button>
                </div>
            </form>
        </div>

        <!-- Timeline Container -->
        <div class="timeline-container">
            <div class="timeline-line"></div>
            <?php echo get_whisper_timeline(); ?>
        </div>
    </div>
</main>

<style>
.whisper-header {
    text-align: center;
    margin-bottom: 3rem;
    padding: 3rem 0;
    background: var(--gradient-bg);
    color: white;
    border-radius: 20px;
}

.whisper-header h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.whisper-header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

.add-whisper-section {
    margin-bottom: 3rem;
}

.add-whisper-section h3 {
    color: var(--primary-color);
    margin-bottom: 1.5rem;
}

.user-selection {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.user-selection label {
    cursor: pointer;
}

.user-selection input[type="radio"] {
    display: none;
}

.user-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.user-badge.male {
    background: rgba(255, 107, 157, 0.1);
    color: var(--primary-color);
}

.user-badge.female {
    background: rgba(78, 205, 196, 0.1);
    color: var(--secondary-color);
}

.user-selection input[type="radio"]:checked + .user-badge.male {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.user-selection input[type="radio"]:checked + .user-badge.female {
    background: var(--secondary-color);
    color: white;
    border-color: var(--secondary-color);
}

.timeline-container {
    position: relative;
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 0;
}

.timeline-line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom, var(--primary-color), var(--secondary-color));
    transform: translateX(-50%);
    border-radius: 2px;
}

.timeline-item {
    position: relative;
    margin-bottom: 3rem;
    display: flex;
    align-items: center;
}

.timeline-item.male {
    justify-content: flex-end;
    padding-right: calc(50% + 2rem);
}

.timeline-item.female {
    justify-content: flex-start;
    padding-left: calc(50% + 2rem);
}

.timeline-content {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: var(--card-shadow);
    max-width: 400px;
    position: relative;
    transition: transform 0.3s ease;
}

.timeline-content:hover {
    transform: translateY(-5px);
}

.timeline-item.male .timeline-content {
    border-bottom-right-radius: 5px;
}

.timeline-item.female .timeline-content {
    border-bottom-left-radius: 5px;
}

.timeline-item.male .timeline-content::before {
    content: '';
    position: absolute;
    right: -10px;
    top: 20px;
    width: 0;
    height: 0;
    border-left: 10px solid white;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
}

.timeline-item.female .timeline-content::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 20px;
    width: 0;
    height: 0;
    border-right: 10px solid white;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
}

.timeline-avatar {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    font-weight: bold;
    z-index: 10;
}

.timeline-item.male .timeline-avatar {
    background: var(--primary-color);
}

.timeline-item.female .timeline-avatar {
    background: var(--secondary-color);
}

.whisper-header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.whisper-sender {
    font-weight: bold;
    font-size: 1.1rem;
}

.timeline-item.male .whisper-sender {
    color: var(--primary-color);
}

.timeline-item.female .whisper-sender {
    color: var(--secondary-color);
}

.whisper-date {
    font-size: 0.9rem;
    color: #666;
}

.whisper-text {
    line-height: 1.6;
    color: var(--text-dark);
    margin-bottom: 1rem;
}

.whisper-actions {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #666;
}

.whisper-action {
    cursor: pointer;
    transition: color 0.3s ease;
}

.whisper-action:hover {
    color: var(--primary-color);
}

@media (max-width: 768px) {
    .whisper-header h1 {
        font-size: 2rem;
    }
    
    .timeline-line {
        left: 30px;
    }
    
    .timeline-item {
        padding-left: 60px !important;
        padding-right: 0 !important;
        justify-content: flex-start !important;
    }
    
    .timeline-avatar {
        left: 30px !important;
        transform: translateX(-50%) !important;
    }
    
    .timeline-content {
        max-width: calc(100% - 60px);
    }
    
    .timeline-item.male .timeline-content::before,
    .timeline-item.female .timeline-content::before {
        left: -10px;
        right: auto;
        border-right: 10px solid white;
        border-left: none;
    }
    
    .user-selection {
        flex-direction: column;
        gap: 0.5rem;
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Form submission
    document.getElementById('whisper-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const sender = document.querySelector('input[name="sender"]:checked').value;
        const text = document.getElementById('whisper-text').value.trim();
        
        if (!text) {
            alert('请输入悄悄话内容');
            return;
        }
        
        // Send to server
        fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=send_whisper&message=' + encodeURIComponent(text) + 
                  '&sender=' + encodeURIComponent(sender) + 
                  '&nonce=<?php echo wp_create_nonce('heartbeat_nonce'); ?>'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Clear form
                document.getElementById('whisper-text').value = '';
                // Reload page to show new whisper
                location.reload();
            } else {
                alert('发送失败，请重试');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('发送失败，请重试');
        });
    });
    
    // Timeline animations
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
});
</script>

<?php get_footer(); ?>

<?php
// Function to get whisper timeline
function get_whisper_timeline() {
    global $wpdb;
    $table = $wpdb->prefix . 'heartbeat_messages';
    $messages = $wpdb->get_results("SELECT * FROM $table ORDER BY message_date DESC LIMIT 20", ARRAY_A);
    
    $output = '';
    $name_1 = get_option('heartbeat_name_1', '小人皮');
    $name_2 = get_option('heartbeat_name_2', '宝贝');
    
    if (empty($messages)) {
        // Sample whispers for demonstration
        $sample_whispers = array(
            array('sender' => $name_1, 'message' => '今天看到夕阳，想起了我们第一次约会的时候 🌅', 'date' => date('Y-m-d H:i:s', strtotime('-2 hours'))),
            array('sender' => $name_2, 'message' => '我也记得那天，你紧张得连话都说不出来 😊', 'date' => date('Y-m-d H:i:s', strtotime('-1 hour'))),
            array('sender' => $name_1, 'message' => '那是因为你太美了，让我忘记了所有准备好的话 💕', 'date' => date('Y-m-d H:i:s', strtotime('-30 minutes'))),
            array('sender' => $name_2, 'message' => '现在想起来还是觉得很甜蜜呢 ❤️', 'date' => date('Y-m-d H:i:s', strtotime('-10 minutes'))),
            array('sender' => $name_1, 'message' => '和你在一起的每一天都是最美好的回忆', 'date' => date('Y-m-d H:i:s', strtotime('-5 minutes'))),
            array('sender' => $name_2, 'message' => '我们要一直这样幸福下去哦 💖', 'date' => date('Y-m-d H:i:s'))
        );
        
        foreach ($sample_whispers as $whisper) {
            $is_male = $whisper['sender'] === $name_1;
            $gender_class = $is_male ? 'male' : 'female';
            $avatar_text = $is_male ? substr($name_1, 0, 1) : substr($name_2, 0, 1);
            $formatted_date = date('Y年m月d日 H:i', strtotime($whisper['date']));
            
            $output .= "<div class='timeline-item $gender_class'>";
            $output .= "<div class='timeline-avatar'>$avatar_text</div>";
            $output .= "<div class='timeline-content'>";
            $output .= "<div class='whisper-header-info'>";
            $output .= "<div class='whisper-sender'>{$whisper['sender']}</div>";
            $output .= "<div class='whisper-date'>$formatted_date</div>";
            $output .= "</div>";
            $output .= "<div class='whisper-text'>" . esc_html($whisper['message']) . "</div>";
            $output .= "<div class='whisper-actions'>";
            $output .= "<span class='whisper-action'>❤️ 喜欢</span>";
            $output .= "<span class='whisper-action'>💬 回复</span>";
            $output .= "</div>";
            $output .= "</div>";
            $output .= "</div>";
        }
    } else {
        foreach ($messages as $msg) {
            $is_male = $msg['sender'] === $name_1;
            $gender_class = $is_male ? 'male' : 'female';
            $avatar_text = $is_male ? substr($name_1, 0, 1) : substr($name_2, 0, 1);
            $formatted_date = date('Y年m月d日 H:i', strtotime($msg['message_date']));
            
            $output .= "<div class='timeline-item $gender_class'>";
            $output .= "<div class='timeline-avatar'>$avatar_text</div>";
            $output .= "<div class='timeline-content'>";
            $output .= "<div class='whisper-header-info'>";
            $output .= "<div class='whisper-sender'>" . esc_html($msg['sender']) . "</div>";
            $output .= "<div class='whisper-date'>$formatted_date</div>";
            $output .= "</div>";
            $output .= "<div class='whisper-text'>" . esc_html($msg['message']) . "</div>";
            $output .= "<div class='whisper-actions'>";
            $output .= "<span class='whisper-action'>❤️ 喜欢</span>";
            $output .= "<span class='whisper-action'>💬 回复</span>";
            $output .= "</div>";
            $output .= "</div>";
            $output .= "</div>";
        }
    }
    
    return $output;
}
?>

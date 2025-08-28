<?php get_header(); ?>

<main class="main-content">
    <div class="container">
        <!-- Gallery Header -->
        <div class="gallery-header">
            <h1>合影集页面</h1>
            <div class="gallery-nav">
                <button class="filter-btn active" data-filter="all">全部</button>
                <button class="filter-btn" data-filter="travel">旅行</button>
                <button class="filter-btn" data-filter="daily">日常</button>
                <button class="filter-btn" data-filter="festival">节日</button>
            </div>
            <div class="search-photos">
                <input type="text" id="photo-search" placeholder="搜索照片..." />
                <button class="btn btn-primary" onclick="uploadPhoto()">上传照片</button>
            </div>
        </div>

        <!-- Photo Grid -->
        <div class="photo-grid" id="photo-grid">
            <?php echo get_photo_gallery(); ?>
        </div>

        <!-- Load More Button -->
        <div class="load-more-section">
            <button class="btn btn-primary" id="load-more-btn">加载更多</button>
        </div>
    </div>

    <!-- Photo Modal -->
    <div id="photo-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <img id="modal-image" src="" alt="">
            <div class="modal-info">
                <h3 id="modal-title"></h3>
                <p id="modal-date"></p>
                <p id="modal-caption"></p>
            </div>
        </div>
    </div>

    <!-- Upload Modal -->
    <div id="upload-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>上传新照片</h3>
            <form id="upload-form">
                <div class="form-group">
                    <label>选择照片</label>
                    <input type="file" id="photo-file" accept="image/*" multiple>
                </div>
                <div class="form-group">
                    <label>照片描述</label>
                    <textarea id="photo-caption" placeholder="描述这张照片的故事..."></textarea>
                </div>
                <div class="form-group">
                    <label>分类</label>
                    <select id="photo-category">
                        <option value="daily">日常</option>
                        <option value="travel">旅行</option>
                        <option value="festival">节日</option>
                        <option value="special">特殊时刻</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>拍摄日期</label>
                    <input type="date" id="photo-date" value="<?php echo date('Y-m-d'); ?>">
                </div>
                <button type="submit" class="btn btn-primary">上传照片</button>
            </form>
        </div>
    </div>
</main>

<style>
.gallery-header {
    text-align: center;
    margin-bottom: 3rem;
    padding: 2rem 0;
    background: var(--gradient-bg);
    color: white;
    border-radius: 20px;
}

.gallery-header h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
}

.gallery-nav {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 0.5rem 1.5rem;
    border: 2px solid rgba(255,255,255,0.3);
    background: transparent;
    color: white;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-btn:hover,
.filter-btn.active {
    background: white;
    color: var(--primary-color);
}

.search-photos {
    display: flex;
    justify-content: center;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.search-photos input {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 25px;
    width: 300px;
    max-width: 100%;
}

.photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.photo-item {
    position: relative;
    border-radius: 15px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease;
    background: white;
    box-shadow: var(--card-shadow);
}

.photo-item:hover {
    transform: translateY(-5px);
}

.photo-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.photo-info {
    padding: 1rem;
}

.photo-date {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.photo-caption {
    font-size: 0.9rem;
    color: var(--text-dark);
}

.load-more-section {
    text-align: center;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    background-color: white;
    margin: 5% auto;
    padding: 2rem;
    border-radius: 20px;
    width: 90%;
    max-width: 800px;
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
}

.close {
    position: absolute;
    right: 1rem;
    top: 1rem;
    font-size: 2rem;
    cursor: pointer;
    color: #666;
}

.close:hover {
    color: var(--primary-color);
}

#modal-image {
    width: 100%;
    max-height: 500px;
    object-fit: contain;
    border-radius: 10px;
    margin-bottom: 1rem;
}

.modal-info h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-dark);
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #eee;
    border-radius: 10px;
    font-size: 1rem;
}

.form-group textarea {
    min-height: 80px;
    resize: vertical;
}

@media (max-width: 768px) {
    .gallery-header h1 {
        font-size: 2rem;
    }
    
    .photo-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .search-photos {
        flex-direction: column;
    }
    
    .search-photos input {
        width: 100%;
    }
    
    .modal-content {
        margin: 10% auto;
        padding: 1.5rem;
    }
}
</style>

<script>
const heartbeatUploadNonce = '<?php echo wp_create_nonce("heartbeat_upload"); ?>';

// Photo gallery functionality
document.addEventListener('DOMContentLoaded', function() {
    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const photoItems = document.querySelectorAll('.photo-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            photoItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Photo modal functionality
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalCaption = document.getElementById('modal-caption');
    
    photoItems.forEach(item => {
        item.addEventListener('click', function() {
            modal.style.display = 'block';
            modalImg.src = this.querySelector('img').src;
            modalTitle.textContent = this.querySelector('.photo-caption').textContent;
            modalDate.textContent = this.querySelector('.photo-date').textContent;
            modalCaption.textContent = this.querySelector('.photo-caption').textContent;
        });
    });
    
    // Close modal functionality
    const closeBtns = document.querySelectorAll('.close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById('photo-search');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        photoItems.forEach(item => {
            const caption = item.querySelector('.photo-caption').textContent.toLowerCase();
            const date = item.querySelector('.photo-date').textContent.toLowerCase();
            
            if (caption.includes(searchTerm) || date.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Upload photo functionality
function uploadPhoto() {
    document.getElementById('upload-modal').style.display = 'block';
}

// Handle photo upload form
document.getElementById('upload-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const fileInput = document.getElementById('photo-file');
    const caption = document.getElementById('photo-caption').value || '';
    const category = document.getElementById('photo-category').value || '';
    const date = document.getElementById('photo-date').value || '';

    if (fileInput.files.length === 0) {
        alert('请选择至少一张照片');
        return;
    }

    const formData = new FormData();

    // Support multiple files (field name photos[])
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('photos[]', fileInput.files[i]);
    }

    // Append metadata and WP AJAX action + nonce
    formData.append('caption', caption);
    formData.append('category', category);
    formData.append('date', date);
    formData.append('action', 'heartbeat_upload_photo');
    formData.append('security', heartbeatUploadNonce);

    fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('照片上传成功！');
            // If server returned HTML for the new photos, prepend to grid
            if (data.data && data.data.html) {
                document.getElementById('photo-grid').insertAdjacentHTML('afterbegin', data.data.html);
                // re-run any item click bindings if needed (simple approach: reload)
                // location.reload();
            }
        } else {
            const msg = (data.data && typeof data.data === 'string') ? data.data : '照片上传失败，请重试';
            alert(msg);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('照片上传失败，请重试');
    });

    document.getElementById('upload-modal').style.display = 'none';
    this.reset();
});
</script>

<?php get_footer(); ?>

<?php
// Function to get photo gallery
function get_photo_gallery() {
    global $wpdb;
    $table = $wpdb->prefix . 'heartbeat_photos';
    $photos = $wpdb->get_results("SELECT * FROM $table ORDER BY photo_date DESC LIMIT 20", ARRAY_A);
    
    $output = '';
    
    if (empty($photos)) {
        // Sample photos for demonstration
        $sample_photos = array(
            array('url' => 'https://via.placeholder.com/300x200/ff6b9d/ffffff?text=Photo+1', 'caption' => '美好的一天', 'date' => '2024-08-20', 'category' => 'daily'),
            array('url' => 'https://via.placeholder.com/300x200/4ecdc4/ffffff?text=Photo+2', 'caption' => '旅行回忆', 'date' => '2024-08-15', 'category' => 'travel'),
            array('url' => 'https://via.placeholder.com/300x200/45b7d1/ffffff?text=Photo+3', 'caption' => '节日庆祝', 'date' => '2024-08-10', 'category' => 'festival'),
            array('url' => 'https://via.placeholder.com/300x200/ff6b9d/ffffff?text=Photo+4', 'caption' => '日常生活', 'date' => '2024-08-05', 'category' => 'daily'),
            array('url' => 'https://via.placeholder.com/300x200/4ecdc4/ffffff?text=Photo+5', 'caption' => '特殊时刻', 'date' => '2024-08-01', 'category' => 'special'),
            array('url' => 'https://via.placeholder.com/300x200/45b7d1/ffffff?text=Photo+6', 'caption' => '浪漫晚餐', 'date' => '2024-07-28', 'category' => 'daily')
        );
        
        foreach ($sample_photos as $photo) {
            $formatted_date = date('Y年m月d日', strtotime($photo['date']));
            $output .= "<div class='photo-item' data-category='{$photo['category']}'>";
            $output .= "<img src='{$photo['url']}' alt='{$photo['caption']}' />";
            $output .= "<div class='photo-info'>";
            $output .= "<div class='photo-date'>$formatted_date</div>";
            $output .= "<div class='photo-caption'>{$photo['caption']}</div>";
            $output .= "</div>";
            $output .= "</div>";
        }
    } else {
        foreach ($photos as $photo) {
            $formatted_date = date('Y年m月d日', strtotime($photo['photo_date']));
            $output .= "<div class='photo-item' data-category='{$photo['category']}'>";
            $output .= "<img src='{$photo['photo_url']}' alt='{$photo['caption']}' />";
            $output .= "<div class='photo-info'>";
            $output .= "<div class='photo-date'>$formatted_date</div>";
            $output .= "<div class='photo-caption'>" . esc_html($photo['caption']) . "</div>";
            $output .= "</div>";
            $output .= "</div>";
        }
    }
    
    return $output;
}
?>

<?php

define('HB_VERSION', wp_get_theme()->get('Version'));

function heartbeat_setup()
{
	load_theme_textdomain('heartbeat', get_template_directory() . '/languages');

	/*
		* Let WordPress manage the document title.
		* By adding theme support, we declare that this theme does not use a
		* hard-coded <title> tag in the document head, and expect WordPress to
		* provide it for us.
		*/
	add_theme_support('title-tag');

	/*
		* Enable support for Post Thumbnails on posts and pages.
		*
		* @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		*/
	add_theme_support('post-thumbnails');

	// This theme uses wp_nav_menu() in one location.
	register_nav_menus(
		array(
			'primary' => esc_html__('Primary', 'heartbeat'),
		)
	);

	/*
		* Switch default core markup for search form, comment form, and comments
		* to output valid HTML5.
		*/
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);

	// Set up the WordPress core custom background feature.
	add_theme_support(
		'custom-background',
		apply_filters(
			'heartbeat_custom_background_args',
			array(
				'default-color' => 'ffffff',
				'default-image' => '',
			)
		)
	);

	// Add theme support for selective refresh for widgets.
	add_theme_support('customize-selective-refresh-widgets');

	/**
	 * Add support for core custom logo.
	 *
	 * @link https://codex.wordpress.org/Theme_Logo
	 */
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 250,
			'width'       => 250,
			'flex-width'  => true,
			'flex-height' => true,
		)
	);

	remove_action('wp_head', 'feed_links_extra', 3);
	remove_action('wp_head', 'rsd_link');
	remove_action('wp_head', 'wlwmanifest_link');
	remove_action('wp_head', 'index_rel_link');
	remove_action('wp_head', 'start_post_rel_link', 10);
	remove_action('wp_head', 'wp_generator');
	remove_filter('the_content', 'wptexturize');
	remove_action('template_redirect', 'rest_output_link_header', 11);
}
add_action('after_setup_theme', 'heartbeat_setup');

/**
 * Enqueue scripts and styles.
 */
function heartbeat_scripts()
{
	wp_enqueue_style('heartbeat-style', get_stylesheet_uri(), array(), HB_VERSION);
	wp_enqueue_script('heartbeat-navigation', get_template_directory_uri() . '/js/navigation.js', array(), HB_VERSION, true);
}
add_action('wp_enqueue_scripts', 'heartbeat_scripts');

require get_template_directory() . '/inc/theme-plus.php';
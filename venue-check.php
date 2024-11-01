<?php
/*
Plugin Name: Venue Check
Plugin URI:  https://expient.com/venue-check-plugin-for-use-with-the-events-calendar-by-modern-tribe/
Description: Venue Check prevents double booking venues with The Events Calendar by Modern Tribe.
Version:     2.0.2
Author:      Expient LLC
Author URI:  https://expient.com
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

function venuecheck_ajax_enqueue_scripts($hook) {
    
    global $post_type;
    if ( ('post-new.php' != $hook && 'post.php' != $hook ) || 'tribe_events' != $post_type ) {
        return;
    }
    wp_register_style( 'venuecheck-styles', plugins_url( '/css/venue-check.css', __FILE__ ), array(), '1.0', 'all' );
    wp_enqueue_style( 'venuecheck-styles' );
    wp_enqueue_script( 'venuecheck-scripts', plugins_url( '/js/venue-check.js', __FILE__ ), array('jquery'), '1.0', true );
	wp_localize_script( 'venuecheck-scripts', 'venuecheck', array(
		'ajax_url' => admin_url( 'admin-ajax.php' )
	));
}

add_action( 'admin_enqueue_scripts', 'venuecheck_ajax_enqueue_scripts', 99999 );
add_action( 'wp_ajax_venuecheck_check_venues', 'venuecheck_check_venues' );
add_action( 'wp_ajax_venuecheck_set_offsets', 'venuecheck_set_offsets' );
add_action( 'wp_ajax_venuecheck_get_offsets', 'venuecheck_get_offsets' );

function venuecheck_check_venues() {

    $venueConflicts = [];
    
	if ( isset($_REQUEST) ) {
        $eventDateStart = $_REQUEST['eventDateStart'];
        $eventDateEnd = $_REQUEST['eventDateEnd'];
        $postID = $_REQUEST['postID'];

        global $wpdb;

        $args = array(
            'post_type' => 'tribe_events',
            'exclude' => $postID,
            'meta_query' => array(
                'relation' => 'AND',
                array(
                    'key' => '_EventStartDate', //c
                    'value' => $eventDateEnd, //b
                    'compare' => '<'
                ),
                array(
                    'key' => '_EventEndDate', //d
                    'value' => $eventDateStart, //a
                    'compare' => '>'
                )
            )
        );

        $posts = get_posts($args);
      
        foreach($posts as $post){
            $venueConflicts[get_post_meta($post->ID, '_EventVenueID', true)][] = $post->post_title;
        }
        
        unset($venueConflicts['']);
        echo json_encode($venueConflicts);       
	}
	
    die();
}

function venuecheck_set_offsets() {
     
	if ( isset($_REQUEST) ) {
        if (ctype_digit($_REQUEST['eventStartOffset'])) {
            $eventStartOffset = $_REQUEST['eventStartOffset'];
        }
        if (ctype_digit($_REQUEST['eventEndOffset'])) {
            $eventEndOffset = $_REQUEST['eventEndOffset'];
        }
        if (ctype_digit($_REQUEST['postID'])) {
            $postID = $_REQUEST['postID'];
        }
               
        if ( ! add_post_meta( $postID, '_venuecheck_event_offset_start', $eventStartOffset, true ) ) { 
            update_post_meta( $postID, '_venuecheck_event_offset_start', $eventStartOffset );
        }
        if ( ! add_post_meta( $postID, '_venuecheck_event_offset_end', $eventEndOffset, true ) ) { 
            update_post_meta( $postID, '_venuecheck_event_offset_end', $eventEndOffset );
        }    
    }
	
    die();
}


function venuecheck_get_offsets() {
    
	if ( isset($_REQUEST) ) {
        $postID = $_REQUEST['postID'];
        $eventStartOffset = get_post_meta($postID, "_venuecheck_event_offset_start", true);
        $eventEndOffset = get_post_meta($postID, "_venuecheck_event_offset_end", true);
        
        $offsets = array(
            "eventStartOffset" => $eventStartOffset,
            "eventEndOffset" => $eventEndOffset
        );
        echo json_encode($offsets);       
    }
	
    die();
}

=== Plugin Name ===
Contributors: Expient LLC
Donate link: http://expient.com
Tags: the events calendar, venue, conflicts, double booking
Requires at least: 4.7
Tested up to: 4.8
Stable tag: 2.0.2
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Venue Check prevents double booking venues with The Events Calendar by Modern Tribe.

== Description ==

Venue Check will check for venue conflicts when adding an event. You can also include setup and cleanup time before and after the event. The setup and cleanup time will not display on the events calendar but will be included into the venue conflict checking.

Requires The Events Calendar (4.4.5 or greater) by Modern Tribe.

This plugin will work with "The Events Calendar" or "The Events Calendar PRO" but it currently does not support the recurring events feature available in the PRO version. This will be available in a future version of Venue Check.

I hope you find this plugin useful. If you find any bugs or have any feedback of any kind, please contact me. 

[youtube https://www.youtube.com/watch?v=2lcYXwTMJo4]

== Installation ==

1. Upload the `venue-check` plugin to your `/wp-content/plugins` directory, or upload and install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Please note that when deleting the plugin any `setup` and `cleanup` times you added with the Venue Check plugin will also be deleted from the database.
4. The plugin does not have any settings. It adds functionality when adding an event with "The Events Calendar" admin. Look for the setup time and cleanup time controls in the Date & Time section when adding a new event (see the screenshots for an example).

== Frequently Asked Questions ==

= How do I know if the plugin has been installed? =

You can see "with Venue Check" on the admin screen Date and Time section when adding or editing an event.

= After I insall it for the first time, what happens if I already have venue conflicts? Does it check for existing conflicts? =

Venue Check will show conflicts for existing events or when editing an existing event, but it will not prevent any existing conflicts you had before activating Venue Check.

== Screenshots ==

1. This is a screenshot that shows the Date & Time section with the Venue Check indicator and the Setup and Cleanup times. It also shows an existing conflict for the Venue dropdown menu.

2. This is a screenshot that shows the unavailability of `Conference Room 1` in the Venue dropdown menu.

== Changelog ==

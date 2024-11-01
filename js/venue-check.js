/*
returns mysql date format for dateType
#EventStartDate
#EventEndDate
*/
function venuecheck_getEventDate(dateType) {

    //set variables for mysql date format
    var eventDate;
    var date = jQuery('#Event' + dateType + 'Date').datepicker('getDate');
    var time = jQuery('#Event' + dateType + 'Time').val();
    var meridian = time.slice(-2).toLowerCase();
    time = time.slice(0, -2);
    var timeSplit = time.split(':');
    var hour = parseInt(timeSplit[0]);
    var hour = meridian === 'pm' && hour < 12 ? hour + 12 : hour;

    var minute = parseInt(timeSplit[1]);
    var eventStartOffset = parseInt(jQuery('select[id="eventStartOffset"]').val());
    var eventEndOffset = parseInt(jQuery('select[id="eventEndOffset"] option:selected').val());

    date.setUTCHours(hour);
    date.setUTCMinutes(minute);

    if (dateType === 'Start') {
        var eventDate = new Date(date.getTime() - eventStartOffset * 60 * 1000).toISOString().substr(0, 19).replace('T', ' ');
    }

    if (dateType === 'End') {
        var eventDate = new Date(date.getTime() + eventEndOffset * 60 * 1000).toISOString().substr(0, 19).replace('T', ' ');
    }

    return eventDate;
}

/*
calls venuecheck_check_venues php function
returns array conflicts
disables or enables venue options in dropdown menu
displays or hides message
*/

function venuecheck_checkVenues(eventDateStart, eventDateEnd, postID) {

    jQuery('#venue-conflict-msg-1').remove();
    jQuery('#venue-conflict-msg-2').remove();
    jQuery('#s2id_saved_tribe_venue').removeClass('venue-check-error');

    //call venuecheck_check_venues function
    jQuery.ajax({
        url: venuecheck.ajax_url,
        data: {
            'action': 'venuecheck_check_venues',
            'eventDateStart': eventDateStart,
            'eventDateEnd': eventDateEnd,
            'postID': postID
        },
        beforeSend: function () {
            jQuery('#venue-check-loading').show();
        },
        complete: function () {
            jQuery('#venue-check-loading').hide();
        },
        success: function (conflicts) {
            //remove saved venue option disabled state
            var venueCheckVenues = jQuery("#saved_tribe_venue").data('select2');
            var venueCheckVenueOptions = venueCheckVenues.opts.data;
            for (var i in venueCheckVenueOptions) {
                if (venueCheckVenueOptions.hasOwnProperty(i)) {
                    venueCheckVenueOptions[i].disabled = false;
                }
            }

            //set variables for use in messaging
            if (jQuery("#saved_tribe_venue").select2("data")) {
                var select2Data = jQuery("#saved_tribe_venue").select2("data");
                var currentVenueID = select2Data['id'];
                var currentVenueText = select2Data['text'];

            }

            //disable and message any venue conflicts
            if (typeof conflicts != "undefined") {
                jQuery.each(conflicts, function (venueID, eventTitles) {

                    //http://stackoverflow.com/questions/15997879/get-the-index-of-the-object-inside-an-array-matching-a-condition
                    index = venueCheckVenueOptions.findIndex(x => x.id == venueID);
                    venueCheckVenueOptions[index].disabled = true;

                    //show message for venue conflict for existing conflicts and edits
                    if (parseInt(venueID) === currentVenueID) {
                        //begin message content
                        var conflictMsg = "<strong>Venue Check</strong>: The currently selected venue \"" + currentVenueText + "\" is already reserved for ";

                        jQuery.each(eventTitles, function (index, eventTitle) {
                            conflictMsg += "\"" + eventTitle + ",\" ";
                        })

                        //end message content
                        conflictMsg += " at the specified date and time. Select a different venue or change the date and time.";

                        //add message to ui
                        jQuery("#EventInfo td.tribe_sectionheader:first h4").append(
                            "<span id=\"venue-conflict-msg-1\">Venue conflict found, see below for details.</span>"
                        );

                        jQuery("#saved_tribe_venue").closest("tr").before("<tr id=\"venue-conflict-msg-2\"><td colspan=\"2\"><div>" + conflictMsg + "</div></td></tr>");
                        
                        jQuery('#s2id_saved_tribe_venue').addClass('venue-check-error');
                    }
                });
            }
        },
        dataType: "json",
        error: function (errorThrown) {
            console.log("ERROR:" + errorThrown);
        }
    });
}

/*
saves offsets in the database
*/

function venuecheck_setOffsets(eventStartOffset, eventEndOffset, postID) {
    jQuery.ajax({
        url: venuecheck.ajax_url,
        data: {
            'action': 'venuecheck_set_offsets',
            'eventStartOffset': eventStartOffset,
            'eventEndOffset': eventEndOffset,
            'postID': postID
        },
        dataType: "json",
        error: function (errorThrown) {
            console.log("venuecheck_setOffsets ERROR:" + errorThrown);
        }
    });
}

/*
reads offsets from the database
*/

function venuecheck_getOffsets() {
    return jQuery.ajax({
        url: venuecheck.ajax_url,
        data: {
            'action': 'venuecheck_get_offsets',
            'postID': jQuery("#post_ID").val()
        },
        dataType: "json",
        error: function (errorThrown) {
            console.log("venuecheck_getOffsets ERROR:" + errorThrown);
        }
    });
}

/*
overrides time functions for all-day events
*/

function venuecheck_checkAllDayEvent() {
    //if it's checked set hours and minutes
    /*
    2016-07-04 00:00:00
    2016-07-04 23:59:59
    */

    if (jQuery("#allDayCheckbox").prop('checked') == true) {

        var startDate = jQuery('#EventStartDate').datepicker('getDate');
        startDate.setUTCHours(0);
        startDate.setUTCMinutes(0, 0);
        var eventStartDate = new Date(startDate).toISOString().substr(0, 19).replace('T', ' ');

        var endDate = jQuery('#EventEndDate').datepicker('getDate');
        endDate.setUTCHours(23);
        endDate.setUTCMinutes(59, 59);
        var eventEndDate = new Date(endDate).toISOString().substr(0, 19).replace('T', ' ');

        venuecheck_checkVenues(eventStartDate, eventEndDate, jQuery("#post_ID").val());

        jQuery('tr.venuecheck-offset').hide();

    } else {
        venuecheck_checkVenues(venuecheck_getEventDate('Start'), venuecheck_getEventDate('End'), jQuery("#post_ID").val());
        jQuery('tr.venuecheck-offset').show();
    }

}

/*
sets up all the new ui elements and events
*/

jQuery(document).ready(function () {

    //branding, show that VenueCheck is installed and activated
    jQuery("#EventInfo td.tribe_sectionheader:first h4").append(
        "<span id=\"with-venue-check\">with Venue Check</span> <span id=\"venue-check-loading\">Checking for venue conflicts</span>"
    );

    venuecheck_getOffsets().done(function (offsets) {

        //setup time before event dropdown menu
        var selectStartOffset = "<select tabindex=\"2003\" id=\"eventStartOffset\"><option value=\"0\">None</option><option value=\"15\">15 minutes</option><option value=\"30\">30 minutes</option><option value=\"45\">45 minutes</option><option value=\"60\">1 hour</option></select>";

        //cleanup time after event dropdown menu
        var selectEndOffset = "<select tabindex=\"2003\" id=\"eventEndOffset\"><option value=\"0\">None</option><option value=\"15\">15 minutes</option><option value=\"30\">30 minutes</option><option value=\"45\">45 minutes</option><option value=\"60\">1 hour</option></select>";

        //add setup time before to ui
        jQuery("#EventInfo .eventtable tr:nth-child(1)").before(
            "<tr class=\"venuecheck-offset\"><td><span>Setup Time Before:</span></td><td>" + selectStartOffset + " (setup time will not be shown on the events calendar on your site)</td></tr>"
        );

        //add cleanup time after to ui
        jQuery("#EventInfo .eventtable tr:nth-child(3)").after(
            "<tr class=\"venuecheck-offset\"><td><span>Cleanup Time After:</span></td><td>" + selectEndOffset + " (cleanup time will not be shown on the events calendar on your site)</td></tr>"
        );

        //set current offsets in select menu
        if (offsets.eventStartOffset !== '') {
            jQuery('select[id="eventStartOffset"] option[value=' + offsets.eventStartOffset + ']').attr('selected', 'selected');
        }
        //set current offsets in select menu
        if (offsets.eventEndOffset !== '') {
            jQuery('select[id="eventEndOffset"] option[value=' + offsets.eventEndOffset + ']').attr('selected', 'selected');
        }

        //call venuecheck_checkVenues when datepicker is closed
        jQuery('#EventInfo .tribe-datepicker').datepicker("option", "onClose", function () {
            venuecheck_checkVenues(venuecheck_getEventDate('Start'), venuecheck_getEventDate('End'), jQuery("#post_ID").val());
        });

        //call venuecheck_checkVenues when timepicker is changed
        jQuery('#EventStartTime, #EventEndTime').on('changeTime', function () {
            venuecheck_checkVenues(venuecheck_getEventDate('Start'), venuecheck_getEventDate('End'), jQuery("#post_ID").val());
        });

        //call venuecheck_checkVenues when saved venues are changed        
        jQuery('#saved_tribe_venue, #eventStartOffset, #eventEndOffset').on('change', function () {
            venuecheck_checkVenues(venuecheck_getEventDate('Start'), venuecheck_getEventDate('End'), jQuery("#post_ID").val());
        });

        //call venuecheck_checkVenues when all-day event checkbox is changed
        jQuery('#allDayCheckbox').on("change", function () {
            venuecheck_checkAllDayEvent();
        });

        //set javascript variables for start and end offset and save to database
        jQuery('#save-post, #publish').on("click", function () {
            
            var eventStartOffset = parseInt(jQuery('select[id="eventStartOffset"]').val());
            var eventEndOffset = parseInt(jQuery('select[id="eventEndOffset"]').val());
 
            //save to database
            venuecheck_setOffsets(eventStartOffset, eventEndOffset, jQuery("#post_ID").val());

        });

        //sets all-day event checkbox
        venuecheck_checkAllDayEvent();
    });
});

var express        = require('express');
var _              = require('lodash');
var dateFns        = require('date-fns');

const nodemailer   = require('nodemailer');

//firebase init
var firebase = require("firebase-admin");
var firebase_json = require('.././firebase.json');
firebase.initializeApp({
    databaseURL: 'https://guru-70110.firebaseio.com',
    credential: firebase.credential.cert(firebase_json), //this is file that I downloaded from Firebase Console
});

var request_functions = require('./handle_request');
var request_fns_obj = new request_functions(firebase, _, dateFns);

console.log('yoyoy honey singh');


// request_fns_obj.message_email_user

function send_mail_user( email ) {
    let mailOptions = {
        from    : '"WhereisGuru" <john.clarke852@gmail.com>', // sender address
        to      : email, //'jatin@revinfotech.com', // list of receivers
        subject : 'Reminder Email', // Subject line
        // text: 'Hello world ?', // plain text body
        html    : 'The Course on which you have applied has started.' // html body
    };
    request_fns_obj.send_mail( mailOptions, nodemailer );
}


var user_detail_ref = firebase.database().ref('course/').once('value', function(res) {
    var value = res.val();
    // var now = new Date();
    // console.log( 'res', value );
    _.forEach(value, function(course_data, course_key) {
        var course_date_split = course_data.start_end_day.start_day.split("-");
        var course_end_date   = new Date( course_date_split[2], course_date_split[1], course_date_split[0] );
        // console.log( course_data  );
        if( dateFns.isToday(course_end_date) ) {
            firebase.database().ref('course_applied/'+course_key).once('value', function(stu_applied_to_course) {
                var stu_applied_value = stu_applied_to_course.val();
                // console.log( stu_applied_value );
                if( stu_applied_value ) {
                    _.forEach(stu_applied_value, function(stu_value, stu_key) {
                        // console.log( stu_value.e );
                        if( stu_value.e ) {
                            send_mail_user( stu_value.e )
                        }
                    });
                }
            });
        }
    });
});
var handle_request = function(firebase_admin, _, dateFns) {
    // helper functions
    function set_course_key(course_id, key, value) {
        /*return new Promise((resolve) => {
            console.log( key+'-==>>', value )
            resolve();
        });*/
        var user_detail_ref = firebase_admin.database().ref('course/'+course_id+'/'+key).set(value);
        return user_detail_ref;
    }



    // live functions
    var self = this;
    self.get_date_from_timestamp = function( timestamp ) {
		let date            = new Date(timestamp),
		start_date_of_month = date.getDate(), 	    // 1
		current_month       = date.getMonth()+1, 	// as in getMonth month starts with 0
		current_year        = date.getFullYear();   // 2016
		return start_date_of_month+'/'+current_month+'/'+current_year;
	}

    self.delete_user = function(user_id, user_type) {
        // firebase_admin.
        return firebase_admin.database().ref('/users_details/'+user_id).remove().then(function( ) {
            return {
                output : 'done'
            };
        });
    }

    self.get_user_details = function(user_id, output) {
        firebase_admin.database().ref('users_details').child(user_id).once('value', function (value) {
            var user_details = value.val();
            // console.log('output ====---', user_details);
            // output(user_details);
            output(user_details);
        }); 
    }

    /**
     * Getting all courses
     */
    self.get_user_courses = function(user_id, output) {
        firebase_admin.database().ref('user_courses').child(user_id).once('value', function (value) {
            var user_courses = value.val();
            // console.log('output ====---', user_courses);
            // output(user_courses);
            output(user_courses);
        });
    }

    self.get_user_single_course = function(course_id, output) {
        firebase_admin.database().ref('course').child(course_id).once('value', function (value) {
            var user_course = value.val();
            // console.log( user_course );
            output(user_course);
        });
    }



    /**{
        action     : 'user_details_edit',
        user_id    : '0qZxToyazmR9S3tQVogKSA1Rugb2',
        email      : 'john.clarke852@gmail.com',
        usertype   : 'student',
        username   : 'asdf',
        address1   : 'asdf',
        address2   : 'asfd',
        city       : 'sdf',
        firstname  : 'asdf',
        lastname   : 'asddf',
        phonenumber: 'asdf',
        zipcode    : 'asdf'
    }*/
    // update database
    self.update_user_data = function( user_data, user_id ) {
        var valid_fields = ['username', 'address1', 'address2', 'city', 'firstname', 'lastname', 'phonenumber', 'zipcode'];
        var user_detail_ref = firebase_admin.database().ref('users_details/'+user_id);
        console.log( user_data );
        var set_user = function(key, value) {
            // return new Promise(function (resolve) {
            //     console.log('This', key, value);
            //     resolve();
            // });
            console.log('This', i, value);
            return user_detail_ref.child(i).set(value);
        }

        var chain = Promise.resolve();
        for(j in user_data) {
            for(i of valid_fields) {
                if( i == j ) {
                    chain = chain.then(set_user(i, user_data[j]));
                }
            }
        }
        return chain.then(function() {
            return {output: 1};
        });
        // user_detail_ref.child('')
    }

    /*    INPUT
    address_1              : 'Gill Rd, Shahid Jasdev Singh Nagar, ',
    address_2              : 'Ludhiana, Punjab 141006, India',
    capacity               : '',
    courseDescription      : '',
    course_complete_status : '',
    course_description     : 'Course description',
    course_title           : 'Title ',
    courselevel            : '',
    date_added             : '26/01/2017',
    fees                   : '',
    frequency              : 'weekly',
    generalComments        : '',
    instructor_name        : '',
    instructor_orginization: '',
    instructor_profile     : '',
    last_day_to_apply      : '',
    location               : '30.852234099999997,75.8591939',
    pre_requisit           : '',
    quantity               : '',
    start_day              : '11-2-2017',
    end_day                : '11-3-2017',
    day0                   : 'wednesday',
    start_timings0         : '20-00',
    end_timings0           : '21-00'
    */
    self.update_course = function( course_data, course_id ) {
        // console.log( 'course_data', course_data );
        var valid_fields = [
            'address_1',
            'address_2',
            'capacity',
            'courseDescription',
            'course_complete_status',
            'course_description',
            'course_title',
            'courselevel',
            'date_added',
            'fees',
            'frequency',
            'generalComments',
            'instructor_name',
            'instructor_orginization',
            'instructor_profile',
            'last_day_to_apply',
            'location',
            'pre_requisit',
            'quantity'
        ];
            // 'start_day',
            // 'end_day'
        
        let fun_promise = (key, value) => {
            return new Promise((resolve) => {
                // user_detail_ref.
                set_course_key(course_id, key, value).then(function () {
                    // console.log(key+'---', value);
                    resolve();
                });
            });
        }

        let chain = Promise.resolve();
        for(let value of valid_fields) {
            for( let form_fields in course_data) {
                if( value == form_fields ) {
                    if( course_data[form_fields] != '' && course_data[form_fields] != undefined ) {
                        chain = chain.then(() => {
                            return fun_promise( form_fields, course_data[form_fields] );
                        });
                    }
                }
            }
        }
        
        let timer_output = [];
        let start_timer = [];
        let end_timer = [];
        for(let k=0; k<course_data.counter; k++) {
            if(course_data['day'+k] != undefined ) {
                start_timer = course_data['start_timings'+k].split('-');
                end_timer   = course_data['end_timings'+k].split('-');
                timer_output.push({
                    start : {
                        day   : course_data['day'+k],
                        hour  : start_timer[0],
                        minute: start_timer[1]
                    },
                    end : {
                        day   : course_data['day'+k],
                        hour  : end_timer[0],
                        minute: end_timer[1]
                    }
                });
            }
        }
        
        // console.log( course_data );
        chain.then(function () {
            return set_course_key(course_id, 'start_end_day/start_day', course_data.start_day);
        }).then(function() {
            return set_course_key(course_id, 'start_end_day/end_day', course_data.end_day);
        }).then(function() {
            return set_course_key(course_id, 'timings', timer_output);
            // console.log( timer_output );
        });
        return chain;
    }

    /**
     * Output :  '-KbO2BB1BP1z8kd_dRDL':
        {
            ccs: 1,
            ce : 1489170600000,
            cn : 'Title ',
            cs : 1486751400000,
            f  : 'weekly',
            t  : [ [Object] ],
            uid: 'MEaHCC158kUrEcDph2I123mYvMt1'
        } 
       }
     */
    self.get_student_courses = function(stu_id) {
        return new Promise(function (resolve) {
            firebase_admin.database().ref('course_applied1/'+stu_id).once('value', function(res) {
                // console.log('--==>', res.val());
                resolve(res.val());
            });
        });
    }

    /**
     * 0_2 = 'request' by either student or teacher, there is no status as "1",
     * course_key = timestamp used in course_applied1
     */
    self.delete_course_from_student = function( course_key, status, student_id, course_id ) {
        status = status == 'completed' ? '1' : '0_2';
        console.log('request url =>', 'course_applied1/'+student_id+'/'+status+'/'+course_key);
        return firebase_admin.database().ref('course_applied1/'+student_id+'/'+status+'/'+course_key).remove().then(function() {
            return firebase_admin.database().ref('course_applied/'+course_id+'/'+student_id).remove();
        });
    }

    self.delete_course_from_studentId_and_courseId = function( course_id, student_id, output ) {
        firebase_admin.database().ref('course_applied1/'+student_id+'/0_2').orderByChild("cid").equalTo(course_id).once('value', function (res) {
            console.log( 'res', res.val() );
            for(i in res.val()) {
                output( i );
                return ;
            }
        });
    };

    /**
     * Calculation for number of hours.
     */
    self.cron_job = function() {
        let now           = new Date();
        let done_elements = [];
        let user_rating   = [];
        let hours_to_minute = function( minutes ) {
            return minutes/60;
        }
        let add_minutes_for_same_userId = function(all_elements) {
            calculated_uid = {};
            if( all_elements.length > 0 ) {
                let group_uids = _.groupBy(all_elements, function(o) { return o.uid; });
                // console.log( 'group_uids', group_uids );
                for( k in group_uids ) {
                    total_mins = 0;
                    // console.log( 'k', k );
                    for(l of group_uids[k]) {
                        // console.log( 'l', l );
                        total_mins += l.min;
                    }
                    calculated_uid[k] = total_mins;
                    // calculated_uid.push({ uid : k, min : total_mins });
                }
            }
            // console.log( 'calculated_uid', calculated_uid );
            return calculated_uid;
        }
        let number_of_minutes_worked_on_that_day = function( time_obj ) {
            total_min_worked = 0;
            for( j of time_obj ) {
                time_start = now;
                time_end   = now;
                // console.log( 'j==-->>', j );
                time_start        = dateFns.setMinutes(dateFns.setHours(time_start, Number(j.start.hour)), Number(j.start.minute));
                time_end          = dateFns.setMinutes(dateFns.setHours(time_end, Number(j.end.hour)), Number(j.end.minute));
                number_of_minutes = dateFns.differenceInMinutes( time_end, time_start );
                total_min_worked  += number_of_minutes;
                // console.log( 'diff in minutes', number_of_minutes );
            }
            // console.log( 'total_min_worked', total_min_worked );
            return total_min_worked;
        }
        let week_days_to_work = function( time_obj ) {
            output = [];
            week_days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            for( j of time_obj ) {
                week_index = _.findIndex(week_days, function(o) { return o == j.start.day; })
                output.push(week_index);
            }
            return output;
        }
        let cal_time = function(obj) {
            total_minutes_worked_for_course = 0;
            // console.log('obj==-->>', obj, '\nobj.t==-->>', obj.t);
            arr_week_days_for_course = week_days_to_work( obj.t );
            course_start             = new Date(Number(obj.cs));
            course_end               = new Date(Number(obj.ce));
            /*output = dateFns.differenceInCalendarDays(course_end, course_start);
            console.log('course-start', course_start, 'course-end', course_end, '==-->>', output);*/
            // console.log( course_start.getDate(), course_start.getMonth(), course_start.getFullYear() );
            while( dateFns.differenceInCalendarDays(course_end, course_start) > 0 ) {
                // console.log( 'get day', dateFns.getDay(course_start) );
                do_calculate = _.findIndex(arr_week_days_for_course, function(o) { return dateFns.getDay(course_start) == o; });
                if( do_calculate > -1 ) {
                    // console.log( obj.t );
                    total_minutes_worked_for_course += number_of_minutes_worked_on_that_day(obj.t);
                }
                course_start = dateFns.addDays(course_start, 1);
            }
            return total_minutes_worked_for_course;
        }
        return new Promise(function (resolve) {
            firebase_admin.database().ref('user_calendar_course').once('value', function(res) {                
                var input = res.val();
                for( course_id in input ) {
                    day_difference = dateFns.differenceInCalendarDays( new Date(Number(input[course_id].ce)), now );
                    if(day_difference < 0) {
                        minutes_worked_for_course = cal_time(input[course_id]);
                        done_elements.push({
                            uid : input[course_id].uid,
                            min : minutes_worked_for_course
                        });
                    }
                }
                output = add_minutes_for_same_userId(done_elements);
                console.log( 'output', output );
                resolve();
            });
        });
    }


    /**
     * Number of course published and completed.
     */
    self.cron2 = function() {
        let now           = new Date();
        let calculate_number_of_courses = function(input_course) {
            // console.log( input_course );
            output = {};
            for( k in input_course ) {
                output[k] = input_course[k].length;
            }
            return output;
        }
        return new Promise(function (resolve) {
            firebase_admin.database().ref('user_calendar_course').once('value', function(res) {
                var input                   = res.val();
                number_of_courses_published = [];
                number_of_completed_course  = [];
                for( course_id in input ) {
                    day_difference = dateFns.differenceInCalendarDays( new Date(Number(input[course_id].ce)), now );
                    number_of_courses_published.push({ cid : course_id, uid: input[course_id].uid });
                    if( day_difference < 0 ) { // course completed
                        number_of_completed_course.push({ cid: course_id, uid: input[course_id].uid });
                    }
                    // console.log( course_id, input[course_id] );
                }
                completed_course            = _.groupBy(number_of_completed_course, function(o) { return o.uid; });
                course_number               = _.groupBy(number_of_courses_published, function(o) { return o.uid; });
                calculated_completed_course = calculate_number_of_courses( completed_course );
                calculated_course_number    = calculate_number_of_courses( course_number );

                //temp
                // calculated_completed_course = calculated_course_number;

                final_output = {}
                for( a in calculated_course_number ) {
                    if( calculated_completed_course[a] == undefined ) {
                        final_output[a] = {
                            cn : calculated_course_number[a]
                        }
                    } else {
                        final_output[a] = {
                            cc : calculated_completed_course[a],
                            cn : calculated_course_number[a]
                        }
                    }
                }

                console.log( final_output );
                // console.log( course_number );
                // console.log( completed_course );
                /*console.log( calculated_course_number );
                console.log( calculated_completed_course );*/

                firebase_admin.database().ref('teacher_rating').set( final_output ).then(() => {
                    resolve();
                });

                // output = add_minutes_for_same_userId(done_elements);
                // console.log( 'output', output );
            });
        });
    }

    /**
     * remove unused 
     */
    self.cron1 = function() {

    }

    self.get_stu_from_course_id = function( course_id ) {
        return new Promise(function (resolve) {
            firebase_admin.database().ref('course_applied/'+course_id).once('value', function(res) {
                // console.log('--==>', res.val());
                resolve(res.val());
            });
        });
    }

    self.user_current_activity = function( userId ) {
        // console.log( 'userId==-->>', userId );
        return new Promise(function (resolve) {
            firebase_admin.database().ref('/current-activity/'+userId).once('value', function(res) {
                // console.log( 'curretnt', res.val() );
                resolve(res.val());
            })
        });
    }

    self.is_student_applied_to_course = function(course_id, stu_id) {
        return new Promise(function (resolve) {
            firebase_admin.database().ref('/course_applied/'+course_id+'/'+stu_id).once('value', function(res) {
                resolve(res.val());
            });
        });
    }

    self.mail_data = function(action, additional_data) {
        if( action == 'course_creation' ) {
            return {
                html : `Your course has been created.`,
                sub  : `Course Creation`
            };
        } else if( action == 'course_applied' ) {
            return {
                html : `The course has been applied.`,
                sub  : `Course Applied`
            };
        } else if( action == 'message_sent' ) {
            return {
                html : `You have recieved a message.`,
                sub  : `Message recieved`
            };
        } else if( action == 'user_dropped' ) {
            return {
                html : `You were dropped out of course.`,
                sub  : `Dropped from course`
            }
        }
    }

    self.send_mail = function( mailOptions, nodemailer ) {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'john.clarke852@gmail.com',
                pass: 'navdeep@revinfotech#@!'
            }
        });

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
            res.end( error );
            return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
            res.end( 'Message %s sent: %s', info.messageId, info.response );
        });
    }

    self.message_email_user = function( nodemailer) {

    }

}

module.exports = handle_request;
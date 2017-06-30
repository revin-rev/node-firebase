var express        = require('express');
var _              = require('lodash');
var dateFns        = require('date-fns');
var fs             = require('fs');
//var bodyParser   = require('body-parser');
var router         = express.Router();
var formidable     = require('formidable');
var form           = new formidable.IncomingForm();
var fs             = require('fs');

const nodemailer   = require('nodemailer');

var user_name_pass = require('.././pass.json');

var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage : storage }).array('image',10); //you can change limit for array

//firebase init
var firebase = require("firebase-admin");
var firebase_json = require('.././firebase.json');
firebase.initializeApp({
    databaseURL: 'https://guru-70110.firebaseio.com',
    credential: firebase.credential.cert(firebase_json), //this is file that I downloaded from Firebase Console
});
var firstPage = firebase.database().ref('site_setting').child('firstPage');
var socialSetting = firebase.database().ref('site_setting/firstPage/socialSetting');
var usersDetails = firebase.database().ref('users_details');

// custom handle_request functions
var request_functions = require('./handle_request');
var request_fns_obj = new request_functions(firebase, _, dateFns);
// console.log( request_fns_obj.delete_user() );

// helper functions
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// var bs64 = base64_encode('./uploads/Menu_002.png');
// console.log('bs64==-->>', bs64);/** */

router.get('/login', function(req, res) {
  // console.log(req.session);
  // console.log('usernamepass', user_name_pass);
  res.render('login', {});
});

router.post('/login', function(req, res) {
  if( user_name_pass.user == req.body.email && user_name_pass.pass == req.body.password ) {
    req.session.token_custom = 'abc';
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
  // console.log( 'req.session', req.session );
});

//end of firebase init
router.get('/', function (req, res) {
  if( req.session.token_custom != 'abc' ) {
    // console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }
  firstPage.child('static').once('value',function(value){
    firstPage.child('dynamic').once('value', function(dyn_value) {
      var firstPageData = value.val();
      var first_page_dyn_value = dyn_value.val();
      // if( first_page_dyn_value == null ) {
      //   first_page_dyn_value
      // }
      // console.log( 'first_page_dyn_value==-->>>>>', first_page_dyn_value );
      res.render('FrontPage',{'title':'Front Page Design','active1':'active','firstPageData':firstPageData, dyn_data: first_page_dyn_value});
    })
  });
});

router.post('/', upload, function (req, res) {
  if( req.session.token_custom != 'abc' ) {
    console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }
    /*console.log( 'req.body==-->>>', req.body );*/
    /*console.log( 'files==-->>>>', req.files );
    console.log( 'body ==-->>>>', req.body );*/

    var image_length = req.files.length;
    var image_name   = [];
    var multiData    = [];
    /*for (var i = 0; i < req.body.title.length; i++) {
      console.log({
        'title'      : req.body.title[i],
        'subtitle'   : req.body.subtitle[i],
        'description': req.body.description[i]
      });
      // dynamic.push();
    }*/
    
    // Start : Firebase storage
    // firebase_storage_ref = firebase.storage().ref();
    

    /*mountainsRef = firebase_storage_ref.child( 'admin/bulleting_images/'+file.name);
    mountainsRef*/
    // End : Firebase storage

    // console.log( 'multiData ==-->>', multiData );
    // res.redirect('/');
    // return ;
    var student_benefit = [];
    for (var j = 0; j < req.body.student_benefit.length; j++) {
      student_benefit.push({'index':j, 'benefit':req.body.student_benefit[j]});
    }
     var educator_benefit = [];
    for (var k = 0; k < req.body.educator_benefit.length; k++) {
      educator_benefit.push({'index':k, 'benefit':req.body.educator_benefit[k]});
    }
    firstPage.child('static').set({
      'search'           : req.body.search,
      'educator_work'    : req.body.educator_work,
      'educator_register': req.body.educator_register,
      'educator_publish' : req.body.educator_publish,
      'educator_enroll'  : req.body.educator_enroll,
      'educator_benefit' : educator_benefit,
      'student_search'   : req.body.student_search,
      'student_register' : req.body.student_register,
      'student_work'     : req.body.student_work,
      'student_enroll'   : req.body.student_enroll,
      'student_apply'    : req.body.student_apply,
      'student_benefit'  : student_benefit,
      'about_us'         : req.body.about_us
    }).then(() => {
      res.redirect('/');
    })
});

router.get('/bulletin', function(req, res) {
  if( req.session.token_custom != 'abc' ) {
    // console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }
  // console.log( 'req.session', req.session );
  // console.log( 'files==-->>>>', req.files );
  // console.log( 'body ==-->>>>', req.body );
  firstPage.child('dynamic').once('value', function(value) {
    var dyn = value.val();
    // console.log( dyn );
    var output = [],
    count = 1;
    for( i in dyn ) {
      output.push({
        title : dyn[i].t,
        sub   : dyn[i].s,
        des   : dyn[i].d,
        image : dyn[i].i,
        key   : i,
        count : count
      })
      count++;
    }
    res.render('bulletin', { title: 'Bulletin', 'active4':'active', dyn : output })
  });
})

router.get('/social', function (req, res) {
  if( req.session.token_custom != 'abc' ) {
    // console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }
  socialSetting.once('value',function(value){
    var socialData = value.val(); 
    res.render('SocialPage',{'title':'Social Settings','active2':'active','socialData':socialData});
  });
});

router.get('/users', function (req, res) {
  if( req.session.token_custom != 'abc' ) {
    // console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }
  usersDetails.once('value',function(value){
    var users        = value.val();
    var output_users = [],
    counter          = 0;
    for(i in users) {
      counter++;
      output_users.push({
        sno         : counter,
        userId      : i,
        full_name   : users[i].firstname+' '+users[i].lastname,
        email       : users[i].email,
        username    : users[i].username,
        usertype    : users[i].usertype,
        login_status: users[i].ls
      });
      // console.log( i, users[i] );
    }
    // console.log( users );
    res.render('UsersPage',{'title':'Users','active3':'active', 'users': output_users});
  });
});

/*router.post('/social', function (req, res) {
  // form.parse(req, function(err, fields, files) {
    console.log( req.body );
    res.send('done');
    if (err) {
      console.log( err );
      res.send('There is a problem with the server.');
      return ;
      // next(err);
    }
    socialSetting.set({
      fb     : fields.fb,
      twitter: fields.twitter,
      youtube: fields.youtube,
      t      : fields.t,
      other  : fields.other
    });
    res.redirect('/social');
  // });
});*/

router.get('/user-details', function (req, res) {
  if( req.session.token_custom != 'abc' ) {
    // console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }
  // console.log( req.query );
  request_fns_obj.get_user_details(req.query.user_id, function (output) {
    var return_out = {
      address1   : output.address1,
      address2   : output.address2,
      city       : output.city,
      email      : output.email,
      firstname  : output.firstname,
      lastname   : output.lastname,
      phonenumber: output.phonenumber,
      username   : output.username,
      usertype   : output.usertype,
      zipcode    : output.zipcode,
      userId     : req.query.user_id
    };
    // console.log(return_out);
    res.render('user_details', { title: output.firstname+' '+output.lastname, details: return_out });
  });
});

router.get('/user-courses', function(req, res) {
  if( req.session.token_custom != 'abc' ) {
    // console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }
  console.log('req.query.user_id==-->>', req.query.user_id);
  request_fns_obj.get_user_courses(req.query.user_id, function (output) {
    // console.log( output );/**/
    var user_courses = [];
    var counter = 1;
    for( i in output ) {
      // var res = str.substr(1, 4); //.substr(0, 20)
      user_courses.push({
        course_name      : output[i].cn.length > 20 ? output[i].cn.substr(0, 20)+'..' : output[i].cn,
        date_added       : request_fns_obj.get_date_from_timestamp( output[i].da ),
        counter          : counter,
        courseId         : i,
        course_completion: output[i].cc == 1 ? 1 : 0,
        course_start     : output[i].s,
        course_end       : output[i].e
      });
      counter++;
    }
    // console.log( user_courses );
    res.render('UserCourses', {
      title: 'User Courses',
      user_courses: user_courses,
      user_name   : req.query.user_name,
      userId      : req.query.user_id,
      status      : req.query.status
    })
  })
});

router.get('/student-courses', function(req, res) {
  if( req.session.token_custom != 'abc' ) {
    // console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }
  function student_course_object(course_name, applied_requested_date, counter_i, course_id, user_id) {
    return {
        course_name      : course_name,
        date_requested   : request_fns_obj.get_date_from_timestamp( applied_requested_date ),
        counter          : counter_i,
        courseId         : course_id,
        course_key       : applied_requested_date,
        user_id          : user_id
    }
  }
  request_fns_obj.get_student_courses(req.query.user_id)
  .then((output) => {
    // console.log( 'output', output );
    var user_courses = {
      courses_applied_requested: [],
      courses_complete         : []
    };
    if( output != null ) {
      var counter = 1;
      for( i in output['0_2'] ) {
        user_courses.courses_applied_requested.push(student_course_object( output['0_2'][i].cn, output['0_2'][i].t, counter, output['0_2'][i].cid, req.query.user_id ));
        counter++;
      }
      counter = 1;
      for( i in output['1'] ) {
        user_courses.courses_complete.push(student_course_object( output['1'][i].cn, output['1'][i].t, counter, output['1'][i].cid, req.query.user_id ));
        counter++;
      }
    }
    // console.log( 'output-==>>', user_courses );
    res.render('StudentCourses', { title: 'Student Courses', user_courses: user_courses })
  });
});

router.get('/cron', function(req, res) {
  request_fns_obj.cron2().then(function () {
    res.send('done');
  });
});

router.get('/current-activity', function (req, res) {
  if( req.session.token_custom != 'abc' ) {
    // console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }
  // console.log('req.query.user_id==-->>', req.query.user_id);
  request_fns_obj.user_current_activity(req.query.user_id).then((current_activity_0) => {
    output  = [];
    // console.log( current_activity_0 );
    
    current_activity_0 = _.reverse(current_activity_0);
    
    // console.log( current_activity_0 );
    
    counter = 1;
    for(let i in current_activity_0) {
      output.push({
        sn : counter,
        m  : current_activity_0[i].m
      });
      // console.log( 'current_activity_0[i]', current_activity_0[i].m );
      counter++;
    }
    
    // console.log( 'current_activity_0', output );
    res.render('CurrentActivity', { title: 'Current Activity', current_activity : output });
  });
});

router.get('/contact-us', function (req, res) {
  if( req.session.token_custom != 'abc' ) {
    // console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }
  firebase.database().ref('contact_us').once('value', function (value) {
      var contacts = value.val();
      var output = [];
      for( var i in contacts) {
        output.push({
          k : i,
          d : contacts[i].d,
          e : contacts[i].e,
          n : contacts[i].n,
          s : contacts[i].s
        });
      }
      res.render('contacts',{'title':'Contacts','active5':'active', 'contacts':output});
      return ;
  });
  return ;
  // res.end( 'listing' );
});

router.get('/ajax', function (req, res) {
  if( req.session.token_custom != 'abc' ) {
    // console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }

  // testing empty record
  for(k in req.query) {
    if(req.query[k] == '') {
      res.redirect('/');
      return ;      
    }
  }

  // console.log('req.body', req.query);
  var output = {};
  if( req.query.action == 'delete_user' ) {
    output = request_fns_obj.delete_user(req.query.user_id, req.query.user_type).then((user_delete_result) => {
      // console.log('delete');
      res.send( user_delete_result.output );
    });
    return ;
  } else if( req.query.action == 'get_course_data' ) {
    request_fns_obj.get_user_single_course(req.query.course_id, function (course_detail) {
      // console.log( 'in routing', course_detail ); 

      var course_data = {
        address_1              : course_detail.address_1 ? course_detail.address_1 : '',
        address_2              : course_detail.address_2 ? course_detail.address_2 : '',
        capacity               : course_detail.capacity ? course_detail.capacity : '',
        courseDescription      : course_detail.courseDescription ? course_detail.courseDescription : '',
        course_complete_status : course_detail.course_complete_status ? course_detail.course_complete_status : '',
        course_description     : course_detail.course_description ? course_detail.course_description : '',
        course_title           : course_detail.course_title ? course_detail.course_title : '',
        courselevel            : course_detail.courselevel ? course_detail.courselevel : '',
        date_added             : course_detail.date_added ? course_detail.date_added : '',
        fees                   : course_detail.fees ? course_detail.fees : '',
        frequency              : course_detail.frequency ? course_detail.frequency : '',
        generalComments        : course_detail.generalComments ? course_detail.generalComments : '',
        instructor_name        : course_detail.instructor_name ? course_detail.instructor_name : '',
        instructor_orginization: course_detail.instructor_orginization ? course_detail.instructor_orginization : '',
        instructor_profile     : course_detail.instructor_profile ? course_detail.instructor_profile : '',
        last_day_to_apply      : course_detail.last_day_to_apply ? course_detail.last_day_to_apply : '',
        location               : course_detail.location ? course_detail.location : '',
        pre_requisit           : course_detail.pre_requisit ? course_detail.pre_requisit : '',
        quantity               : course_detail.quantity ? course_detail.quantity : '',
        start_end_day          : { end_day: course_detail.start_end_day.end_day ? course_detail.start_end_day.end_day : '', start_day: course_detail.start_end_day.start_day ? course_detail.start_end_day.start_day : '' },
        user_id                : course_detail.user_id
      }
      course_data.timings = [];
      for(i in course_detail.timings) {
        // console.log( i, course_detail.timings[i] );
        course_data.timings.push({
          start : {
            day: course_detail.timings[i].start.day ? course_detail.timings[i].start.day : '', hour: course_detail.timings[i].start.hour ? course_detail.timings[i].start.hour : '', minute: course_detail.timings[i].start.minute ? course_detail.timings[i].start.minute : ''
          },
          end : {
            day: course_detail.timings[i].end.day ? course_detail.timings[i].end.day : '', hour: course_detail.timings[i].end.hour ? course_detail.timings[i].end.hour : '', minute: course_detail.timings[i].end.minute ? course_detail.timings[i].end.minute : ''
          }
        });
      }
      // console.log( course_data, course_data.timings );
      res.send( course_data );
      return ;
    });
  } else if( req.query.action == 'student_applied' ) {
    request_fns_obj.get_stu_from_course_id( req.query.course_id ).then(function(student_applied_to_course) {
      var output = [];
      for( d in student_applied_to_course) {
        output.push({
          student_id : d,
          course_id  : req.query.course_id,
          email      : student_applied_to_course[d].e,
          name       : student_applied_to_course[d].n,
          status     : student_applied_to_course[d].s
        })
      }
      res.send( output );
    });
  } else if( req.query.action == 'logout' ) {
    // console.log( req.session );
    req.session.token_custom = '';
    res.redirect('/login');
    // res.send('logging out');
  }
  // res.send('empty');
});

router.post('/ajax', upload, function (req, res) {
  if( req.session.token_custom != 'abc' ) {
    // console.log('========------->>redirect', req.session.token_custom);
    res.redirect('/login');
    return ;
  }

  // testing empty record
  if( req.body.action != 'social' ) {
    for(k in req.body) {
      if(req.body[k] == '') {
        res.redirect('/');
        return ;      
      }
    }
  }
  
  // console.log('--------------=========--------------ajax post');
  //form.parse(req, function(err, fields, files) {
    // console.log( '==== in form ' );
    console.log( 'fields-===>>', req.body );
    if( req.body.action == 'user_details_edit' ) {
      // console.log( '-=-=-=-=',  req.body );
      request_fns_obj.update_user_data(req.body, req.body.user_id).then(function (result) {
        if(result.output == 1) {
          // res.send('Hello==>>'+str);
          res.redirect('/user-details?user_id='+req.body.user_id);
        }
      });
    } else if( req.body.action == 'edit_course' ) {
      request_fns_obj.update_course(req.body, req.body.course_id).then(function() {
        // res.send('Working');
        res.redirect('/user-courses?user_id='+req.body.user_id);
      });
    } else if( req.body.action == 'student_delete_course' ) {
      console.log( 'student delete courseeee' );
      return request_fns_obj.delete_course_from_student(req.body.course_key, req.body.status, req.body.user_id, req.body.course_id)
      .then(function (student_delete_result) {
        console.log( 'student_delete_result', student_delete_result );
        res.send('1');
        return ;
      }, function(err) {
        console.log('errrrrr', err)
      });      
      // res.send('yo');
    } else if( req.body.action == 'delete_course_from_studentId_and_courseId' ) {
      console.log( req.body );
      request_fns_obj.delete_course_from_studentId_and_courseId( req.body.course_id, req.body.user_id, function(course_key) {
        request_fns_obj.delete_course_from_student( course_key, '0_2', req.body.user_id, req.body.course_id );
        res.send('done');
        // console.log( 'course_key==-->>', course_key );
      });
    } else if( req.body.action == 'bulletin_data' ) {
      // console.log( 'files==-->>>>', req.files );
      
      // console.log( 'File ==-->>>>', bit64_file );
      console.log( 'key ==-->>>>', req.body.key );
      console.log( 'key ==-->>>>', req.body );
      dynamic = firstPage.child('dynamic');
      if(req.body.key != undefined ) {
        insert = {
          t : req.body.title,
          s : req.body.subtitle,
          d : req.body.description
        };
        if( req.files[0] ) {
          bit64_file = 'data:'+req.files[0].mimetype+';base64, '+base64_encode('./'+req.files[0].path);
          insert.i = bit64_file
        }
        dynamic.child(req.body.key).update(insert).then(() => {
          res.redirect('/bulletin');
        })
      } else {
        console.log('data pushed');
        bit64_file = 'data:'+req.files[0].mimetype+';base64, '+base64_encode('./'+req.files[0].path);
        dynamic.push({
          t : req.body.title,
          s : req.body.subtitle,
          d : req.body.description,
          i : bit64_file
        }).then(() => {
          res.redirect('/bulletin');
        });
      }
    } else if( req.body.action == "get_bulletin" ) {
      // console.log( 'bulletin_id==-->>>', req.body.bulletin_id );
      dynamic = firstPage.child('dynamic').orderByKey().equalTo(req.body.bulletin_id);
      dynamic.once('value', function(value) {
        var bulletin_data_for_edit = value.val();
        var output = {};
        for( i in bulletin_data_for_edit ) {
          output = {
            title : bulletin_data_for_edit[i].t,
            subtitle : bulletin_data_for_edit[i].s,
            description : bulletin_data_for_edit[i].d
          };
        }
        // console.log( 'bulletin_data_for_edit', output );
        res.send(output);
      });
    } else if( req.body.action == 'bulletin_delete' ) {
      firstPage.child('dynamic').child(req.body.bulletin_id).remove().then(() => {
        res.send('done');
      });
    } else if( req.body.action == 'teacher_course_delete' ) {/** */
      console.log('course id', req.body.course_id);
      firebase.database().ref('course/'+req.body.course_id).remove().then(() => {
        firebase.database().ref('user_courses/'+req.body.userId+'/'+req.body.course_id).remove().then(() => {
          res.send('done yo');
        })
      });
    } else if( req.body.action == "add_student_to_course" ) {
      console.log( 'req.body==--->>>', req.body );

      return usersDetails.orderByChild('email').equalTo(req.body.add_student).once('value', function(value) {
          var user_details = value.val();
          console.log( 'user_details', user_details );
          if( user_details != null ) {
            for( i in user_details ) {
              var student_id = i;
              var now_date = new Date().getTime();

              // here i have not checked if the user is appled to the course as then it will also fetch those record on which user have just appled, here when user will endter student id, it will straigh away apply to the job.
              return request_fns_obj.is_student_applied_to_course(req.body.courseid, student_id).then(function(is_stu_app_output) {

                console.log( 'is_stu_app_output', is_stu_app_output );
                if( is_stu_app_output == null ) {
                  console.log( 'course applied', 'course_applied/'+req.body.courseid+'/'+student_id, {
                    e : req.body.add_student,
                    n : user_details[i].firstname+' '+user_details[i].lastname,
                    ph: user_details[i].phonenumber,
                    s : 1
                  });
                  console.log( 'course applied1', 'course_applied1/'+student_id+'/0_2/'+now_date, {
                    ce: req.body.course_end,
                    cs: req.body.course_start,
                    cid: req.body.courseid,
                    cn : req.body.course_name,
                    s : 1, 
                    t : now_date
                  });
                  return firebase.database().ref('course_applied/'+req.body.courseid+'/'+student_id).set({
                    e : req.body.add_student,
                    n : user_details[i].firstname+' '+user_details[i].lastname,
                    ph: user_details[i].phonenumber,
                    s : 1
                  }).then(() => {
                    console.log('course applied set.');
                    return firebase.database().ref('course_applied1/'+student_id+'/0_2/'+now_date).set({
                      ce: req.body.course_end,
                      cs: req.body.course_start,
                      cid: req.body.courseid,
                      cn : req.body.course_name,
                      s : 1, 
                      t : now_date
                    });
                  }).then(() => {
                    console.log( 'course applied1 set' );
                    res.redirect('/user-courses?user_id='+req.body.course_owner_id+'&user_name='+encodeURI(req.body.course_owner_name));
                  }).catch((err) => {
                    console.log( 'errrrorrr=-->>', err );
                  });
                } else {
                  console.log('allready added');
                  // status = 1 => course already applied
                  res.redirect('/user-courses?user_id='+req.body.course_owner_id+'&user_name='+encodeURI(req.body.course_owner_name)+'&status=1');
                }
              });
            }
          } else {
            res.redirect('/user-courses?user_id='+req.body.course_owner_id+'&user_name='+encodeURI(req.body.course_owner_name)+'&status=2');
          }
      });
    } else if( req.body.action == 'social' ) {
      console.log( 'req.body', req.body );
      socialSetting.set({
        fb     : req.body.fb,
        twitter: req.body.twitter,
        youtube: req.body.youtube,
        t      : req.body.t,
        other  : req.body.other
      }).then(() => {
        res.redirect('/social');
        // res.send('done in ajax');
      });
    } if( req.body.action == 'remove_contact' ) {
      if( req.body.id ) {
        firebase.database().ref('contact_us').child(req.body.id).remove().then((remove_res) => {
          res.send('done');
        }, (remove_erro) => {
          res.send('err');
        });
      } else {
        res.send('err');
      }
    } else {
      res.send('Wrong input action');
    }
  //});
});

/**
 *  MAIL_DRIVER=smtp
    MAIL_HOST=smtp.gmail.com
    MAIL_PORT=587
    MAIL_USERNAME=john.clarke852@gmail.com
    MAIL_PASSWORD=navdeep@revinfotech#@!
    MAIL_ENCRYPTION=TLS
 */
router.post('/send-mail', upload, function (req, res) {
  // console.log( 'req', req );
  if( req.body.action && req.body.to ) {
    var additional_data = {};
    var mail_data = request_fns_obj.mail_data(req.body.action, additional_data);

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"WhereisGuru" <john.clarke852@gmail.com>', // sender address
        to: req.body.to, //'jatin@revinfotech.com', // list of receivers
        subject: mail_data.sub, // Subject line
        // text: 'Hello world ?', // plain text body
        html: mail_data.html // html body
    };

    // first mail sent
    request_fns_obj.send_mail( mailOptions, nodemailer );

    if( req.body.action == 'course_applied' ) {
      let mailOptions = {
          from: '"WhereisGuru" <john.clarke852@gmail.com>', // sender address
          to: req.body.from, // list of receivers
          subject: mail_data.sub, // Subject line
          // text: 'Hello world ?', // plain text body
          html: 'You have applied to course' // html body
      };
      // second mail sent
      request_fns_obj.send_mail( mailOptions, nodemailer );
    }

    res.end('send');
  }
});
module.exports = router;

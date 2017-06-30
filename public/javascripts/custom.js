jQuery('.educator-plus-button,.student-plus-button').click(function(e){
	e.preventDefault();
	var newName = '';
	if(jQuery(this).attr('class') == 'btn btn-info educator-plus-button') {
		newName = 'educator_benefit';
	} else {
		newName = 'student_benefit';
	}
	var data = '<div class="row marginTop"><div class="col-md-10"><input type="text" class="form-control '+newName+'" id="'+newName+'" name="'+newName+'" placeholder="Enter How Does It Benefit"></div><div class="col-md-2"><button class="btn remove-button" title="Remove"><i class="fa fa-fw fa-times-circle"></i></button></div></div>';
	jQuery(this).parent().parent().parent().append(data);
});
jQuery('body').on('click','.remove-button',function(e){
	e.preventDefault();
	jQuery(this).parent().parent().remove();
});
jQuery('.Add-More').click(function(e){
	e.preventDefault();
	var data = '<div class=""><div class="row"><button class="btn btn-danger pull-right remove-button"><i class="fa fa-fw fa-power-off"></i></button></div><div class="col-md-6"><div class="form-group"><label for="title">Title :</label><input type="text" class="form-control title" id="title" name="title" placeholder="Enter Title"></div><div class="form-group"><label for="image">Image :</label><input type="file" class="form-control image" id="image" name="image"></div></div><div class="col-md-6"><div class="form-group"><label for="subtitle">Sub-Title :</label><input type="text" class="form-control subtitle" id="subtitle" name="subtitle" placeholder="Enter Sub-Title"></div><div class="form-group"><label for="description">Descriptions :</label><textarea type="text" class="description form-control" id="description" name="description" placeholder="Enter Description" col="75" rows="3"></textarea></div></div></div>';
	jQuery('.append-data').append(data);
});
jQuery(document).ready(function(){
 	jQuery('.example2').DataTable({
      "paging": true,
      "lengthChange": false,
      "searching": false,
      "ordering": true,
      "info": true,
      "autoWidth": false
    });
});


function replaceAll(str, find, replace) {
	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function get_date_from_timestamp( timestamp ) {
	let date            = new Date(timestamp),
	start_date_of_month = date.getDate(), 	    // 1
	current_month       = date.getMonth()+1, 	// as in getMonth month starts with 0
	current_year        = date.getFullYear();   // 2016
	return start_date_of_month+'/'+current_month+'/'+current_year;
}

/**
 * This function is used for educator
 */
function student_applied_to_course(course_id) {
	var str = `
	<tr class="display_{course_id}">
		<td>{counter}</td>
		<td>{stu_name}</td>
		<td>{email}</td>
		<td>
			<span class="btn btn-danger" onclick="delete_student_who_applied_to_course('{course_id}', '{user_id}')">Delete</span>
		</td>
	</tr>
	`;
	return $.ajax({
		method : 'get',
		url : '/ajax',
		data : { action: 'student_applied', course_id : course_id }
	}).then(function(res) {
		// console.log('res==--', res);
		var temp = '',
		output = ''
		stu_count = 1;
		for(i in res) {
			temp = str;
			temp = replaceAll(temp, '{counter}', stu_count );
			temp = replaceAll(temp, '{stu_name}', res[i].name );
			temp = replaceAll(temp, '{email}', res[i].email );
			temp = replaceAll(temp, '{course_id}', res[i].course_id );
			temp = replaceAll(temp, '{user_id}', res[i].student_id );
			output += temp;
			stu_count++;
		}
		return output;
	});
}
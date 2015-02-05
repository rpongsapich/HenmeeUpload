var SITEBASEURL = 'http://henmee.dll.in.th/';
var MAXIMUM_FILE_SIZE = 3000000; // 3M
var XID = parseInt(/xid=(\d+)/.exec(document.cookie)[1]) || false;
//console.log('henmeeupload',XID);
if(XID) { // logged in user
	console.log("หมีหมี่หมี้ activated!");
	$('body').append('<div id="hmu_status"></div>');
	if(document.readyState=='complete') {
		// delay 1 sec to make sure everything loaded
		window.setTimeout(mod_upload, 1000);
	} else {
		window.onload = function() { 
			// delay 1 sec to make sure everything loaded
			window.setTimeout(mod_upload, 1000);
		}
	}
}

function mod_upload() {
	$('input[name="poster"], textarea').removeClass('hm_dropsite').addClass('hmu_drop');
	// make dropable
	$(document).on('dragenter dragexit dragover', '.hmu_drop', function(event){
		event.preventDefault();
		event.stopPropagation();
	});

	$(document).on('drop', '.hmu_drop', function(event){
		// if drop target is textbox then allow only one image to drop
		// if drop target is textarea then allow multiple files to drop
		var limitToOne = ( this.tagName.toLowerCase()=='input' );

		// for later reference
		var that = this;

		if(event.originalEvent.dataTransfer) {
			if(event.originalEvent.dataTransfer.files.length>0) {
				event.preventDefault();
				event.stopPropagation();
				// if drop multiple files on textbox
				if(limitToOne && event.originalEvent.dataTransfer.files.length>1) {
					alert("ช่องนี้ใส่ได้รูปเดียวจ้า!");
					return; // exit function
				}

				var formData = new FormData();
				var fileList = [];
				var imgCount = 0;

				// clear all status
				$('#hmu_status').empty().show();

				for(i=0; i<event.originalEvent.dataTransfer.files.length; i++) {
					var file = event.originalEvent.dataTransfer.files[i];
					if(file.size > MAXIMUM_FILE_SIZE) {
						$('#hmu_status').append('<div>File [ '+file.name+' ] is too big.</div>');
					} else {
						// allow only image files
						if(/^image\/.*/.test(file.type)) { 
							formData.append('image-'+imgCount, file);
							fileList.push(file.name);
							++imgCount;
						} else {
							$('#hmu_status').append('<div>File [ '+file.name+' ] is not an image file.</div>');
						}
					}
				}

				$('#hmu_status').append('<div class="g">Uploading '+fileList.length+' file(s).</div>');
				fileList.forEach(function(i){
					$('#hmu_status').append('<div class="g">Uploading [ '+i+' ]');
				});

				if(imgCount > 0) {
					$.ajax({
						url: SITEBASEURL+"henmeeupload.php",
						type: "POST",
						processData: false,
						cache: false,
						contentType: false,
						data: formData,
						success: function(R) {
							R = JSON.parse(R);
							if(typeof(R)=='object' && R.length>0) {
								R.forEach(function(r){
									//var i = fileList.indexOf(r.src);
									//fileList[i] = r.url;
									if(that.tagName.toLowerCase()=='input') {
										$(that).val(r.url);
									} else if(that.name=='body') {
										$(that).val(function(o,v){ return v+'[img]'+r.url+'[/img]'; });
									} else {
										$(that).val(function(o,v){ return v+r.url+' '; });
									}
								});
								console.log(fileList);
							}
							$('#hmu_status').empty().hide();
						}
					})
				}
			}
		}
	});
};

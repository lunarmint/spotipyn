
let testdata = '[{"123456789": { "mode": "absolute", "minutes": 30, "seconds": 50, "message": "Take out the trash."}}, {"123456789": {"mode": "absolute", "minutes": 40, "seconds": 25, "message": "Do your homework."}}]';

let uid = 123456789;

//let currentsong = spotify.getMyCurrentPlayingTrack();

function displayData(){
	
	let tp1 = '';
	
	$(jQuery.parseJSON(testdata)).each(function() {
		tp1 += '<div id = pins>'
		let mode = this[uid].mode;
		tp1 += "Pin Type:" + mode + " ";
		let minutes = this[uid].minutes;
		tp1 += minutes + ":";
		let seconds = this[uid].seconds;
		tp1 += seconds + " ";
		let message = this[uid].message;
		tp1 += message ;
		tp1 += '</div>'
		tp1 += '<br>'
	});
	
	document.write(tp1);
	
}




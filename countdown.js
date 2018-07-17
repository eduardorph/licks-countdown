function getTimeRemaining(endtime){
  
  var t = Date.parse(endtime) - Date.parse(convertDateToUTC(new Date()));
  var seconds = Math.floor( (t/1000) % 60 );
  var minutes = Math.floor( (t/1000/60) % 60 );
  var hours = Math.floor( (t/(1000*60*60)) % 24 );
  var days = Math.floor( t/(1000*60*60*24) );
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}


function initializeClock(endtime, clock_location, status, add_class, remove_class){

  clock_location.find('.clock_status').removeClass(remove_class);
  clock_location.find('.clock_status').addClass(add_class);

  var timeinterval = setInterval(function(){
    var t = getTimeRemaining(endtime);

    var show_message = ' '+status+' in ';

    if (t.days > 0) {
    	show_message += t.days+" d ";
    }

    show_message += (t.hours < 10 ? '0':'')+t.hours+":"+(t.minutes < 10 ? '0':'')+t.minutes+":"+(t.seconds < 10 ? '0':'')+t.seconds;

    clock_location.find('.status_clock_text').html(show_message);

    if(t.total==0){
      // clearInterval(timeinterval);
      // location.reload();
      	clock_city('rio_de_janeiro');
		clock_city('sao_paulo');
		clock_city('tokyo');
    }
  },1000);
}


function when_monday(){
	var will_monday = convertDateToUTC(new Date());
	will_monday.setDate(will_monday.getDate() + (1 + 7 - will_monday.getDay()) % 7);

	return {
	    'year': will_monday.getFullYear(),
	    'month': (will_monday.getMonth() +1),
	    'date': will_monday.getDate(),
	    'full': will_monday,
	    'open_or_close': will_monday.getFullYear()+"-"+(will_monday.getMonth() +1)+"-"+will_monday.getDate()
	};
}

function go_tomorrow(){
	var tomorrow = convertDateToUTC(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));

	return {
	    'year': tomorrow.getFullYear(),
	    'month': (tomorrow.getMonth() +1),
	    'date': tomorrow.getDate(),
	    'full': tomorrow,
	    'open_or_close': tomorrow.getFullYear()+"-"+(tomorrow.getMonth() +1)+"-"+tomorrow.getDate()
	};
}

function changeH(time, hour_to_sub){
	var h = time.split(':');
	var new_h = (h[0]-hour_to_sub) < 10 ? '0'+(h[0]-1) : (h[0]-1);
	return new_h+':'+h[1];
}


Date.prototype.stdTimezoneOffset = function() {
  var jan = new Date(this.getFullYear(), 0, 1);
  var jul = new Date(this.getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dst = function() {
  return this.getTimezoneOffset() < this.stdTimezoneOffset();
}


function convertDateToUTC(date) { 
	return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); 
}


function clock_city(city_id){
	var now = new Date();

	var today = convertDateToUTC(now);

	console.log(today);

	var y = today.getFullYear();
	var m = (today.getMonth() +1);
	var d = today.getDate();

	var location_city = $("#"+city_id);


	var city_open_time = location_city.find('.open_time').text();
	var city_close_time = location_city.find('.close_time').text();
	var city_close_date = location_city.find('.close_date').text();

	if (city_id == 'rio_de_janeiro') {
		var local_now = moment.tz(new Date(), "America/Sao_Paulo");
	} else {
		var local_now = moment.tz(new Date(), "Asia/Tokyo");
	}

	if (local_now.isDST()) {
		console.log('DST TIME: YES');
		city_open_time = changeH(city_open_time, 1);
		city_close_time = changeH(city_close_time, 1);
	}


	// var city_open_deadline = y+"-"+m+"-"+d+" "+city_open_time;
	var city_close_deadline = y+"-"+m+"-"+d+" "+city_close_time;

	console.log("city_open_time "+city_open_time);
	console.log("city_close_time "+city_close_time);
	

	var hora_atual = (today.getHours() < 10 ? '0':'')+today.getHours()+':'+today.getMinutes();

	if (hora_atual >= city_open_time && hora_atual < city_close_time){
		//ABERTO
		console.log(city_id+' aberto');
		initializeClock(city_close_deadline, location_city, 'closing', 'office_open', 'office_closed');
	}else{
		//FECHADO
		console.log(city_id+' fechado');

		var today_check = convertDateToUTC(now);
		today_check.setHours(23,59,59)

		//Verifica se for SEXTA ou FDS
		if ( (today.getDay() +1) == 6 || today.getDay() == 6 || today.getDay() == 0) {	
			var city_open_deadline = when_monday().open_or_close+" "+city_open_time;
			console.log('A');
		}else{
			var city_open_deadline = y+"-"+m+"-"+d+" "+city_open_time;
		}
		console.log("city_open_deadline "+city_open_deadline);
		initializeClock(city_open_deadline, location_city, 'opening', 'office_closed', 'office_open');
	}

	console.log('now '+now);
}


$(document).ready(function() {
	clock_city('rio_de_janeiro');
	clock_city('sao_paulo');
	clock_city('tokyo');
});
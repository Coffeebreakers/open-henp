function henp_update() {
	const preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");

	var henpEnabled = preferencesService.getBoolPref("henp.enabled");
	var targetTime = preferencesService.getCharPref("henp.targetTime");
	var toleranceLimit = preferencesService.getCharPref("henp.limitTime");
	var henpPanel = document.getElementById('henp_panel');
	
	if(!henpEnabled || !targetTime) {
		var disabledMessage = henpGetLocaleString('disabledMessage');
		henpPanel.className = 'disabled';
		henpPanel.firstChild.textContent = disabledMessage;
		return false;
	} else {
		henpPanel.className = '';
	}
	
	// Set o tempo para os mostrar no 'relogio' e a var alertIndex
	var alertIndex = preferencesService.getIntPref("henp.alertIndex");
	if (alertIndex === 0 || alertIndex === undefined) {
		time_hour_stamp(targetTime,toleranceLimit*2,'happyHour1');
	}

	var timeLeftString =  "";
	var now = new Date();
	var timeLeft = new Date(now.getFullYear() +'/' + parseInt(1 +now.getMonth())+'/'+now.getDate() + ' 00:00:00');
	if (alertIndex === 2) {
		timeLeft.setTime(timeLeft.getTime() + ((targetTime - 14 * 60 * 1000)- now.getTime()));
	} else if (alertIndex === 3 || alertIndex === 4) {
		timeLeft.setTime(timeLeft.getTime() + ((targetTime - (-1 * 60 * 1000))- now.getTime()));
	} else {
		timeLeft.setTime(timeLeft.getTime() + ((targetTime - 29 * 60 * 1000)- now.getTime()));
	}
	console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	console.logStringMessage('alertIndex = ' + alertIndex);
	
	var hoursLeft = timeLeft.getHours();
	var minutesLeft = timeLeft.getMinutes();
	
	if((timeLeft.getDate() == now.getDate()) && (hoursLeft >= 1 || minutesLeft >= 1)) {
		if(hoursLeft > 0) { timeLeftString += hoursLeft + 'h ' }
		if(minutesLeft > 1 || (hoursLeft > 0 && minutesLeft > 0)) { timeLeftString += ((minutesLeft >= 10)?minutesLeft:('0' + minutesLeft)) + 'm ' }
		if(hoursLeft == 0 && minutesLeft <= 1 && timeLeft.getSeconds() > 0) {
			timeLeftString += timeLeft.getSeconds() + 's';
		}
	} else {
		timeLeftString = '0';
	}
	timeLeftString = timeLeftString.replace(/\s$/,'') ;
	
	var timeToDeadline = Math.ceil((targetTime - now.getTime()) / 1000);
	var firstAlertTime = timeToDeadline - ((toleranceLimit * 2 * 60) + 5);
	var minimumTime = timeToDeadline - (toleranceLimit * 2 * 60);
	var exactTime = timeToDeadline - (toleranceLimit * 60);
	var lastAlertTime = timeToDeadline - (5 * 60);
		
	if(timeToDeadline >= 0) { // Display time left
		var countdownPanel = document.getElementById('henp_countdown_panel');
		countdownPanel.textContent = henpGetLocaleString('remaining') + ' ' + timeLeftString ;
		
		if(timeToDeadline < (timeToDeadline - lastAlertTime)) {
			henpPanel.className = 'lastAlertTime';
			if(alertIndex < 4) {
				time_hour_stamp(targetTime,0,'happyHour3');
				alertIndex = henp_alert_status(4);
			}
		} else if(timeToDeadline < (timeToDeadline - exactTime)) {
			henpPanel.className = 'exactTime';
			if(alertIndex < 3) {
				time_hour_stamp(targetTime,0,'happyHour3');
				alertIndex = henp_alert_status(3);
			}
		} else if(timeToDeadline < (timeToDeadline - minimumTime)) {
			henpPanel.className = 'minimumTime';
			if(alertIndex < 2) {
				time_hour_stamp(targetTime,toleranceLimit,'happyHour2');
				alertIndex = henp_alert_status(2);
			}
		} else if(timeToDeadline < (timeToDeadline - firstAlertTime)) {
			henpPanel.className = 'first';
			if(alertIndex < 1) {
				alertIndex = henp_alert_status(1);
			}
		}
		preferencesService.setIntPref("henp.alertIndex", alertIndex);
		
	} else { // Time's up
		preferencesService.setIntPref("henp.alertIndex", 100);
		preferencesService.setBoolPref("henp.enabled", false);
		
		if(alertIndex < 5) {
			if(preferencesService.getBoolPref("henp.alertMethodSound")) {
				henp_play_file();
			}
			
			alert(henpGetLocaleString('alertMessage5'));
		}
	}
}

function time_hour_stamp(targetTime,timeRemain,messageHour){
	timeRemain = (timeRemain !== undefined) ? timeRemain : 30;
	messageHour = (messageHour !== undefined) ? messageHour : 'happyHour1';
	var hourPanel = document.getElementById('henp_hour_panel');
	var hourPanelTime = new Date();
	hourPanelTime.setTime(targetTime);
	hourPanelTime.setMinutes(hourPanelTime.getMinutes() - timeRemain);
	var hourPanelHours = hourPanelTime.getHours();
	var hourPanelMinutes = hourPanelTime.getMinutes();
	hourPanel.textContent = henpGetLocaleString(messageHour) + ' ' + ((hourPanelHours >= 10)?hourPanelHours:('0' + hourPanelHours)) + ':' + ((hourPanelMinutes >= 10)?hourPanelMinutes:('0' + hourPanelMinutes));
}

function henp_alert_status(alertIndex) {
	const preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
	
	if(preferencesService.getBoolPref("henp.alertMethodSound")) {
		henp_play_file();
	}
	
	var promptString = henpGetLocaleString('alertMessage' + alertIndex) + henpGetLocaleString('alertFooter');
	if(!confirm(promptString)){
		alertIndex = 100;
	};
	
	return alertIndex;
}

function henp_play_file(){
		const preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
		
		var player = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound) ;
		var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService) ;
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile) ;
		var fileName = preferencesService.getCharPref("henp.alertSoundFile");
		
		var play = function(fileName) {
			try {
				file.initWithPath(fileName);
				player.play(ios.newFileURI(file)) ;
			}catch(e){ alert(e); }
		}
		
		if(fileName == 'default') { //Default Sound
			var defaultAlertSound = "chrome/content/" + henpGetLocaleString('defaultAlertSound');
			
			try { // Firefox 4 and later;
				Components.utils.import("resource://gre/modules/AddonManager.jsm");
				AddonManager.getAddonByID("horaextra@naopode", function(addon) {
					fileName = addon.getResourceURI(defaultAlertSound).QueryInterface(Components.interfaces.nsIFileURL).file.path;
					play(fileName);
				});
			} catch (e) { // Firefox 3.6 and before;
				var addonPath = Components.classes['@mozilla.org/extensions/manager;1'].getService(Components.interfaces.nsIExtensionManager).getInstallLocation('horaextra@naopode').getItemLocation('horaextra@naopode');
				var defaultAlertSoundURI = ios.newFileURI(addonPath).spec + defaultAlertSound;
				var fileName = ios.newURI(defaultAlertSoundURI, null, null).QueryInterface(Components.interfaces.nsIFileURL).file.path;
				play(fileName);
			}
			
		} else { //User sound
			play(fileName)
		}
}

function henpGetLocaleString(strName) {
	var str = null;
	try {
		var strbundle = document.getElementById('henp_strings');
		str = strbundle.getString(strName);
	} catch (e) {}
	return str;
}

/***** Options screen *****/
function loadTargetForm() {
	const preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
	
	var initialTime = preferencesService.getCharPref("henp.initialTime").split(":");
	var hoursPerDay = preferencesService.getCharPref("henp.hoursPerDay").split(":");
	
	document.getElementById("spinInitialTimeHours").value = initialTime[0];
	document.getElementById("spinInitialTimeMinutes").value = initialTime[1];
		
	document.getElementById("spinHoursPerDayHours").value = hoursPerDay[0];
	document.getElementById("spinHoursPerDayMinutes").value = hoursPerDay[1];
	
	document.getElementById("spinLimitTimeMinutes").value = preferencesService.getCharPref("henp.limitTime");
	//document.getElementById("holidaySaturday").disabled = (preferencesService.getIntPref("henp.workHours") == 1);
	document.getElementById("holidaySaturday").checked = preferencesService.getBoolPref("henp.holidaySaturday");
	document.getElementById("alertMethodSound").checked = preferencesService.getBoolPref("henp.alertMethodSound") ;
	document.getElementById("alertSoundFile").value = preferencesService.getCharPref("henp.alertSoundFile") ;
}

function saveHenpSettings() {
	const preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");

	preferencesService.setCharPref("henp.targetTime", calculateTimes());

	var alertMethodSound = document.getElementById("alertMethodSound");
	var alertSoundFile = document.getElementById("alertSoundFile");
	var holidaySaturday = document.getElementById("holidaySaturday");	
	
	var initialHour = document.getElementById('spinInitialTimeHours').value;
	var initialMinute = document.getElementById('spinInitialTimeMinutes').value;
	preferencesService.setCharPref("henp.initialTime", initialHour + ':' + initialMinute);
	
	var limitMinute = document.getElementById('spinLimitTimeMinutes').value;
	preferencesService.setCharPref("henp.limitTime", limitMinute);
	
	var perDayHour = document.getElementById('spinHoursPerDayHours').value;
	var perDayMinute = document.getElementById('spinHoursPerDayMinutes').value;
	preferencesService.setCharPref("henp.hoursPerDay", perDayHour + ':' + perDayMinute);
	
	preferencesService.setBoolPref("henp.holidaySaturday", holidaySaturday.checked);
	preferencesService.setBoolPref("henp.alertMethodSound", alertMethodSound.checked);
	preferencesService.setCharPref("henp.alertSoundFile", alertSoundFile.value);
	preferencesService.setBoolPref("henp.enabled", true);
	preferencesService.setIntPref("henp.alertIndex", 0);
	
	return true;
}

function calculateTimes() {
	var initHour = parseInt(document.getElementById("spinInitialTimeHours").value,10);
	var initMinutes = parseInt(document.getElementById("spinInitialTimeMinutes").value,10);
	
	var initDate = new Date();
	initDate.setHours(initHour);
	initDate.setMinutes(initMinutes);
	initDate.setSeconds(0);
	initDate.setMilliseconds(0);
	
	var perDayHour = parseInt(document.getElementById('spinHoursPerDayHours').value,10);
	var perDayMinute = parseInt(document.getElementById('spinHoursPerDayMinutes').value,10);
	
	var maxLimitMinutes = parseInt(document.getElementById("spinLimitTimeMinutes").value,10);
	
	var holidayWeek = document.getElementById("holidaySaturday").checked;
	var workHours = perDayHour + 1 ;
	var workMinutes = (holidayWeek) ? 0 : perDayMinute;
	
	var relativeTotalSeconds = (workHours * 3600) + (workMinutes * 60) + (maxLimitMinutes * 60);

	var relativeTargetTime = new Date() ;
	var relativeNumberOfSeconds = initDate.getTime() + (relativeTotalSeconds * 1000);
	relativeTargetTime.setTime(relativeNumberOfSeconds) ;

	return relativeTargetTime.getTime();
}

function henp_hoursPerDayChange() {
	var perDayHour = parseInt(document.getElementById('spinHoursPerDayHours').value,10);
	var perDayMinute = parseInt(document.getElementById('spinHoursPerDayMinutes').value,10);
	var perDay = perDayHour + ':' + perDayMinute;
	var holidaySaturday = document.getElementById('holidaySaturday');
	
	
	if (perDay !== '8:48') {
		holidaySaturday.disabled = true;
		holidaySaturday.checked = false; 
	}
}
/*
function henp_workHoursChange(option) {
	var holidaySaturday = document.getElementById('holidaySaturday');
	holidaySaturday.disabled = (option == 1);
	if(option == 1) { holidaySaturday.checked = false; }
}
*/

function browseSoundFile()
{
	try	{
		var NFP = Components.interfaces.nsIFilePicker;
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(NFP);
		picker.init(window, null, NFP.modeOpen);
		picker.appendFilter("*.wav", "*.wav");
		if(picker.show() == NFP.returnOK)
		{
			document.getElementById("alertSoundFile").value = picker.file.path;
		}
	} catch(e) { alert(e); }
}

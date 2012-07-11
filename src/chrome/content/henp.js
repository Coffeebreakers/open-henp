function henp_update() {
	const preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");

	var henpEnabled = preferencesService.getBoolPref("henp.enabled");
	var targetTime = preferencesService.getCharPref("henp.targetTime");
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
		time_hour_stamp(targetTime,30,'happyHour1');
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
	var firstAlertTime = timeToDeadline - (35 * 60);
	var minimumTime = timeToDeadline - (30 * 60);
	var exactTime = timeToDeadline - (15 * 60);
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
				time_hour_stamp(targetTime,15,'happyHour2');
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
	
	var initialTime = preferencesService.getCharPref("henp.initialTime").split(":") ;
	document.getElementById("spinHours").value = initialTime[0];
	document.getElementById("spinMinutes").value = initialTime[1];
	document.getElementById("workHoursRadioGroup").value = preferencesService.getIntPref("henp.workHours");
	document.getElementById("holidaySaturday").disabled = (preferencesService.getIntPref("henp.workHours") == 1);
	document.getElementById("holidaySaturday").checked = preferencesService.getBoolPref("henp.holidaySaturday");
	document.getElementById("alertMethodSound").checked = preferencesService.getBoolPref("henp.alertMethodSound") ;
	document.getElementById("alertSoundFile").value = preferencesService.getCharPref("henp.alertSoundFile") ;
}

function saveHenpSettings() {
	const preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");

	preferencesService.setCharPref("henp.targetTime", calculateTimes());

	var alertMethodSound = document.getElementById("alertMethodSound") ;
	var alertSoundFile = document.getElementById("alertSoundFile") ;
	var workHours = document.getElementById("workHoursRadioGroup");
	var holidaySaturday = document.getElementById("holidaySaturday");
	preferencesService.setIntPref("henp.workHours", workHours.value) ;
	preferencesService.setBoolPref("henp.holidaySaturday", holidaySaturday.checked) ;
	preferencesService.setBoolPref("henp.alertMethodSound", alertMethodSound.checked) ;
	preferencesService.setCharPref("henp.alertSoundFile", alertSoundFile.value) ;
	
	var initialHour = document.getElementById('spinHours').value;
	var initialMinute = document.getElementById('spinMinutes').value;
	preferencesService.setCharPref("henp.initialTime", initialHour + ':' + initialMinute) ;
	preferencesService.setBoolPref("henp.enabled", true);
	preferencesService.setIntPref("henp.alertIndex", 0);
	
	return true ;
}

function calculateTimes() {
	var initHour = parseInt(document.getElementById("spinHours").value,10) ;
	var initMinutes = parseInt(document.getElementById("spinMinutes").value,10) ;
	
	var initDate = new Date();
	initDate.setHours(initHour);
	initDate.setMinutes(initMinutes);
	initDate.setSeconds(0);
	initDate.setMilliseconds(0);
	
	var slaveMode = document.getElementById("workHoursRadioGroup").value;
	var maxLimitMinutes = 15;
	
	if(slaveMode == 0) {
		var holidayWeek = document.getElementById("holidaySaturday").checked;
		var workHours = 9;
		var workMinutes = holidayWeek ? 0 : 48;
	} else {
		var workHours = 8;
		var workMinutes = 20;
	}
	
	var relativeTotalSeconds = (workHours * 3600) + (workMinutes * 60) + (maxLimitMinutes * 60);

	var relativeTargetTime = new Date() ;
	var relativeNumberOfSeconds = initDate.getTime() + (relativeTotalSeconds * 1000);
	relativeTargetTime.setTime(relativeNumberOfSeconds) ;

	return relativeTargetTime.getTime();
}

function henp_workHoursChange(option) {
	var holidaySaturday = document.getElementById('holidaySaturday');
	holidaySaturday.disabled = (option == 1);
	if(option == 1) { holidaySaturday.checked = false; }
}

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

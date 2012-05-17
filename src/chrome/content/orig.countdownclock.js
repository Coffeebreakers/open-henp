/* ***** BEGIN LICENSE BLOCK *****

	Version: GPL 2.0
	CountdownClock Mozilla Extension -- Displays a clock that counts down to a target date.
	Copyright (C) 2005 Frederic Mercille (countdownclock@mercille.org)

	This program is free software; you can redistribute it and/or
	modify it under the terms of the GNU General Public License
	as published by the Free Software Foundation version 2.0

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

 * ***** END LICENSE BLOCK ***** */

const preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
// const  consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

try {
	cleanPrefs() ;
} catch (e) { }

window.setInterval(countdown_checkTime, 500) ;

/*******************************************************************************
*******************************************************************************/

function cdcGetLocaleString(strName) {
	var str = null;
	try {
		var strbundle = document.getElementById('countdownclock_strings');
		str = strbundle.getString(strName);
	} catch (err) {
		return err ;
		dump("Couldn't get string: " + strName + "\n");
	}
	return str;
}

/*******************************************************************************
*******************************************************************************/
function countdown_checkTime()
{
	var countdownPanel = document.getElementById('countdownclock_panel') ;

	var now = new Date() ;

	var targetTime ;
	targetTime = preferencesService.getCharPref("countdownclock.targetTime") ;

	var theTarget = targetTime.split(":") ;

	targetYear = theTarget[0] ;
	targetMonth = theTarget[1] - 1;
	targetDate = theTarget[2] ;
	targetHours = theTarget[3] ;
	targetMinutes = theTarget[4] ;
	targetSeconds = theTarget[5] ;

	var target = new Date(targetYear, targetMonth, targetDate, targetHours, targetMinutes, targetSeconds) ;

	var units = preferencesService.getCharPref("countdownclock.unitDisplay") ;

	var timeLeft = Math.ceil((target.getTime() - now.getTime()) / 1000) ;
	var theTimeLeft = timeLeft ;

	var displayString = "" ;
	if(preferencesService.getCharPref("countdownclock.displayPrefix").length > 0)
		displayString += preferencesService.getCharPref("countdownclock.displayPrefix") ;

	var hideNullUnits = preferencesService.getBoolPref("countdownclock.hideNullUnits") ;
	var padWithLeadingZero = preferencesService.getBoolPref("countdownclock.padWithLeadingZero") ;
	var displayLength = preferencesService.getIntPref("countdownclock.displayLength") ;

	var daysLeft = 0 ;
	var hoursLeft = 0 ;
	var minutesLeft = 0 ;
	var secondsLeft = 0 ;

	if(units.indexOf("d") >= 0)
	{
		if(timeLeft < 86400 && hideNullUnits) {}
		else
		{
			daysLeft = Math.floor( timeLeft / 86400 ) ;
			timeLeft %= 86400 ;

			switch(displayLength)
			{
				case 0:
					displayString += " " + daysLeft + " " + cdcGetLocaleString('daysLeft') + " " ;
					break ;
				case 1:
					displayString += " " + daysLeft + cdcGetLocaleString('daysLeft').substr(0,1) + " " ;
					break ;
				case 2:
					displayString += " " + daysLeft + ":" ;
					break ;
			}
		}
	}

	if(units.indexOf("h") >= 0)
	{
		if(timeLeft < 3600 && hideNullUnits && (daysLeft == 0)) {}
		else
		{
			hoursLeft = Math.floor( timeLeft / 3600 ) ;
			if(padWithLeadingZero && hoursLeft < 10) hoursLeft = "0" + hoursLeft ;
			timeLeft %= 3600 ;

			switch(displayLength)
			{
				case 0:
					displayString += hoursLeft + " " + cdcGetLocaleString('hoursLeft') + " " ;
					break ;
				case 1:
					displayString += hoursLeft + cdcGetLocaleString('hoursLeft').substr(0,1) + " " ;
					break ;
				case 2:
					displayString += hoursLeft + ":" ;
					break ;
			}
		}
	}

	if(units.indexOf("m") >= 0)
	{
		if(timeLeft < 60 && hideNullUnits && (hoursLeft == 0 && daysLeft == 0)) {}
		else
		{
			minutesLeft = Math.floor( timeLeft / 60 ) ;
			if(padWithLeadingZero && minutesLeft < 10) minutesLeft = "0" + minutesLeft ;
			timeLeft %= 60 ;

			switch(displayLength)
			{
				case 0:
					displayString += minutesLeft + " " + cdcGetLocaleString('minutesLeft') + " " ;
					break ;
				case 1:
					displayString += minutesLeft + cdcGetLocaleString('minutesLeft').substr(0,1) + " " ;
					break ;
				case 2:
					displayString += minutesLeft + ":" ;
					break ;
			}
		}
	}

	if(units.indexOf("s") >= 0)
	{
		secondsLeft = timeLeft ;
		if(padWithLeadingZero && secondsLeft < 10) secondsLeft = "0" + secondsLeft ;

		switch(displayLength)
		{
			case 0:
				displayString += secondsLeft + " " + cdcGetLocaleString('secondsLeft') + " " ;
				break ;
			case 1:
				displayString += secondsLeft + cdcGetLocaleString('secondsLeft').substr(0,1) + " " ;
				break ;
			case 2:
				displayString += secondsLeft + ":" ;
				break ;
		}
	}

	displayString = displayString.substr(0,displayString.length - 1) ;

	if(preferencesService.getCharPref("countdownclock.displaySuffix").length > 0)
		displayString += " " + preferencesService.getCharPref("countdownclock.displaySuffix") ;

	if(theTimeLeft >= 0)
	{
		countdownPanel.label = displayString ;
	}
	else // Time's up
	{

		var alertMessage = preferencesService.getCharPref("countdownclock.alertMessage") ;
		if(alertMessage.length == 0)
			alertMessage = cdcGetLocaleString('defaultAlert') ;

		// Statusbar
		if(preferencesService.getBoolPref("countdownclock.alertMethodStatusbar"))
			countdownPanel.label = alertMessage ;
		else
			countdownPanel.label = cdcGetLocaleString('defaultAlert') ;

		if(preferencesService.getBoolPref("countdownclock.triggerAlert"))
		{
			preferencesService.setBoolPref("countdownclock.triggerAlert", false);

			// Sound (.wav file)
			if(preferencesService.getBoolPref("countdownclock.alertMethodSound"))
			{
				var player = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound) ;
				var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService) ;
				var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile) ;
				try
				{
					file.initWithPath(preferencesService.getCharPref("countdownclock.alertSoundFile")) ;
					player.play(ios.newFileURI(file)) ;
				}
				catch(e)
				{
				}
			}

			// Popup
			if(preferencesService.getBoolPref("countdownclock.alertMethodPopup"))
			{
				preferencesService.setBoolPref("countdownclock.alertMethodPopup", false);
				alert(alertMessage) ;
			}
		}
	}

	var toggleDisplay = preferencesService.getBoolPref("countdownclock.toggleDisplay") ;
	countdownPanel.collapsed = !toggleDisplay ;
}

// Cleans the prefs.js file to use as few preferences as possible
function cleanPrefs()
{
	var targetYear;
	var targetMonth;
	var targetDate;
	var targetHours;
	var targetMinutes;
	var targetSeconds;

	if(!preferencesService.prefHasUserValue("countdownclock.targetTime"))
	{
		if(preferencesService.prefHasUserValue("countdownclock.targetYear"))
		{
			targetYear = preferencesService.getIntPref("countdownclock.targetYear") ;
			preferencesService.clearUserPref("countdownclock.targetYear") ;
		}
		else
		{
			targetYear = -1 ;
		}

		if(preferencesService.prefHasUserValue("countdownclock.targetMonth"))
		{
			targetMonth = preferencesService.getIntPref("countdownclock.targetMonth") + 1 ;
			preferencesService.clearUserPref("countdownclock.targetMonth") ;
		}
		else
		{
			targetMonth = -1 ;
		}

		if(preferencesService.prefHasUserValue("countdownclock.targetDate"))
		{
			targetDate = preferencesService.getIntPref("countdownclock.targetDate") ;
			preferencesService.clearUserPref("countdownclock.targetDate") ;
		}
		else
		{
			targetDate = -1 ;
		}

		if(preferencesService.prefHasUserValue("countdownclock.targetHours"))
		{
			targetHours = preferencesService.getIntPref("countdownclock.targetHours") ;
			preferencesService.clearUserPref("countdownclock.targetHours") ;
		}
		else
		{
			targetHours = -1 ;
		}

		if(preferencesService.prefHasUserValue("countdownclock.targetMinutes"))
		{
			targetMinutes = preferencesService.getIntPref("countdownclock.targetMinutes") ;
			preferencesService.clearUserPref("countdownclock.targetMinutes") ;
		}
		else
		{
			targetMinutes = -1 ;
		}

		if(preferencesService.prefHasUserValue("countdownclock.targetSeconds"))
		{
			targetSeconds = preferencesService.getIntPref("countdownclock.targetSeconds") ;
			preferencesService.clearUserPref("countdownclock.targetSeconds") ;
		}
		else
		{
			targetSeconds = -1 ;
		}

		if(parseInt(targetYear,10) >= 0 && parseInt(targetMonth,10) >= 0 && parseInt(targetHours,10) >= 0 && parseInt(targetMinutes,10) >= 0 && parseInt(targetSeconds,10) >= 0)
		{
			preferencesService.setCharPref("countdownclock.targetTime", "" + targetYear + ":" + targetMonth + ":" + targetDate + ":" + targetHours + ":" + targetMinutes + ":" + targetSeconds) ;
		}
		else
		{
			preferencesService.setCharPref("countdownclock.targetTime", "2005:1:1:0:0:0" ) ;
		}
	}

	var unitDays ;
	var unitHours ;
	var unitMinutes ;
	var unitSeconds ;

	if(!preferencesService.prefHasUserValue("countdownclock.unitDisplay"))
	{
		if(preferencesService.prefHasUserValue("countdownclock.unitDays"))
		{
			unitDays = preferencesService.getBoolPref("countdownclock.unitDays") ;
			preferencesService.clearUserPref("countdownclock.unitDays") ;
		}
		else
		{
			unitDays = -1 ;
		}

		if(preferencesService.prefHasUserValue("countdownclock.unitHours"))
		{
			unitHours = preferencesService.getBoolPref("countdownclock.unitHours") ;
			preferencesService.clearUserPref("countdownclock.unitHours") ;
		}
		else
		{
			unitHours = -1 ;
		}

		if(preferencesService.prefHasUserValue("countdownclock.unitMinutes"))
		{
			unitMinutes = preferencesService.getBoolPref("countdownclock.unitMinutes") ;
			preferencesService.clearUserPref("countdownclock.unitMinutes") ;
		}
		else
		{
			unitMinutes = -1 ;
		}

		if(preferencesService.prefHasUserValue("countdownclock.unitSeconds"))
		{
			unitSeconds = preferencesService.getBoolPref("countdownclock.unitSeconds") ;
			preferencesService.clearUserPref("countdownclock.unitSeconds") ;
		}
		else
		{
			unitSeconds = -1 ;
		}

		if(unitDays == -1 || unitHours == -1 || unitMinutes == -1 || unitSeconds == -1)
		{
			preferencesService.setCharPref("countdownclock.unitDisplay", "dhms") ;
		}
		else
		{
			var unitDisplay = "" ;
			if(unitDays)
			{
				unitDisplay += "d" ;
			}
			if(unitHours)
			{
				unitDisplay += "h" ;
			}
			if(unitMinutes)
			{
				unitDisplay += "m" ;
			}
			if(unitSeconds)
			{
				unitDisplay += "s" ;
			}
			if(unitDisplay.length < 1)
			{
				unitDisplay = "s" ;
			}
			preferencesService.setCharPref("countdownclock.unitDisplay", unitDisplay) ;
		}
	}

	if(!preferencesService.prefHasUserValue("countdownclock.displayPrefix")) preferencesService.setCharPref("countdownclock.displayPrefix", "") ;
	if(!preferencesService.prefHasUserValue("countdownclock.displaySuffix")) preferencesService.setCharPref("countdownclock.displaySuffix", "") ;
	if(!preferencesService.prefHasUserValue("countdownclock.alertMessage")) preferencesService.setCharPref("countdownclock.alertMessage", "") ;
	if(!preferencesService.prefHasUserValue("countdownclock.alertMethodStatusbar")) preferencesService.setBoolPref("countdownclock.alertMethodStatusbar", true) ;
	if(!preferencesService.prefHasUserValue("countdownclock.alertMethodPopup")) preferencesService.setBoolPref("countdownclock.alertMethodPopup", false) ;
	if(!preferencesService.prefHasUserValue("countdownclock.alertMethodSound")) preferencesService.setBoolPref("countdownclock.alertMethodSound", false) ;
	if(!preferencesService.prefHasUserValue("countdownclock.alertSoundFile")) preferencesService.setCharPref("countdownclock.alertSoundFile", "") ;
	if(!preferencesService.prefHasUserValue("countdownclock.toggleDisplay")) preferencesService.setBoolPref("countdownclock.toggleDisplay", true) ;
	if(!preferencesService.prefHasUserValue("countdownclock.triggerAlert")) preferencesService.setBoolPref("countdownclock.triggerAlert", false) ;
	if(!preferencesService.prefHasUserValue("countdownclock.padWithLeadingZero")) preferencesService.setBoolPref("countdownclock.padWithLeadingZero", true) ;
	if(!preferencesService.prefHasUserValue("countdownclock.hideNullUnits")) preferencesService.setBoolPref("countdownclock.hideNullUnits", false) ;
	if(!preferencesService.prefHasUserValue("countdownclock.displayLength")) preferencesService.setIntPref("countdownclock.displayLength", 0) ;
}

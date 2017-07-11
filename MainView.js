var Environment = require('FuseJS/Environment');

var APNS = require("APNS");
var FNotify = require("Firebase/Notifications");
var Push = null;
if(Environment.ios)
	Push = APNS;
else
	Push = FNotify;

var Observable = require("FuseJS/Observable");

var status = Observable("-");
var message = Observable("-no message yet-");

Push.onRegistrationSucceeded = function(regID) {
    console.log ("Reg Succeeded: " + regID);
	if(Environment.ios) APNStoFCM(regID);
    status.value = "onRegistrationSucceeded: " + regID;
};

Push.onRegistrationFailed = function(reason) {
    console.log ("Reg Failed: " + reason);
};

Push.onReceivedMessage = function(payload, fromNotificationBar) {
    console.log ("Recieved Push Notification: " + payload);
    console.log ("fromNotificationBar="+fromNotificationBar);
    message.value = payload;
};

var clearBadgeNumber = function() {
    Push.clearBadgeNumber();
}

var clearAllNotifications = function() {
    Push.clearAllNotifications();
}

function APNStoFCM(token) {
    var body = {
		application : 'com.yourapp.id', // Use your own app id
		sandbox : true, // Change this to FALSE when deploying to the App Store
		apns_tokens : [token]
    };

    var options = {
		method: "POST",
		headers: {
		    'Accept': 'application/json',
		    "Content-type": "application/json; charset=UTF-8",
		    'Authorization' : 'key=YOURKEY' // You can find you key under Firebase / Project Settings / Cloud Messaging / Server Key
		},
		body: JSON.stringify(body)
    };

    fetch("https://iid.googleapis.com/iid/v1:batchImport", options)
	.then(function(response) {
	    return response.json();
	}).then(function(response) {
	    console.log("Response " + JSON.stringify(response))
		status.value = "FCM : " + response.results[0].registration_token;
	}).catch(function(error) {
	    console.log("Error " + JSON.stringify(error))
	});
};


module.exports = {
    clearBadgeNumber: clearBadgeNumber,
    clearAllNotifications: clearAllNotifications,
    message: message,
    status: status
};

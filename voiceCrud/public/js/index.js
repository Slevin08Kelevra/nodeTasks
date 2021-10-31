'use strict';
//var app = angular.module('app', []);

var startCommand = FuzzySet(['iniciar reconocimiento']);
var stopCommand = FuzzySet(['detener reconocimiento']);

var startClock = FuzzySet(['iniciar cronometro']);
var stopClock = FuzzySet(['detener cronometro']);
var cleanClock = FuzzySet(['limpiar cronometro']);

/* app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}
]); */


artyom.initialize({
    continuous: true,
    lang: "es-ES",
    debug: false
    //voice: ['Google US English', 'Alex']
}).then(function () {
    console.log("Artyom has been correctly initialized");
    //console.log(artyom.getVoices());
}).catch(function () {
    console.error("An error occurred during the initialization");
});



var lastResponse = "";
var iqualRespCount = 0;
var keepRecogOn = false;
var recogIsStarted = false;
var sendRecogText = false;

function checkSimilarity(simResult) {

    if (simResult != null && simResult[0][0] > 0.75) {
        return true;
    } else {
        return false;
    }

}


var settings = {
    continuous: true, // Don't stop never because i have https connection

    onResult: function (text) {
        // text = the recognized text
        //console.log(text + " " + iqualRespCount);
        /* if(text == response){
            iqualRespCount++;
            
        } */
        /* response = text;
        if(iqualRespCount > 2){
           console.log(text);
           iqualRespCount = 0;
           response = "";
           artyom.clearGarbageCollection();
           UserDictation.stop();
           
        }   */
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        timeout = setTimeout(function () {
            if (text == lastResponse) { lastResponse = ""; return; }
            lastResponse = text;
            console.log(text);

            if (checkSimilarity(startCommand.get(text))) {

                sendRecogText = true;
                document.getElementById("armed").style.display = 'none';
                document.getElementById("sp-rec-cont-gear").style.display = '';

            } else if (checkSimilarity(stopCommand.get(text))) {

                sendRecogText = false;
                document.getElementById("sp-rec-cont-gear").style.display = 'none';
                document.getElementById("armed").style.display = '';

            } else if (sendRecogText) {

                if (checkSimilarity(startClock.get(text))){
                    fader('sp-rec-cont-success', 'on-off');
                    chronoStart();
                    artyom.say("iniciado");
                    console.log(text);
                } else if (checkSimilarity(stopClock.get(text))){
                    fader('sp-rec-cont-success', 'on-off');
                    var speakTime = ""
                    var segundx = (speakSecs > 1)?"segundos":"segundo"
                    var minutx = (speakMins > 1)?"minutos":"minuto"
                    if (speakMins > 0)
                        speakTime = speakMins + ` ${minutx} `
                    speakTime+= speakSecs + ` ${segundx}`
                    chronoStop();
                    artyom.say(speakTime);
                    console.log(text);
                } else if (checkSimilarity(cleanClock.get(text))){
                    fader('sp-rec-cont-success', 'on-off');
                    chronoReset();
                    console.log(text);
                }

                /* console.log("sending to java");
                var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
                xmlhttp.open("POST", "http://localhost:8095/sendMessage");
                xmlhttp.setRequestHeader("Content-Type", "application/json");
                xmlhttp.onload = function () {
                    if (xmlhttp.readyState === xmlhttp.DONE) {
                        if (xmlhttp.status === 200) {
                            var resp = JSON.parse(xmlhttp.response);
                            if (resp.status == 'EXECUTED') {
                                fader('sp-rec-cont-success', 'on-off');
                                //console.log(resp.status);
                            }

                        }
                    }
                };
                xmlhttp.send(JSON.stringify({ message: text })); */

            }

            UserDictation.stop();
        }, 380);

    },
    onStart: function () {
        recogIsStarted = true;
        console.log("Dictation started by the user");
    },
    onEnd: function () {
        recogIsStarted = false;
        console.log("Dictation stopped by the user");
        if (keepRecogOn) {
            UserDictation.start();
        }
    }
};


var UserDictation = artyom.newDictation(settings);
var timeout;

function stopAndstartRecog() {
    UserDictation.stop();
}

function startRecognition() {
    keepRecogOn = true;
    UserDictation.start();
    document.getElementById("armed").style.display = '';
    //document.getElementById("sp-rec-cont-gear").style.display = '';
}

function toggleRecog() {
    if (recogIsStarted) {
        stopRecognition();
        recogIsStarted = false;
    } else {
        startRecognition();
        recogIsStarted = true;
    }
}

function stopRecognition() {
    keepRecogOn = false;
    UserDictation.stop();
    document.getElementById("armed").style.display = 'none';
    //document.getElementById("sp-rec-cont-gear").style.display = 'none';
}

function fader(element, state) {
    if (state == "on") {
        document.getElementById(element).style.display = '';
        document.getElementById(element).style.opacity = 1;
    } else if (state == "off") {
        document.getElementById(element).style.opacity = 0;
        setTimeout(function () { document.getElementById(element).style.display = 'none'; }, 2000);

    } else if (state == "on-off") {
        document.getElementById(element).style.display = '';
        setTimeout(function () { document.getElementById(element).style.opacity = 1; }, 100);
        setTimeout(function () {
            document.getElementById(element).style.opacity = 0;
            setTimeout(function () { document.getElementById(element).style.display = 'none'; }, 1000);
        }, 1000);
    }

}

var main = function InstListCtrl($scope, $http, $templateCache) {
    var serverUrl = 'http://localhost:8096';
    var getUrl = serverUrl + '/api/getInstructions';
    var recOnUrl = serverUrl + '/api/voiceRecord/on';
    var recOffUrl = serverUrl + '/api/voiceRecord/off';
    var insertUrl = serverUrl + '/api/saveInstruction';
    var updateUrl = serverUrl + '/api/updateInstruction';
    var removeUrl = serverUrl + '/api/deleteInstruction';
    var insertMethod = 'POST';
    var updateMethod = 'PUT';
    var removeMethod = 'DELETE';
    $scope.showEdit = false;
    $scope.showLabel = true;


    $scope.save = function () {
        var formData = {
            "inst": this.instruction,
            "desc": this.description,
            "sim": this.simil
        };
        this.instruction = '';
        this.description = '';
        this.simil = '';

        var data = 'data=' + JSON.stringify(formData);
        httpMethod(insertMethod, insertUrl, data, $templateCache);

        $scope.list();
        return false;
    };

    $scope.update = function () {

        var userData = {
            "inst": this.inst.inst,
            "desc": this.inst.desc,
            "sim": this.inst.sim,
            "id": this.inst.id
        };
        var data = 'data=' + JSON.stringify(userData);
        httpMethod(updateMethod, updateUrl, data, $templateCache);
        $scope.list();
        return false;
    };

    $scope.remove = function () {
        var userData = {
            "inst": this.inst.inst,
            "desc": this.inst.desc,
            "sim": this.inst.sim,
            "id": this.inst.id
        };
        var data = 'data=' + JSON.stringify(userData);

        httpMethod(removeMethod, removeUrl, data, $templateCache);
        $scope.list();
        return false;
    };

    $scope.list = function () {
        var url = getUrl;
        $http.get(url).success(function (data) {
            $scope.instructions = data;
        });
    };

    function httpMethod(method, url, data, templateCache) {
        $http({
            method: method,
            url: url,
            data: data,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            cache: templateCache
        }).
            success(function (response) {
                $scope.list();
            }).
            error(function (response) {
            });
    }

    $scope.selectUser = function () {
        if (this.showEdit === false) {
            this.showEdit = true;
            this.showLabel = false;
        }
    };


    $scope.record = function (state) {
        var urlOn = recOnUrl;
        var urlOff = recOffUrl;
        var recIcon = angular.element(document.querySelector('#recIcon'));

        if (state === "on") {
            recIcon.css("color", "red");
            var audio = new Audio('/static/sounds/beep1.mp3');
            audio.play();
            $http.get(urlOn).success(function (data) {
                console.log("Status: " + data.status);
            });
        } else {
            recIcon.css("color", "black");
            var audio = new Audio('/static/sounds/beep2.mp3');
            audio.play();
            $http.get(urlOff).success(function (data) {
                console.log("Status: " + data.status);
            });
        }


    };


    $scope.list();
}

//app.controller('InstListCtrl', main);



var startTime = 0
var start = 0
var end = 0
var diff = 0
var timerID = 0
var speakMins;
var speakSecs;
function chrono(){
	end = new Date()
	diff = end - start
	diff = new Date(diff)
	var msec = diff.getMilliseconds()
	var sec = diff.getSeconds()
	var min = diff.getMinutes()
	var hr = diff.getHours()-1
	if (min < 10){
		min = "0" + min
	}
	if (sec < 10){
		sec = "0" + sec
	}
	if(msec < 10){
		msec = "00" +msec
	}
	else if(msec < 100){
		msec = "0" +msec
	}
	document.getElementById("chronotime").innerHTML = hr + ":" + min + ":" + sec + ":" + msec
    speakMins = +min
    speakSecs = +sec
	timerID = setTimeout("chrono()", 10)
}
function chronoStart(){
	document.chronoForm.startstop.value = "stop!"
	document.chronoForm.startstop.onclick = chronoStop
	document.chronoForm.reset.onclick = chronoReset
	start = new Date()
	chrono()
}
function chronoContinue(){
	document.chronoForm.startstop.value = "stop!"
	document.chronoForm.startstop.onclick = chronoStop
	document.chronoForm.reset.onclick = chronoReset
	start = new Date()-diff
	start = new Date(start)
	chrono()
}
function chronoReset(){
	document.getElementById("chronotime").innerHTML = "0:00:00:000"
	start = new Date()
}
function chronoStopReset(){
	document.getElementById("chronotime").innerHTML = "0:00:00:000"
	document.chronoForm.startstop.onclick = chronoStart
}
function chronoStop(){
	document.chronoForm.startstop.value = "start!"
	document.chronoForm.startstop.onclick = chronoContinue
	document.chronoForm.reset.onclick = chronoStopReset
	clearTimeout(timerID)
}

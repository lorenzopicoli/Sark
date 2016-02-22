printInfoLog("Attemping to connect...");

var socket = io.connect("http://192.168.25.8:3000");
var currentDevice = ''
var currentiOS = ''
var currentSDK = ''


socket.on('connect', () =>{
	printInfoLog("Connected successfully...");
});

$('#update-git-button').click(()=>{
  socket.emit('cloneRequest', {url:$('#git-field').prop('value'), token:$('#token-field').prop('value')});
});

//Dropdown menu itens
$(".dropdown-menu").on('click', 'li a', function(e){
  $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
  $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
  
  var id = $(this).parents('.dropdown').eq(0).prop('id')
  
  if(id == 'device-dropdown'){
    currentDevice = $(this).text();
  }else if(id == 'ios-dropdown'){
    currentiOS = $(this).text();
  }else{
    currentSDK = $(this).text();                      
  }
  e.preventDefault();
});

socket.on('updateDeviceAndiOSList', (item)=>{
  printInfoLog("Updating device and OS list...");
  addListToDropdown('#device-dropdown', item.device);
  addListToDropdown('#ios-dropdown', item.ios);
  printInfoLog("We are good to go!");

});

socket.on('updateSdkList', (list)=>{
  printInfoLog("Updating SDK list...");
  addListToDropdown('#sdk-dropdown', list);
});

function addListToDropdown(id, list){
  list.forEach((device)=>{
    $(id).children('ul').eq(0).append(
    $('<li>').append(
    $('<a>').prop({'text':device, 'href': '#'})));
  });
}

//Log area

socket.on('updateLog', (item)=>{
  logToScreen(item);
});

socket.on('gitUpdate', (item)=>{
  $('#git-status').text(item.log);
  $('#git-status').prop('class', getFontType(item));
});

function logToScreen(item){
  var logClass = getFontType(item);
  var $li = $('<li>').prop('class', 'list-group-item');
  var $span = $('<span>').prop('class', logClass);
  
  $span.text('[' + item.time + '] - ' + item.log);
  
  $('#log-area:last-child').append(
  $li.append(
  $span));

  //Scroll to bottom
  var element = document.getElementById("log-area");
  element.scrollTop = element.scrollHeight;
}

    
function getFontType(item){
    switch(item.type){
    case "success":
      return "text-success";
    case "error":
      return "text-danger";
    case "warning":
      return "text-warning";
    case "info":
      return "text-info";
    default:
      return "white-font";
  }
}


//Actions

$('#build-button').click((e)=>{
  var config = {
    filename: $('#filename-field').prop('value'),
    configuration: $('#config-field').prop('value'),
    scheme: $('#scheme-field').prop('value'),
    sdk: currentSDK,
    device: currentDevice,
    ios: currentiOS
  }
  printInfoLog("Sending build command to server and waiting for response...");
  socket.emit('build', config);
  e.preventDefault();
});

$('#clean-button').click((e)=>{
  var config = {
    filename: $('#filename-field').prop('value'),
    configuration: $('#config-field').prop('value'),
    scheme: $('#scheme-field').prop('value'),
    sdk: currentSDK,
    device: currentDevice,
    ios: currentiOS
  }
  printInfoLog("Sending clean command to server and waiting for response...");
  socket.emit('clean', config);
  e.preventDefault();
});

$('#clean-folder-button').click((e)=>{
  printInfoLog("Sending clean command to server and waiting for response...");
  socket.emit('cleanFolder');
  e.preventDefault();
});


function printInfoLog(message){
  var item = {
    type: "info",
    time: getCurrentTime(),
    log: message
  }
  logToScreen(item);
}

//Helper

function addPaddingZero(numberString){
  if(numberString.length < 2){
    return '0' + numberString;
  }else{
    return numberString;
  }
}

function getCurrentTime(){
  var date = new Date();
  var h = addPaddingZero(date.getHours().toString());
  var m = addPaddingZero(date.getMinutes().toString());
  var s = addPaddingZero(date.getSeconds().toString());

  return `${h}:${m}:${s}`
}
var socket = io.connect("http://localhost:3000");
var currentDevice = ''
var currentiOS = ''
var currentSDK = ''

socket.on('connect', () =>{
	console.log('connect');
	socket.emit('newCommand', "Build");
});

$('#update-git-button').click(()=>{
  alert('Update git!!!');
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
  
  addListToDropdown('#device-dropdown', item.device);
  addListToDropdown('#ios-dropdown', item.ios);

});

socket.on('updateSdkList', (list)=>{
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
  var logClass = getFontType(item);
  var $li = $('<li>').prop('class', 'list-group-item');
  var $span = $('<span>').prop('class', logClass);
  
  $span.text('[' + item.time + '] - ' + item.log);
  
  $('#log-area:last-child').append(
  $li.append(
  $span)); 
});

    
function getFontType(item){
    switch(item.type){
    case "success":
      return "text-success";
    case "error":
      return "text-danger";
    case "warning":
      return "text-warning";
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
  socket.emit('build', config);
  e.preventDefault();
});
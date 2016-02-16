var socket = io.connect("http://localhost:3000");

socket.on('connect', () =>{
	console.log('connect');
	socket.emit('newCommand', "Build");
});

$('#update-git-button').click(()=>{
  alert('Update git!!!');
});

//Dropdown menu itens
$(".dropdown-menu li a").click(function(e){
  $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
  $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
  e.preventDefault();
});

socket.on('updateDeviceList', (list)=>{

  list.forEach((device)=>{
    $('#device-dropdown').children('ul').eq(0).append(
    $('<li>').append(
    $('<a>').prop('text', device)));
  });
    
});

socket.on('updateiOSList', (list)=>{

  list.forEach((device)=>{
    $('#ios-dropdown').children('ul').eq(0).append(
    $('<li>').append(
    $('<a>').prop('text', device)));
  });
    
});


//Log area
//white-font
//text-success
//text-danger
//text-warning

socket.on('updateLog', (item)=>{
   
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

function test(item){
  var logClass = getFontType(item);
  var $li = $('<li>').prop('class', 'list-group-item');
  var $span = $('<span>').prop('class', logClass);
  $span.text('[' + item.time + '] - ' + item.log);
  
  $('#log-area:last-child').append(
  $li.append(
  $span)); 
}

test({type: 'success', log: 'workssssssss', time: '21:20:13'})

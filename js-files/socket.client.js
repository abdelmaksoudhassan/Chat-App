const socket = io()

var searchParams = new URLSearchParams(window.location.search);
var code = searchParams.get('code')
var email = $('#email').text()
var id = $('#userId').attr( "userId" )
var roomId = $('#roomId').attr( "roomId" )

socket.on('connect',(e)=>{
    console.log(`Front: your socket is connected`)
    // join room
    socket.emit('join',{code,email},function(msg){
        if(msg){
            console.log(msg);
        }
    })
})
// update online list (add)
socket.on('addToOnlineList',(email)=>{
    const exist = [...$(".online-list li")].some(el => $(el).text() === email)
    if(exist){
        return
    }
    $(".online-list").append(`<li class="online">${email}</li>`)
})
// update online list (remove)
socket.on('removeFromOnlineList',(email)=>{
    const listItems = document.querySelectorAll('.online-list li');
    Array.from(listItems).forEach(listItem => {
        if (listItem.textContent == email) {
            listItem.parentNode.removeChild(listItem);
        }
    });
})
// new message
socket.on('newMessage', (msg)=>{
    $("#messages").append(`<li>${msg.sender} - ${msg.body}</li>`)
});
// user leave
function leaveRoom(){
    socket.emit('leave',{code,email},()=>{
        location.assign('/profile')
    })
}
// send message
$('#sendMessageBtn').on('click',(e)=>{
    e.preventDefault()
    const txt = $('#messageBox').val()
    if(txt != ''){
        socket.emit('sendMessage',{id,roomId,email,code,txt},()=>{
            $('#messageBox').val('')
        })
    }
})
// handle send message error
socket.on('sendMsgErr',(err)=>{
    console.log(err)
    alert(err.message || 'intrnal error occured')
})
// load room data
socket.on('loadRoomData',(roomData)=>{
    roomData.messages.forEach(message => {
        $("#messages").append(`<li>${message.sender.email} - ${message.text}</li>`) 
    });
    $('#roomOwner').text(roomData.admin.email)
})
// socket disconnected
socket.on('disconnect',(e)=>{
    console.log('Front: Disconnected from server');
});
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
// server welcome message
socket.on('welcomeMessage',(msg)=>{
    $("#messages").append(
        `<li>
            <div class="alert alert-success" role="alert">
                <strong>${msg.sender}:</strong>
                <span>${msg.body}</span>
            </div>
        </li>`
    )
    autoscroll()
})
// server new join message
socket.on('newUserJoined',(msg)=>{
    $("#messages").append(
        `<li>
            <div class="alert alert-info" role="alert">
                <strong>${msg.sender}:</strong>
                <span>${msg.body}</span>
            </div>
        </li>`
    )
    autoscroll()
})
// new message
socket.on('newMessage', (msg)=>{
    $("#messages").append(
        `<li>
            <div class="alert alert-primary" role="alert">
                <strong>${msg.sender}:</strong>
                <span>${msg.body}</span>
                <div class="row justify-content-end">
                    ${moment(new Date(msg.time),"YYYYMMDD").fromNow()}
                </div>
            </div>
        </li>`
    )
    autoscroll()
});
// left
socket.on('userleft', (msg)=>{
    $("#messages").append(
        `<li>
            <div class="alert alert-danger" role="alert">
                <strong>${msg.sender}:</strong>
                <span>${msg.body}</span>
            </div>
        </li>`
    )
    autoscroll()
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
    alert(err || 'intrnal error occured')
})
// load room data
socket.on('loadRoomData',(roomData)=>{
    roomData.messages.forEach(message => {
        $("#messages").append(
            `<li>
                <div class="col alert alert-primary" role="alert">
                    <strong>${message.sender.email}:</strong>
                    <span>${message.text}</span>
                    <div class="row justify-content-end">${moment(message.createdAt).format('LLL')}</div>
                </div>
            </li>`
        )
    });
    $('#roomOwner').text(roomData.admin.email)
})
const autoscroll = () => {
    const $messages = document.querySelector('#messages')
    
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
        window.scrollTo(0, $messages.scrollHeight);
    }
}
// socket disconnected
socket.on('disconnect',(e)=>{
    console.log('Front: Disconnected from server');
});

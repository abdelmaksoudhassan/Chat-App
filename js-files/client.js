// send signup request
$('#signup-form').on('submit', (event) => {
    event.preventDefault();
    axios.post('/signup',
        new URLSearchParams(new FormData(event.target))
    ).then(res=>{
        alert(res.data.message)
        location.assign('/login')
    }).catch(err=>{
        console.log(err)
        $('#signup-err').text(err.response.data.message)
    })
});
// send login request
$('#login-form').on('submit', async (e) => {
    const email = $('#inputEmail').val()
    const password = $('#inputPassword').val()
    e.preventDefault()
    axios.post('/login',{ email,password }).then(res=>{
        location.assign('/profile')
    }).catch(err=>{
        console.log(err)
        if(err.response.status == 500){
            return $('#login-err').text('internal server error')
        }
        $('#login-err').text(err.response.data.message)
    })
})
// configure signup validation
function validateSignupForm(){
    var email = $('#signup-form #inputEmail').val()
    var password = $('#signup-form #inputPassword').val()
    const passRegExp = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/
    if(validator.matches(password,passRegExp) && validator.isEmail(email)){
        return $('#signup-form #submitBtn').prop('disabled', false)
    }
    $('#signup-form #submitBtn').prop('disabled', true)
}
$('#signup-form #resetBtn').click(function(){
    $('#signup-form #submitBtn').prop('disabled', true)
})
// send logout request
$('#logoutBtn').on("click",(e)=>{
    axios.post('/logout').then(res=>{
        console.log(res)
        if(res.status == 200){
            location.assign('/login')
        }
    }).catch(err=>{
        console.log(err)
        alert(err.response.data.message)
    })
})
// configure room form validation
function validateRoomForm(){
    var code = $('#room-form #inputCode').val()
    var password = $('#room-form #inputPassword').val()
    const passRegExp = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/
    if(
        validator.matches(password,passRegExp) &&
        validator.isNumeric(code) &&
        validator.isLength(code,{min:4,max:4})
    ){
        return $('#room-form #createBtn').prop('disabled', false)
    }
    $('#room-form #createBtn').prop('disabled', true)
}
// helper function
function pushRoomToList(code){
    $('#myRooms')
    .append(
        `<li class="room">
            <span id="code" code=${code}>Room code ${code} </span>
            <div class="rooms-btns">
                <button type="button" class="btn btn-enter" onClick="enterRoom(${code})">Enter</button>
                <button type="button" class="btn btn-danger" onClick="deleteRoom(${code})">Delete</button>
            </div>
        </li>`
    )
}
// load my rooms on my profile page
window.onload = async function(){
    if(window.location.href.indexOf('profile') > -1){
        axios.get('/my-rooms').then(res=>{
            const rooms = res.data
            if(rooms.length > 0){
                rooms.forEach(room => {
                    pushRoomToList(room.code)
                })
            }
        }).catch(err=>{
            console.log(err)
            alert('internal error occured')
        })
    }
}
// delete spesific room
function deleteRoom(code){
    axios.delete(`/delete-room/${code}`).then(res=>{
        alert(res.data.message)
        const listItems = document.querySelectorAll('.my-rooms li');
        Array.from(listItems).forEach(listItem => {
            if ($("#code").attr('code') == code) {
                listItem.parentNode.removeChild(listItem);
            }
        })
    }).catch(err=>{
        console.log(err)
        alert('internal error occured')
    })
}
// enter room
async function enterRoom(code){
    try{
        await axios.post(`/enter-room/${code}`)
        location.assign(`/room?code=${code}`)
    }catch(err){
        console.log(err)
        $('#room-err').text(err.response.data.message)
    }
}
// send create room request
$('#createBtn').on('click', (e) => {
    const code = $('#inputCode').val()
    const password = $('#inputPassword').val()
    axios.post('/add-room',{code,password}).then(res=>{
        alert(res.data.message)
        pushRoomToList(code)
    }).catch(err=>{
        console.log(err)
        $('#code-err').text(err.response.data.message)
    })
})
// send join request
$('#joinBtn').on('click', async (e) => {
    const code = $('#inputCode').val()
    const password = $('#inputPassword').val()
    try{
        await axios.post('/join-room',{code,password})
        location.assign(`/room?code=${code}`)
    }catch(err){
        console.log(err)
        $('#room-err').text(err.response.data.message)
    }
})
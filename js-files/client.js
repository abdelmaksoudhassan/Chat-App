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
            return $('#login-err').text('unexpected error occured')
        }
        $('#login-err').text(err.response.data.message)
    })
})
// clear error alert
function clrErr(action){
    if(action == 'signup'){
        $('#signup-err').text('')
    }
    else if(action == 'login'){
        $('#login-err').text('')
    }
    else if(action == 'room'){
        $('#room-err').text('')
        $('#code-err').text('')
    }
    else{
        return
    }
}
// configure signup validation
function validateSignupForm(){
    var email = $('#signup-form #inputEmail').val()
    var password = $('#signup-form #inputPassword').val()
    const passRegExp = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,20})$/
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
    const passRegExp = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,20})$/
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
    $('#myRooms').append(
        `<li id="code" code=${code} class="list-group-item room">
            <div>
                <span>${code} </span>
            </div>
            <div class="rooms-btns">
                <button type="button" class="btn btn-primary btn-sm" onClick="enterRoom(${code})">Enter</button>
                <button type="button" class="btn btn-danger btn-sm" onClick="deleteRoom(${code})">Delete</button>
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
                // $('#rooms-sec').show()
                rooms.forEach(room => {
                    pushRoomToList(room.code)
                })
            }
        }).catch(err=>{
            console.log(err)
            alert('unexpected error occured')
        })
    }
}
// delete spesific room
function deleteRoom(code){
    axios.delete(`/delete-room/${code}`).then(res=>{
        alert(res.data.message)
        const listItems = document.querySelectorAll('#myRooms li');
        Array.from(listItems).forEach(listItem => {
            const liCode = listItem.attributes[1].nodeValue
            if (liCode == code) {
                listItem.parentNode.removeChild(listItem);
            }
        })
    }).catch(err=>{
        console.log(err)
        alert('unexpected error occured')
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
        $('#inputCode').val("")
        $('#inputPassword').val("")
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
// show side nav
$('#listBtn').on('click', () => {
    showSideBar()
})
function showSideBar(){
    $('#side-nav').show()
}
// hide side nav
$('#opactity').on('click', () => {
    hideSideBar()
})
$('#hideBtn').on('click', () => {
    hideSideBar()
})
function hideSideBar(){
    $('#side-nav').hide()
}

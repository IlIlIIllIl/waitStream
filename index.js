let authorization = "";
let sw = false;
// -- 
$(function(){
    getKeys();
    $('#startBtn').click(function(){
        let b = setToken();
        if(b)
            waitStreaming();
    });
});
// -- 
function getKeys(){
    let cilentId = getCookie("clientId");
    let secretKey = getCookie("secretKey");
    if(cilentId !== null && secretKey !== null){
        $('#clientId').val(getCookie("clientId"));
        $('#secretKey').val(getCookie("secretKey"));
    }
}
// -- 커스텀 함수 --
function setToken(){
    let clientId = $('#clientId').val();
    let secretKey = $('#secretKey').val();
    let b;
    $.ajax({
        url:"https://id.twitch.tv/oauth2/token",
        type:"POST",
        async: false,
        data:{
            "client_id":clientId,
            "client_secret":secretKey,
            "grant_type":"client_credentials"
        },
        contentType:"application/x-www-form-urlencoded; charset=UTF-8",
        success: function(response){
            setCookie("clientId",clientId);
            setCookie("secretKey",secretKey);
            let accessToken = response.access_token;
            let tokenType = response.token_type.replace(/\b[a-z]/, letter => letter.toUpperCase());
            authorization = "".concat(tokenType," ",accessToken);
            b = true;
        },
        error : function(){
            alert("Client-id 혹은 Secret-key가 맞지 않습니다.");
            b = false;
        } 
    });
    return b;
}

function waitStreaming(){
    let clientId = $('#clientId').val();
    let secretKey = $('#secretKey').val();
    $('#startBtn').text('');
    $('#startBtn').attr('disabled',true);
    $('#clientId').attr('disabled',true);
    $('#secretKey').attr('disabled',true);
    $('#startBtn').append(`
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...
    `);
    setInterval(() => {
        checkStreaming(clientId);
    }, 5000);
}

function checkStreaming(clientId){
    $.ajax({
        url: "https://api.twitch.tv/helix/streams",
        type: "GET",
        async: false,
        data:{
            "user_login":"kumikomii"
        },
        contentType:"application/x-www-form-urlencoded; charset=UTF-8",
        beforeSend : function(xhr){
            xhr.setRequestHeader("client-id", clientId);
            xhr.setRequestHeader("Authorization", authorization);
        },
        success : function(response){
            if(response.data.length!==0)
                location.href="https://twitch.tv/kumikomii";
            
        }
    });
}

// -- 쿠키 관련 함수 --
function setCookie(cname, cvalue) {
    const d = new Date();
    d.setTime(d.getTime() + (30*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cookieName){
    var cookieValue=null;
    if(document.cookie){
        var array=document.cookie.split((escape(cookieName)+'='));
        if(array.length >= 2){
            var arraySub=array[1].split(';');
            cookieValue=unescape(arraySub[0]);
        }
    }
    return cookieValue;
}
/*
    ver1 - 모바일에서도 PC버전 웹으로 동작하게끔 한 버전
    장점 - 모바일에서 자동화가 잘됨 ( 자고있어도 방송이 리방되도 꺼졌다 재접속함 )
    단점 - 모바일에서 PC화면으로 접속하다보니 UI가 불편함
*/

let authorization = "";
let sw = false;
let popup = '';
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
            console.log('test')
            let device = deviceCheck();
            if(response.data.length!==0){
                if(sw === false){
                    console.log('방송시작')
                    sw=true;
                    if( device ==='mobile' )
                        popup = window.open('https://www.twitch.tv/kumikomii?no-mobile-redirect=true&muted=false');
                    else
                        popup = window.open('https://www.twitch.tv/kumikomii');
                }
            } else{
                if(sw === true){
                    console.log('방송종료')
                    sw=false;
                    popup.close();    
                }
            }
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

// PC, 모바일 구분 함수 --
function deviceCheck(){
    var filter = "win16|win32|win64|mac|macintel"; 
    if ( navigator.platform ) { 
        if ( filter.indexOf( navigator.platform.toLowerCase() ) < 0 ) { //mobile 
            return 'mobile';
        } else { //pc 
            return 'pc';
        } 
    }

}


/*
    ver2 - 모바일에서는 twitch앱으로 접속하게 끔 한 버전
    장점 - 방송알림보다 좀 더 빠르게 알 수 있음 (알림이 오지 않아도 확인 가능) (ver1과 차이 없음) 
    단점 - 모바일에서 한 번 앱 실행하고 나면 스크립트가 더 이상 동작 안함
         - ( 실행된 웹이나 앱 둘 중 하나라도 팝업모드가 아니라면 끝 )
         - 앱을 재시작하기 쉽지 않음( 권한문제 있음 )
         - 딥링크로 앱을 실행하기 위해선 스크립트로 동작이 불가


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
                    if( device ==='mobile' ){
                        $('button').remove('#startBtn');
                        $('#buttonDiv').append(`<button id="startBtn" onClick="location.href='twitch://open?stream=kumikomii'" type="button" class="btn btn-primary mb-3 float-right"><img src="twitch-brands.svg" alt="Breaking Borders Logo" height="25" width="25"> 앱실행</button>`);
                        // if(confirm("앱을 실행하시겠습니까?") === true){
                        //     locatioon.href='twitch://open?stream=kumikomii';
                        // 
                    }
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


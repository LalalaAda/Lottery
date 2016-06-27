$(".addmember-btn").click(function(){
    username = $("#aum-username").val()
    password = $("#aum-password").val()
    realname = $("#aum-realname").val()
    phonenu = $("#aum-phoneno").val()
    
    if(username == '')
        return false;
    if(password == '')
        return false;
    if(realname == '')
        return false;
    if(phonenu == '')
        return false;
    
    
});
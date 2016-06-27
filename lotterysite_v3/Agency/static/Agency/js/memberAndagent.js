$(".addmember-btn").click(function(){
    username = $("#aum-username").val()
    password = $("#aum-password").val()
    console.log('click submit button');
    
    if (username.length <6) {
        $(".addmember-tips").removeClass('alert-success');
        $(".addmember-tips").addClass('alert-danger');
        $(".addmember-tips").text("至少6个字符,由字母和数字组成,已字母开头");
        $(".addmember-tips").removeClass('hide');
        return false;
    }
    if(password.length <6)  {
        $(".addmember-tips").removeClass('alert-success');
        $(".addmember-tips").addClass('alert-danger');
        $(".addmember-tips").text("密码至少由6个字符组成");        
        return false;
    }
    
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    
    $.post('/for28cqadmin/register/',{'username':username,'password':password},function(data,status){
        if(status =='success'){ 
            if (data.result == '1') {   //注册成功
                $(".addmember-tips").text(data.message);
                $(".addmember-tips").removeClass('hide');
                
                $("#aum-username").val('');
                $("#aum-password").val('');
            }
            else {  //注册失败
                $(".addmember-tips").text(data.message);
                $(".addmember-tips").removeClass('hide');
                $(".addmember-tips").addClass('alert-danger');
            }
        }
        else {
            $(".addmember-tips").text('注册失败,请稍候再试!');
            $(".addmember-tips").removeClass('hide');
            $(".addmember-tips").addClass('alert-danger');
        }
    });
    
});

$("#aum-username").focus(function(){
    console.log('focus on username');
    $(".addmember-tips").text("至少6个字符,由字母和数字组成,已字母开头");
    $(".addmember-tips").removeClass('alert-danger');
    $(".addmember-tips").addClass('alert-success');
    $(".addmember-tips").removeClass('hide');
});

$("#aum-password").focus(function(){
    console.log('focus on password');
    $(".addmember-tips").text("密码至少由6个字符组成");
    $(".addmember-tips").removeClass('alert-danger');
    $(".addmember-tips").addClass('alert-success');
    $(".addmember-tips").removeClass('hide');
});

$("#aua-username").focus(function(){
    $(".addagent-tips").text("至少6个字符,由字母和数字组成,已字母开头");
    $(".addagent-tips").removeClass('hide');
    $(".addagent-tips").addClass('alert-success');
});

$("#aua-password").focus(function(){
    $(".addagent-tips").text("密码至少由6个字符组成");
    $(".addagent-tips").removeClass('hide');
    $(".addagent-tips").addClass('alert-success');
});

$("#aua-agentbonus").focus(function(){
    $(".addagent-tips").text("请输入0到1之间的数字, 例如0.8表示占 80%");
    $(".addagent-tips").removeClass('hide');
    $(".addagent-tips").addClass('alert-success');
});

$("#aua-agcode").focus(function(){
    $(".addagent-tips").text("请添推荐人的用户名");
    $(".addagent-tips").removeClass('hide');
    $(".addagent-tips").addClass('alert-success');
});

$(".addagent-btn").click(function(){
    agentname = $("#aua-username").val();
    agentpwd = $("#aua-password").val();
    take = $("#aua-agentbonus").val();
//    agentcode = $("#aua-agcode").val();

    var codepattern = /^[a-zA-Z0-9]{5,10}$/;  //6-16位字母不含特殊字符
//     if (!codepattern.test(agentcode)) {
//        $(".addagent-tips").removeClass('alert-success');
//        $(".addagent-tips").addClass('alert-danger');
//        $(".addagent-tips").text("推荐人用户名至少6个字符,由字母和数字组成,以字母开头");
//        $(".addagent-tips").removeClass('hide');
//        return false;
//     }
    
    if(agentname.length <6) {
        $(".addagent-tips").removeClass('alert-success');
        $(".addagent-tips").addClass('alert-danger');
        $(".addagent-tips").text("至少6个字符,由字母和数字组成,以字母开头");
        $(".addagent-tips").removeClass('hide');
        return false;
    }
    if(agentpwd.length <6)    {
        $(".addagent-tips").removeClass('alert-success');
        $(".addagent-tips").addClass('alert-danger');
        $(".addagent-tips").text("密码至少由6个字符组成"); 
        $(".addagent-tips").removeClass('hide');
        return false;
    }
    ftake = parseFloat(take);
    if (ftake == NaN || ftake <0 || ftake>1) {
        $(".addagent-tips").removeClass('alert-success');
        $(".addagent-tips").addClass('alert-danger');
        $(".addagent-tips").text("请输入0到1之间的数字, 例如0.8表示占 80%");        
        $(".addagent-tips").removeClass('hide');
        return false;
    }
    
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    $.post('/for28cqadmin/addagent/',{'agentname':agentname,'agentpwd':agentpwd,'take':ftake},function(data,status){
        if(status == 'success') {
            if(data.result == 1) { //添加成功
                $(".addagent-tips").text("添加代理成功!");
                $(".addagent-tips").addClass('alert-success');
                $(".addagent-tips").removeClass('alert-danger');
                agentname = $("#aua-username").val('');
                agentpwd = $("#aua-password").val('');
            }
            else {  //添加失败
                $(".addagent-tips").removeClass('alert-success');
                $(".addagent-tips").addClass('alert-danger');    
                $(".addagent-tips").text(data.message);
            }
        }
        else {
            $(".addagent-tips").removeClass('alert-success');
            $(".addagent-tips").addClass('alert-danger');
            $(".addagent-tips").text("添加代理失败,请稍候再试...");        
            $(".addagent-tips").removeClass('hide');
        }
    });
});

$(".btn-alertmem").click(function(){
    mname = $(this).attr("id");
    arr = mname.split('-');
    username = arr[1];
    var sel = document.getElementById(username);
    selIndex = sel.selectedIndex;
    var selValue = sel.options[selIndex].value;
    
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    
    $.post('/for28cqadmin/alertmember/',{'username':username,'status':selValue},function(data,status){
        if (status == 'success') {
            if(data.result == 1) {
                alert('修改成功');
                window.location.reload()
            }
            else {
                alert(data.msg);
            }
        }
        else {
            alert('服务器繁忙,请稍候再试!');
        }
    });
    
});

$(".btn-alertagent").click(function(){
    username = $(this).attr('id');
    selid = "sel-"+username;
    sel = document.getElementById(selid);
    selIndex = sel.selectedIndex;
    var selValue = sel.options[selIndex].value;
    
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    
    $.post('/for28cqadmin/alertmember/',{'username':username,'status':selValue},function(data,status){
        if (status == 'success') {
            if(data.result == 1) {
                alert('修改成功');
                window.location.reload();
            }
            else {
                alert(data.msg);
            }
        }
        else {
            alert('服务器繁忙,请稍候再试!');
        }
    });
});
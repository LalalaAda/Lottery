// get cookie
var isLogin=false;
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
//var csrftoken = getCookie('csrftoken');
//$.ajaxSetup({
//    beforeSend: function(xhr, settings) {
//        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
//            xhr.setRequestHeader("X-CSRFToken", csrftoken);
//        }
//    }
//});

//登录框提交检测
function yx1(xs){ 
    if(xs.value=="6-20位字母"){  
      xs.value="";
      xs.style.color="#333";
    }
}
function yx2(xs){ 
    if(xs.value==""){  
       xs.value="6-20位字母";
       xs.style.color="#ccc";
    }
}

function checkuser1(){
    var yh = document.getElementsByName('username')[0].value;
    var userreg1 = /^([a-zA-Z0-9]+){6,16}$/;  //6-16位字母或数字不含特殊字符

   if (userreg1.test(yh)){
        document.getElementById("userTips").innerHTML="输入正确";
        document.getElementById("userTips").style.color="#00CD00";
        return true;
   }else {
        document.getElementById("userTips").innerHTML="用户名为6-21位字母或数字";
        document.getElementById("userTips").style.color="#ff0000";
        return false;
   }
} 

function checkpwd(){
  var yh = document.getElementsByName('password')[0].value;
  var userreg1 =/.{6,16}/;

  if (userreg1.test(yh)){
       document.getElementById("pwdTips").innerHTML="输入正确";
       document.getElementById("pwdTips").style.color="#00CD00";
         return true;
  }else {
       document.getElementById("pwdTips").innerHTML="密码为6-18位数字或字母";
       document.getElementById("pwdTips").style.color="#ff0000";
        return false;
  }
} 

function checkdl(){
     var dl = document.getElementsByName('dailishang')[0].value;
    if(dl.length<6){
        document.getElementById("dlTips").innerHTML="推荐人用户名长度不够，小于6位";
        document.getElementById("dlTips").style.color="#ff0000";
          return false;
    }else{
         document.getElementById("dlTips").innerHTML="";
          return true;
    }
}

function zhuce(){
    var u=document.getElementById('reg-username').value;
    var	p=document.getElementById('reg-password').value;
    var	t=document.getElementById('reg-agent').value;
    if(u!=''){
		if(p!=''){
			if(t!=''){
			    var data=checkuser();
			    var data1=checkpwd();
                var data2=checkdl();
			        //alert(data);
			        if(!data||!data1){
			        	//alert(1);
			            return false;
			        }else{
			            // alert(0);
			        	return true;
			        }													
			}else{
				alert('推荐代理人必填'); return false;
			}
		}else{
			alert('密码不能为空'); return false;
		}
	}else{
		alert('用户名不能为空'); return false;
	}	
}

function show(){
    var data = getData();
    //设置宽高，显示
    document.getElementById("bg").style.width= data[0]+"px";
    document.getElementById("bg").style.height= data[1]+"px";
    document.getElementById("bg").style.display = "block";
    document.getElementById("bg").style.backgroundColor = "rgba(200,200,200,0.6)";
}
   
function getData(){
   var arrData = new Array();
   if(window.innerWidth){  
	 arrData[0] = window.innerWidth;
	 arrData[1] =window.innerHeight;
    }else{
	 arrData[0] = document.documentElement.clientWidth;
	 arrData[1] = document.documentElement.clientHeight;
    }
   return arrData;
}
   
function dealData(){
    document.getElementById("bg").style.display = "none";
}
//注册表单检查
function checkRegisterInput() {
    var username = $("#reg-username").val();
    var password = $("#reg-password").val();
    var agentcode = $("#reg-agent").val();
    
    if (username == "") {   //请输入用户名
        return false;
    }
    if(password == "") {    //请输入密码
        return false;
    }
    if(agentcode == "") {   //请输入推荐人
        return false;
    }
    
    reg=/^[a-zA-Z0-9]{6,20}$/;
    
    if(!reg.test(username)) {   //用户名不符合规则
        console.log('用户名不符合规则');
        return false;
    }
    if(password.length <6)  {   //密码长度不够,小于6
        console.log('密码长度不够,小于6');
        return false;
    }
    if(agentcode.length <6) {   //代理商编码长度不够，小于6
        console.log('推荐人帐号长度不够，小于6');
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
    $.post('/register/', {'username': username, 'password': password, 'agentname': agentcode }, function (data, status) {
        if (status == 'success') {
            if (data.result == '0') {
                $("#dlTips").text("注册失败 : " + data.reason);
            }
            else if (data.result == '1') {
                $("#dlTips").text(data.reason + " ,2秒后跳转...");
                setTimeout("location.href='/'",2000);
            }
        }
        else {
            $("#dlTips").text("系统繁忙,请稍候再试");
        }
    });
};

//点击注册按钮事件
$(".register-btn").click(checkRegisterInput);

//在注册页面点击登录链接事件
$(".reg-to-login").click(function(){
    $("#registermodal").modal('hide');
});
//在登录页点击注册连接事件

$(".reg-to-login").click(function(){
	$("#loginmodal").modal('hide');
});

//退出按钮事件
$("#btn-logout").click(function () {
    $.get('/logout/', function (data, status) {
        if (status == 'success') {
            console.log("success logout");
            location.href = "/";
        }
        else {
            console.log('logout failed!');
        }

    });
});

//登录按钮事件
$(".btn-login").click(function () {
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    username = $("#inputusername").val();
    password = $("#inputpassword").val();

    if (username == '') {
        alert("用户名不能为空");
        return false;
    }
    if (password == '') {
        alert("密码不能为空");
        return false;
    }
    $.post('/login/', { 'logusername': username, 'logpassword': password }, function (data, status) {
        if (status == 'success') {
            if (data.result == '1') {
                console.log("登录成功");
                location.href = "/";
            }
            else {
                alert("登录失败:" + data.reason);
            }
        }
        else {
            alert("服务器繁忙,请稍候再试");
        }
    });

});

//弹出modal框,登录事件
$(".login-btn").click(function () {
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    username = $("#login-username").val();
    password = $("#login-password").val();

    if (username == '') {
        $("#mimatishi").text("用户名不能为空");
        return false;
    }
    else {
        console.log("elsedi kskdf");
        $("#mimatishi").text("");
    }
    
    if (password == '') {
        $("#mimatishi").text("密码不能为空")
        return false;
    }
    else {
        $("#mimatishi").text("");
    }
    $.post("/login/", { 'logusername': username, 'logpassword': password }, function (data,status) {
        if (status == 'success') {
            if (data.result == '1') {
                $("#mimatishi").text("登录成功!");
                location.href = "/";
            }
            else {
                $("#mimatishi").text("登录失败," + data.reason);
            }
        }
        else {
            $("#mimatishi").text("服务器繁忙,请稍候再试");
        }
    });
});

//导航菜单事件
$("#menuname a").click(function(){
  $("#menu ul li ul").slideToggle("slow");
  $("#menu ul li ul li").css("background","#02c893");
});

$("#menu ul li ul li").mouseover(function(){
    $(this).css("background","#ff0000").siblings().css("background","#02c893");
});
$("#gameid1").click(function(){
     $(this).css("background","#ff0000").siblings().css("background","#02c893");
    
});
$("#gameid2").click(function(){
     $(this).css("background","#ff0000").siblings().css("background","#02c893");
    
});
$("#refresh28").click(function(){
     $(this).css("background","#ff0000").siblings().css("background","#02c893");
    
});



//判断是否登录及屏幕尺寸来显示欢迎页面
 $.get('/checklogin/',function(data,status){
        if(data!=null){
            if(data.islogedin>0){
            	isLogin=true;
            }
            if(isLogin==true){
               $("#UeserID_box").css("display","block");
               $("#UeserID_name").css("display","block");
               $("#UeserID_int").css("display","block");
               $("#UeserID_name").css("display","inline");
               $("#UeserID_int").css("display","inline");  
            }
        }
    });
window.onload=getScreen();
function getScreen(){
    var screen=window.screen.width;//获取屏幕尺寸来决定登录后是否显示导航内容
    if(screen<=768){
        $("#menu").css("display","block");
        $("#login2").css("display","block");
    }
 }

   
$("#loginto").click(function(){//显示登录框
    $("#menu ul li ul").slideUp("slow");
    $(function(){ $("#loginmodal").modal();});
});
$("#loginouT").click(function(){//退出时清除ISlogin
    $("#menu ul li ul").slideUp("slow");
    $("#login2").hide();
    isLogin=false;
});









































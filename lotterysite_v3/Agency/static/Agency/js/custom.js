$(function() {

    $('#side-menu').metisMenu();

});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    $(window).bind("load resize", function() {
        topOffset = 50;
        width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    var element = $('ul.nav a').filter(function() {
        return this.href == url || url.href.indexOf(this.href) == 0;
    }).addClass('active').parent().parent().addClass('in').parent();
    if (element.is('li')) {
        element.addClass('active');
    }
});


function show1(){
//	            document.getElementById("huiyuanbiao").style.display="none";
//                document.getElementById("addhuiyuanDiv").style.display="block";
    $("#adduserAndmember").modal();
}


function addhuiyuan(){
	             var x="",y="";
                 x=document.getElementById("username").value;
                 y=document.getElementById("password").value;
                 var tip=document.getElementById("tipMsg");
                  if(x==""||y==""){
                    tip.innerHTML="账号名称和密码不能为空!";
                     }
                   return false;
                }
function show2(){
//	            document.getElementById("dailibiao1").style.display="none";
//                document.getElementById("adddailiDiv").style.display="block";
    $("#adduserAndagent").modal();
}


function adddaili(){
	             var x="",y="";
                 x=document.getElementById("username").value;
                 y=document.getElementById("password").value;
                 var tip=document.getElementById("tipMsg");
                  if(x==""||y==""){
                    tip.innerHTML="账户名和密码不能为空!";
                     }
                   return false;
                }

function data1(){ /*alert ('132')*/
	           document.getElementById("chakankuang1").style.display="block";
			   document.getElementById("chakankuang2").style.display="none";
			   document.getElementById("chakankuang3").style.display="none";
	}
function data2(){ 
	           document.getElementById("chakankuang1").style.display="none";
			   document.getElementById("chakankuang2").style.display="block";
			   document.getElementById("chakankuang3").style.display="none";
	}


function show3(){
	            document.getElementById("kefubiao1").style.display="none";
                document.getElementById("addkefu").style.display="block";

	}

function kefuadd(){
	             var x="",y="",z="";
                 x=document.getElementById("username").value;
                 y=document.getElementById("password").value;
				 z=document.getElementById("password1").value;
                 var tip=document.getElementById("tipMsg");
                  if(x==""||y==""||z==""){
                    tip.innerHTML="账户名和密码不能为空!";
                     }
                   return false;
                }



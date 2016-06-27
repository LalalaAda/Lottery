var isPC=true;//是否为pc
var isLogin=false;//是否已登录
var serverTime="";
var GAMEID=0;//需要在getwebinfo中获取游戏id
var whichGame=1;
var gameIssueNo=8888;
var ding1=0;
var ding2=0;
var ding3=0;
var ding4=0;//getchat定时器
var game=[];//期的数组
var nowIndex=0;//当前期下标 即最后一个0
var USER="";
var balance1=0;
var balance2=0;
var theBet=[];
var serverBet=[];
var chatID=0;
var isStillThisIssue=false;//是否还是这一期
var isAlreadyTZ=false;
var XIANZAIstatus=-1;//0代表可以投注1代表倒计时-1初始化

var fanhui01=new Object();
var mobileBet=[];
var newMoblieBet=[];

window.onload=getScreen();
//判断屏幕尺寸
function getScreen(){
    var screen=window.screen.width;
    $.get('/checklogin/',function(data,status){
        if(data!=null){
            if(data.islogedin>0){
                isLogin=true;
                getWhoAndMoney();
                if(sessionStorage.whichgame&&sessionStorage.whichgame==2){
                    cana28();
                }
            }
        }
    });

    if(screen<=768){
        isPC=false;
        if(screen<400){
            $(".head_add_p3").html("上一期:");
            document.getElementById("ip_head_prere02").style.marginTop="-2px";
            document.getElementById("ip_now_status").style.fontSize="0.9em";
        }
    }
    if(!sessionStorage.chatid1){getAnn(1);getAnn(2);}
    
    getWebInfo(whichGame==1?1:2);
};

//加拿大28
function cana28(){
    if(isPC){
        $("#gm_button2").toggleClass("btn-warning",true);
        $("#gm_button1").toggleClass("btn-warning",false);
        gameInit();
        chatroomInit();
        touzhu(-1);
        whichGame=2;
        sessionStorage.whichgame=whichGame;
        getWebInfo(whichGame);    
    }else{
        gameInit();
        chatroomInit();
        whichGame=2;
        sessionStorage.whichgame=whichGame;
        getWebInfo(whichGame);
    }  
}

//获取公告
function getAnn(index){
    $.get('/getann/',{"type":index},function(data,status){
        if(status!="success"){
            console.log("获取公告或者福利消息失败")
            return;
        }else{
            if(data!=null){
                //console.log("公告数据"+data);
                if(data.result!=1){
                    //console.log("获取公告失败");
                    return;
                }
                var anncon=data.content;
                showSysMessage("系统公告",anncon);
                gundongdi();
            }else{
                console.log("没有公告");
            }
        }
    });
}

//系统消息的显示
function showSysMessage(systype,mes){
    if(mes!=""){
        document.getElementById("chat_Ul").innerHTML+="<li class=\"chat_li\"><div class=\"alert alert-success chat_li_div\" style=\"background-color:#ff0\" role=\"alert\"><span class=\"chat_sp_name chat_sp_name_important\">"+systype+"："+"</span><span class=\"chat_sp_content\">"+mes+" "+"</span></div></li>";    
    }else{
        console.log("没有系统消息");
    }
    gundongdi();
    storedInTheLocal();
}

//初始化游戏数据
function gameInit(){
    isStillThisIssue=false;
    serverTime="";
    gameIssueNo=0;
    clearTheTime();
    GAMEID=0;
    game.length=0;
    nowIndex=0;
    theBet.length=0;
    serverBet.length=0;
    mobileBet.length=0;
    pcBetEmpty();
}
function chatroomInit(){
    document.getElementById('chat_Ul').innerHTML="";
    document.getElementById("chat_Ul").innerHTML+="<li class=\"chat_li\"><div class=\"alert alert-success chat_li_div\" role=\"alert\"><span class=\"chat_sp_name chat_sp_name_important\">"+"系统消息"+"："+"</span><span class=\"chat_sp_content\">"+"欢迎来到★28传奇★娱乐城"+" "+"</span></div></li>";
    //getAnn(0);getAnn(1);getAnn(2);getAnn(3);getAnn(4);
}

//游戏选择
$("#gm_button1").click(function(){
    $(this).toggleClass("btn-warning",true);
    $("#gm_button2").toggleClass("btn-warning",false);
    gameInit();
    chatroomInit();
    touzhu(-1);
    whichGame=1;
    sessionStorage.whichgame=whichGame;
    getWebInfo(whichGame);
});
$("#gm_button2").click(function(){
    $(this).toggleClass("btn-warning",true);
    $("#gm_button1").toggleClass("btn-warning",false);
    gameInit();
    chatroomInit();
    touzhu(-1);
    whichGame=2;
    sessionStorage.whichgame=whichGame;
    getWebInfo(whichGame);
});
//手机游戏切换
$("#gameid1").click(function(){
    gameInit();
    chatroomInit();
    whichGame=1;
    sessionStorage.whichgame=whichGame;
    getWebInfo(whichGame);
});
$("#gameid2").click(function(){
    
    gameInit();
    chatroomInit();
    whichGame=2;
    sessionStorage.whichgame=whichGame;
    getWebInfo(whichGame);
});


// 选组合选特码等
function changeGameSelect(index) {
    if(isPC){
        var op1=document.getElementById('pc_doBet_Options1');
        var op2=document.getElementById('pc_doBet_Options2');
        var op3=document.getElementById('pc_doBet_Options3');
        switch (index) {
            case 1:
                {	
                    op1.style.display = "block";
                    op2.style.display = "none";
                    op3.style.display = "none";
                    break;
                }
            case 2:
                {	
                    op1.style.display="none";
                    op2.style.display="block";
                    op3.style.display="none";
                    break;
                }
            case 3:
                {
                    op1.style.display = "none";
                    op2.style.display = "none";
                    op3.style.display = "block";
                    break;
                }
	   }
    }
};

//显示投注按钮区 并显示投注的期号 与初始的余额
function touzhu(index) {
    if(index!=3&&index!=-1){console.log("请正确选择投注期号");return;}
    var chatroom=document.getElementById('chatroom');
    if(!isLogin){
        $(function(){ $("#loginmodal").modal();});    
    }else{
        if(index<0){
            document.getElementById('pc_lottery_box').style.height = "274px";
            chatroom.style.height = "361px";
            chatroom.scrollTop=chatroom.scrollHeight;
            document.getElementById('pc_Bet').style.display = "none";
            return;
        }else{
            document.getElementById('pc_lottery_box').style.height = "100px";
            chatroom.style.height = "220px";
            chatroom.scrollTop=chatroom.scrollHeight;
            document.getElementById('pc_Bet').style.display = "block";    
        }
        
        pcBetEmpty();
        var hh=document.getElementById('g_qihao_'+index).innerHTML;
        document.getElementById('pc_Bet_Num').innerHTML=hh;
        gameIssueNo=parseInt(hh,10);
        document.getElementById('pc_Bet_Blance').innerHTML=balance1;
    }
};

//单击投注按钮弹出筹码框 大于0弹出-1消失 
function touzhuPopup(index) {
    var maskdiv=document.getElementById('pc_doBet_Mask_Div');
    var showdiv=document.getElementById('pc_doBet_Show_Div');
    var tztselect=document.getElementById('pc_doBet_Select');
    var tztodds=document.getElementById('pc_doBet_SelectOdds');
	if (index>0) {
		maskdiv.style.display ="block";
        showdiv.style.display ="block";
        document.getElementById('pc_doBet_Money').value="";  
        if (index<50) {
        	if ((index-1)<=9) {
        		var x="特码0"+(index-1);
        	}else{
        		var x="特码"+(index-1);
        	}
        	mineSelect(x,"12.0",index);
        }
    };
	switch(index){
		case -1:{
			maskdiv.style.display ="none";
            showdiv.style.display ="none";
			break;
		}
		case 1000:{
			mineSelect("小","2.0");
			break;
		}
		case 1100:{
			mineSelect("大","2.0");
			break;
		}
		case 1001:{
			mineSelect("小单","4.0");
			break;
		}
		case 1002:{
			mineSelect("小双","4.0");
			break;
		}
		case 1101:{
			mineSelect("大单","4.0");
			break;
		}
		case 1102:{
			mineSelect("大双","4.0");
			break;
		}
		case 1201:{
			mineSelect("单","2.0");
			break;
		}
		case 1202:{
			mineSelect("双","2.0");
			break;
		}
		case 1111:{
			mineSelect("极大","12.0");
			break;
		}
		case 1010:{
			mineSelect("极小","12.0");
			break;
		}

	};
	function mineSelect(x,y){
		tztselect.innerHTML=x;
		tztodds.innerHTML=y;
	};
};

//ajax获取webinfo
function getWebInfo(whichgame){
    
    $("#youyixiazhu").html(0);
    mobileclearBname();
    document.getElementById('ip_submit_btn').removeAttribute("disabled");
    
    if(sessionStorage.content1){
        if(whichGame==1){
            document.getElementById('chat_Ul').innerHTML=sessionStorage.content1;
            chatID=sessionStorage.chatid1==null?0:sessionStorage.chatid1;
        }else{
            if(sessionStorage.content2){
                document.getElementById('chat_Ul').innerHTML=sessionStorage.content2;
                chatID=sessionStorage.chatid2==null?0:sessionStorage.chatid2;
            }
        }
        gundongdi();
    }else{
        getAnn(1)//获取福利信息         
    }
    isStillThisIssue=false;
    //获取服务器上的信息
    $.get('/getdata/',{"type":whichgame},function(data,status){
        //console.log(whichgame+"========"+data);
        if(data!=null){
            serverTime=(data.servertime);
            // 判断服务器时间 然后优先跳转到加拿大28特殊处理
            var lj=serverTime.indexOf('.');
            serverTime=serverTime.substring(0,lj);
            var ljtime=serverTime.replace(/[TZ]/g," ");
            var ljdate=new Date(ljtime);
            if(ljdate.getHours>=23&&ljdate.getMinutes>5){
                cana28();
            }
            //console.log("服务器时间"+serverTime);
            var result=data.result;
            if(result==0){
                alert("连接服务器失败。");
                return;
            }
            var sss=data.data;
            if(sss=="[]"){
                console.log("没有数据");
                return;
            }
            var obj=eval(sss);
            var isfirst=true;
            GAMEID=obj[0].fields.gameid;
            //console.log(GAMEID);
            $.each(obj,function(i,item){
                if(i<=13){
                    var ogame=new Array();
                    ogame[0]=item.fields.issueNO;
                    var q=ogame[1]=item.fields.bopened;
                    if(q>0&&isfirst){
                        nowIndex=i-1;
                        isfirst=false;
                    }
                    ogame[2]=item.fields.lotterytime;
                    var w=item.fields.resultdetail;
                    if(w!=""){
                        var ss=w.split(",");
                        ogame[3]=ss;
                    }else{
                        ogame[3]=0;
                    }    
                    ogame[4]=item.fields.result;
                    ogame[5]=item.pk;
                    game[i]=ogame;
                    ogame=null;
                }
            });
            switch(nowIndex){
                case 2:
                    getGameID();
                    showTen(3);
                    showTenMore();
                    getmobileIssueNoyuer();
                    break;
                case 1:
                    special(1);
                    showTen(2);
                    showTenMore();
                    getmobileIssueNoyuer();
                    break;
                case 0:
                    special(0);
                    showTen(1);
                    showTenMore();
                    getmobileIssueNoyuer();
                    break;
                case -1:
                    showTen(0);
                    showTenMore();
                    getmobileIssueNoyuer();
                    break;
                default:
                    console.log("没有可投注的信息");
                    alert("暂无竞猜，请刷新页面");
                    window.location.href=location;
                    break;
            }             
            //获取聊天信息
            getChat();
            if(ding4!=0){clearInterval(ding4);ding4=0;}
            ding4=setInterval("getChat()",5000);
        }
    });

    //显示开奖结果及历史十期
    function showResult(){
        if(whichGame==1){
            if(sessionStorage.status1==3||sessionStorage.status1==null){
                if(sessionStorage.number1==gameIssueNo){return;}
                sessionStorage.status1=4;
            }else{
                return;
            }
        }else{
            if(sessionStorage.status2==3||sessionStorage.status2==null){
                if(sessionStorage.number2==gameIssueNo){return;}
                sessionStorage.status2=4;
            }else{
                return;
            }
        }
        
        var df="";
        var sf=game[3][4];
        if(parseInt(sf,10)<10){
            df="0"+sf;
        }else{
            df=sf;
        }
        //显示开奖历史 结果公布
        var historyisu="";
        for(var i=9;i>=0;i--){
            var t=i+3;
            var nnumn=game[t][4];
            if(nnumn<10){
                nnumn="0"+nnumn;
            }
            historyisu+=nnumn+" ";
        }
        var category=checkBSSD(df);
        var sf="";
        if(isPC){
            showSysMessage("系统消息","第"+(gameIssueNo-1)+"期："+"&nbsp;"+""+document.getElementById('pc_head_preresult').innerHTML+df+" "+category+ "&nbsp;");    
        }else{
            showSysMessage("系统消息","第"+(gameIssueNo-1)+"期："+"&nbsp;"+""+document.getElementById('ip_head_preresult').innerHTML+df+" "+category+ "&nbsp;");
        }
        
        showSysMessage("系统消息","近十期："+"&nbsp;"+historyisu+"&nbsp;");
        gundongdi();
        //显示上局盈亏
        getfyingkui();    
    }
    //显示近十期
    function showTen(num){
       if(!isPC){
            for (var q=0;q<10;q++){
                var t=num+q;
                var ie="numinphone"+(9-q);
                var tt=game[t][4];
                if(tt<10){tt="0"+""+tt;};
                document.getElementById(ie).innerHTML=tt;
            }    
        }else{
            for(var q=0;q<10;q++){
                var t=num+q;
                var ie="numinpc"+(9-q);
                var tt=game[t][4];//近十期结果
                if(tt<10){tt="0"+""+tt;};
                document.getElementById(ie).innerHTML=tt;
            }
        } 
    }
    //显示近十期详情
    function showTenMore(){
        var stime=serverTime.replace(/[TZ]/g," ");
        var itemtime=game[2][2].replace(/[TZ]/g," ");
        
        //处理23:55分之后 快乐28不开奖
        if(whichgame==1){
            var overdate=new Date(stime);//用于判断快乐28的时间
            var ahour=overdate.getHours();
            var aminute=overdate.getMinutes();
            if(ahour>=23){
                if(ahour==23&&aminute<56){
                    
                }else{
                    cana28();
                    guolashijian(false);
                    return;
                }
            }
            if(ahour<=9){
                if(ahour==9&&aminute>=5){
                    
                }else{
                    cana28();
                    guolashijian(true);
                    return;
                }
            }
        }
        //全部显示已开奖
        function guolashijian(isam){
            $("#g_start_btn3").setAttribute('disabled',"disabled");
            document.getElementById('pc_nowNum').innerHTML=game[0][0];
            document.getElementById('ip_nowNum').innerHTML=game[0][0];
            gameIssueNo=game[0][0];
            for(var q=0;q<10;q++){
                document.getElementById("g_qihao_"+(q+3)).innerHTML=game[q][0];
                var oktime=game[q][2];
                document.getElementById("g_qihao_time"+(q+3)).innerHTML=oktime.replace(/[TZ]/g," ");
                if(!isam){
                    document.getElementById("pc_now_status").innerHTML="本日竞猜已结束";
                    document.getElementById('pc_head_time').innerHTML="--";
                    document.getElementById('ip_now_status').innerHTML="本日竞猜已结束";
                    document.getElementById('g_t_ltime').innerHTML="--"
                }else{
                    document.getElementById("pc_now_status").innerHTML="今日竞猜未开始";
                    document.getElementById('pc_head_time').innerHTML="--";
                    document.getElementById('ip_now_status').innerHTML="今日竞猜未开始";
                    document.getElementById('g_t_ltime').innerHTML="--";
                }
                var igame=[];
                for(var g=0;g<3;g++){igame[g]=parseInt(game[q][3][g],10);}
                var result=parseInt(game[q][4],10);
                var df="";
                if(result<10){df="0"+result;}else{df=result;}
                document.getElementById('g_result'+(q*100+301)).innerHTML=igame[0]+" + "+igame[1]+" + "+
                igame[2]+" = ";
                document.getElementById('g_result'+(q*100+301)+"_2").innerHTML=df;
                if(q==1){
                    document.getElementById("pc_head_preresult").innerHTML=igame[0]+
                    " + "+igame[1]+" + "+igame[2]+" = ";
                    document.getElementById('ip_head_preresult').innerHTML=igame[0]+
                    " + "+igame[1]+" + "+igame[2]+" = ";
                    document.getElementById('pc_head_prere02').innerHTML=df;
                    document.getElementById('ip_head_prere02').innerHTML=df;
                    document.getElementById("pc_head_prenum").innerHTML=game[q][0];
                }
            }
        }
     
        
        stime=Date.parse(stime.replace(/-/g,"/"));
        itemtime=Date.parse(itemtime.replace(/-/g,"/"));
        
        if(isPC){
            document.getElementById('pc_nowNum').innerHTML=game[2][0];
            gameIssueNo=game[2][0];
        }else{
            document.getElementById('ip_nowNum').innerHTML=game[2][0];
            gameIssueNo=game[2][0];
            //console.log("xxxxxxxxxxxxx");
        }
        
        for(var y=2;y<10;y++){
            document.getElementById("g_qihao_"+(y+1)).innerHTML=game[y][0];
            var oktime=game[y][2];
            document.getElementById("g_qihao_time"+(y+1)).innerHTML=oktime.replace(/[TZ]/g," ");
            if(y==2){
                if((stime+30000)<itemtime){
                    //可投注
                    document.getElementById("g_qihao_3").innerHTML=game[2][0];
                    //将parseint方法改成了math.floor
                    var can=Math.floor((itemtime/1000-stime/1000)-30);
                    //alert(can);
                    //console(can);
                    if(isPC){
                        document.getElementById('pc_head_time').innerHTML=can;
                        document.getElementById("g_start_btn3").innerHTML="投注";
                        document.getElementById('g_start_btn3').disabled=false;
                    }else{
                        document.getElementById('g_t_ltime').innerHTML=can;
                        document.getElementById('should_submit').removeAttribute('disabled');
                    }
                    if(can<60){
                        if(whichGame==1){
                            //console.log(sessionStorage.status1);
                            if(sessionStorage.status1==1||sessionStorage.status1==null){
                                sessionStorage.status1=2;
                                showSysMessage("系统消息","-----距离封盘还有60秒-----抓紧时间下注-----");
                                gundongdi();        
                            }
                        }else{
                            //console.log(sessionStorage.status2);
                            if(sessionStorage.status2==1||sessionStorage.status2==null){
                                sessionStorage.status2=2;
                                showSysMessage("系统消息","-----距离封盘还有60秒-----抓紧时间下注-----");
                                gundongdi();
                            }
                        }
                    }
                    //启动定时器
                    clearTheTime();
                    ding1=setInterval('canTime()',1000);
                    //放置开始下注  但是盈亏会被挤下
                    
                    document.getElementById("pc_now_status").innerHTML="离截止投注结束时间：";
                    document.getElementById('ip_now_status').innerHTML="截止投注时间：";
                }else{
                    
                    if(whichGame==1){                           
                        if(sessionStorage.status1==1||sessionStorage.status1==2||sessionStorage.status1==null){
                                sessionStorage.status1=3;
                            sessionStorage.number1=gameIssueNo;
                                showSysMessage("系统消息","---------------------封盘停止下注等待开奖---------------------");
                                gundongdi();        
                        }
                    }else{
                        if(sessionStorage.status2==1||sessionStorage.status2==2||sessionStorage.status2==null){
                            sessionStorage.status2=3;
                            sessionStorage.number2=gameIssueNo;
                            showSysMessage("系统消息","---------------------封盘停止下注等待开奖---------------------");
                            gundongdi();
                        }
                    }
                    //正在开奖中 激活ajax程序和倒计时程序 5秒获取一次服务器信息
                    if(isPC){
                        document.getElementById("g_start_btn3").innerHTML="等待开奖";
                        document.getElementById('g_start_btn3').disabled=true;
                        document.getElementById("pc_now_status").innerHTML="离开奖时间还有：";
                        document.getElementById('pc_head_time').innerHTML=60;    
                    }else{
                        document.getElementById('ip_now_status').innerHTML="离开奖时间还有：";
                        document.getElementById('g_t_ltime').innerHTML=60;
                        document.getElementById('ip_submit_btn').setAttribute("disabled","disabled");
                    }
                    clearTheTime();
                    ding2=setInterval("wantTime()",1000);
                    ding3=setInterval("mmajax("+game[2][0]+")",5000);
                }
            }else if(y>2){
                var igame=[];
                //快乐28和加拿大28
                if(game[y][3].length>4){
                    for(var g=0;g<20;g++){igame[g]=parseInt(game[y][3][g],10);};                    
                    var n1=0;var n2=0;var n3=0; 
                    for(var qq=0;qq<6;qq++){n1+=igame[qq];}
                    for(var qq=6;qq<12;qq++){n2+=igame[qq];}
                    for(var qq=12;qq<18;qq++){n3+=igame[qq];}
                    
                    var result=n1%10+n2%10+n3%10;
                    if(result!=parseInt(game[y][4],10)){
                        console.log("计算的结果不一致"+result+""+game);
                        //getWebInfo();
                    }else{
                        var df="";
                        if(result<10){
                            df="0"+result;
                        }else{
                            df=result;
                        }
                        document.getElementById("g_result"+(y*100+101)).innerHTML=(n1%10)+" + "+(n2%10)+" + "+(n3%10)+" = ";
                        document.getElementById("g_result"+(y*100+101)+"_2").innerHTML=df;
                        if(y==3){
                            //显示顶部上一期详情
                            document.getElementById("pc_head_preresult").innerHTML=(n1%10)+" + "+(n2%10)+" + "+(n3%10)+" = ";
                            document.getElementById('ip_head_preresult').innerHTML=(n1%10)+" + "+(n2%10)+" + "+(n3%10)+" = ";
                            document.getElementById('pc_head_prere02').innerHTML=df;
                            document.getElementById('ip_head_prere02').innerHTML=df;
                            document.getElementById("pc_head_prenum").innerHTML=game[y][0];
                        }
                    }    
                }else{
                    for(var g=0;g<3;g++){igame[g]=parseInt(game[y][3][g],10);}
                    var result=parseInt(game[y][4],10);
                    var df="";
                    if(result<10){df="0"+result;}else{df=result;}
                    document.getElementById('g_result'+(y*100+101)).innerHTML=igame[0]+" + "+igame[1]+" + "+
                    igame[2]+" = ";
                    document.getElementById('g_result'+(y*100+101)+"_2").innerHTML=df;
                    if(y==3){
                        document.getElementById("pc_head_preresult").innerHTML=igame[0]+
                        " + "+igame[1]+" + "+igame[2]+" = ";
                        document.getElementById('ip_head_preresult').innerHTML=igame[0]+
                        " + "+igame[1]+" + "+igame[2]+" = ";
                        document.getElementById('pc_head_prere02').innerHTML=df;
                        document.getElementById('ip_head_prere02').innerHTML=df;
                        document.getElementById("pc_head_prenum").innerHTML=game[y][0];
                        
                    }    
                }
                
            }
        }
        
        //显示出开奖结果 之后转 可以投注
        showResult();
    }
    
    //当服务器传过来只有一个0或两个0时
    function special(index){
        var kgame=new Array();
        kgame[0]=game[0][0];
        kame[1]=game[0][1];
        kgame[2]=game[0][2];
        kgame[3]=game[0][3];    
        kgame[4]=game[0][4];
        kgame[5]=game[0][5];
        //添加一条记录
        if(index==1){
            game.splice(0,0,kgame);
            kgame=null;
        }else{
            game.splice(0,0,kgame);
            game.splice(0,0,kgame);
            kgame=null;
        }
    }
};

//清除定时器
function clearTheTime(){
    if(ding1!=0){clearInterval(ding1);ding1=0;}
    if(ding2!=0){clearInterval(ding2);ding2=0;}
    if(ding3!=0){clearInterval(ding3);ding3=0;}
}

//显示上局盈亏
function getfyingkui(){
    var mobileIssueNo=gameIssueNo;//此时是当前期
    if(mobileIssueNo==888888){return;}
    var mobileIssueNo1=parseInt(mobileIssueNo-1,10);//上一期的期号
      $.get('/getcurwl/',{"gameid":GAMEID,"issueNO":mobileIssueNo1},function(data1,status){
          //console.log(data1);
          var ba=data1.balance==null?0:data1.balance;
        showSysMessage("系统消息","  您上局盈亏为:"+ba+"&nbsp;");
          if(whichGame==1){
              if(sessionStorage.status1==4||sessionStorage.status1==null){
                  showSysMessage("系统消息","------开始下注-------");
                  sessionStorage.status1=1;
              }
          }else{
              if(sessionStorage.status2==4||sessionStorage.status2==null){
                  showSysMessage("系统消息","------开始下注-------");
                  sessionStorage.status2=1;
              }
          }
      });
}

//根据系统结果判断大双小双等
function checkBSSD(num){
    num=parseInt(num,10);
    var sdf="";
    if(num<0){console.log("result is error");return;}
    if(num==13||num==14){
        sdf="";
    }else if(num%2==0&&num<13){
        sdf="小双";
    }else if(num%2==0&&num>14){
        sdf="大双";
    }else if(num%2!=0&&num<13){
        sdf="小单";
    }else if(num%2!=0&&num>14){
        sdf="大单";
    }
    return sdf;
}

//投注倒计时功能
function canTime(){
    //1pc端 2手机端
    if(isPC){
        var head=document.getElementById('pc_head_time');
        var btn=document.getElementById('g_start_btn3');
        var a=head.innerHTML;
        var b=parseInt(a,10)-1;
        
        if(b>=0){
            btn.disabled=false;
            btn.innerHTML="投注";
            head.innerHTML=b;
            head.style.background="#337ab7";
            if(b==60){
                //console.log("do ....");
                if(whichGame==1){
                    //console.log(sessionStorage.status1);
                    if(sessionStorage.status1==1||sessionStorage.status1==null){
                        sessionStorage.status1=2;
                        showSysMessage("系统消息","-----距离封盘还有60秒-----抓紧时间下注-----");
                        gundongdi();        
                    }
                }else{
                    //console.log(sessionStorage.status2);
                    if(sessionStorage.status2==1||sessionStorage.status2==null){
                        sessionStorage.status2=2;
                        showSysMessage("系统消息","-----距离封盘还有60秒-----抓紧时间下注-----");
                        gundongdi();
                    }
                }
                
            }
            if(b<10){
                head.style.background="#ff0000";
                if(b==0){
                    head.style.background="#111";
                    //btn.setAttribute("disabled", "disabled");
                    btn.disabled=true;
                    btn.innerHTML="等待开奖";
                    //公告提示 封盘 停止下注 等待开奖
                    
                }
            }
            
        }else{
            btn.innerHTML="等待开奖";
            btn.disabled=true;
            document.getElementById("pc_now_status").innerHTML="离开奖时间还有：";
            head.style.background="#337ab7";
            head.innerHTML=60;
            if(ding2!=0){clearInterval(ding2);ding2=0;}
            if(ding3!=0){clearInterval(ding3);ding3=0;}
            ding2=setInterval("wantTime()",1000);
            ding3=setInterval("mmajax("+game[2][0]+")",5000);
            if(ding1!=0){clearInterval(ding1);ding1=0;}
        }
    }else{
        var c=document.getElementById('g_t_ltime').innerHTML;
        var d=parseInt(c,10)-1;
        if(d>=0){
            document.getElementById('g_t_ltime').innerHTML=d;
            document.getElementById('g_t_ltime').style.background="#337ab7";
            if(d==60){
                if(whichGame==1){
                    if(sessionStorage.status1==1||sessionStorage.status1==null){
                        sessionStorage.status1=2;
                        showSysMessage("系统消息","-----距离封盘还有60秒-----抓紧时间下注-----");
                        gundongdi();        
                    }
                }else{
                    if(sessionStorage.status2==1||sessionStorage.status2==null){
                        sessionStorage.status2=2;
                        showSysMessage("系统消息","-----距离封盘还有60秒-----抓紧时间下注-----");
                        gundongdi();
                    }
                }
            }
            if(d<10){
                document.getElementById('g_t_ltime').style.background="#ff0000";
                if(d==0){
                    document.getElementById('g_t_ltime').style.background="#111";
                }
            }  
        }else{
            document.getElementById('ip_submit_btn').setAttribute("disabled","disabled");
            
            document.getElementById("ip_now_status").innerHTML="离开奖时间还有：";
            document.getElementById('g_t_ltime').style.background="#337ab7";
            document.getElementById('g_t_ltime').innerHTML=60;
            
            if(ding2!=0){clearInterval(ding2);ding2=0;}
            if(ding3!=0){clearInterval(ding3);ding3=0;}
            ding2=setInterval("wantTime()",1000);
            ding3=setInterval("mmajax("+game[2][0]+")",5000);
            if(ding1!=0){clearInterval(ding1);ding1=0;}
        }
    }      
};

//开奖倒计时
function wantTime(){
    
    if(whichGame==1){
        if(sessionStorage.status1==1||sessionStorage.status1==2||sessionStorage.status1==null){
            sessionStorage.status1=3;
            sessionStorage.number1=gameIssueNo;
            showSysMessage("系统消息","---------------------封盘停止下注等待开奖---------------------");
            gundongdi();        
        }
    }else{
        if(sessionStorage.status2==1||sessionStorage.status2==2||sessionStorage.status2==null){
            sessionStorage.status2=3;
            sessionStorage.number2=gameIssueNo;
            showSysMessage("系统消息","---------------------封盘停止下注等待开奖---------------------");
            gundongdi();
        }
    }
    if(isPC){
        var wahead=document.getElementById('pc_head_time');
        var ddd=wahead.innerHTML;
        var fff=parseInt(ddd,10)-1;
        if(fff>=0){
            wahead.innerHTML=fff;    
        }else{
            wahead.innerHTML=60;
        }
        
    }else{
        var ggg=document.getElementById('g_t_ltime').innerHTML;
        var hhh=parseInt(ggg,10)-1;
        if(hhh>=0){
            document.getElementById('g_t_ltime').innerHTML=hhh;    
        }else{
            document.getElementById('g_t_ltime').innerHTML=60;
        }
    }
    
};

//ajax请求当期的开奖结果
function mmajax(nowIssueNum){
    $.get('/ckresult/',{'klno':nowIssueNum},function(data,status){
       if(data!=null){
           //标志位为1是有结果 标志位为0无结果
           var s=parseInt(data.result,10);
           if(s==1){
               //window.location.reload();
               //window.location.href=location;
               gameInit();
               getWebInfo(whichGame);
               if(isLogin){getWhoAndMoney();}
           }else{
               //console.log(s+" "+nowIssueNum);
           }
       } 
    });
};

//聊天功能
function getChat(){
    var xx=document.getElementById("chat_Ul");
    var cname="深圳超级大富豪";
    var ccontent="小单:200,大单:100,08T:3000";
    // 解析服务器传来的聊天json数据 需要传递本地获取到的最大聊天id 便于服务器判断
    
    $.get('/getchat/',{"chatid":chatID,"gameid":GAMEID,"issueNO":gameIssueNo},function(data,status){
       if(data!=null){
           if(data.msglist==null){
               return;
           }
           
           //解析传过来的数据 然后调用formatUserName(xx)将用户名格式化
           //console.log(data);
           var ox=data.msglist;
           for(var i=ox.length-1;i>=0;i--){
                cname=ox[i][0];
               //console.log("here do")
                if(cname!=USER&&USER!=""){
                    //console.log("here also do");
                    if(ox[i][1]>chatID){chatID=ox[i][1];}
                    ccontent=ox[i][2];
                    //ccontent="大单:320;特码00:100;特码20:11;"
                    ccontent=ccontent.replace(/;/g," ");
                    ccontent=ccontent.replace(/:/g,"");
                    var theteindex=ccontent.indexOf("特");
                    if(theteindex>=0){
                        var sssd=ccontent.split("特码");
                        var showchangete="";
                        //console.log(sssd);
                        for(var uu=0;uu<sssd.length;uu++){
                            var firsta=parseInt(sssd[uu].charAt(0),10);
                            if(firsta<=9&&firsta>=0){
                                var numfront=sssd[uu].substr(0,2);
                                var numlast=sssd[uu].substr(2,sssd[uu].length-1);
                                //var tlucky=Math.floor(Math.random()*5);
                                //var tcaocao=new Array("艹","草","操","特","T","");
                                sssd[uu]=numfront+"/"+numlast;
                                //console.log(sssd[uu]);
                            }
                            showchangete+=sssd[uu];
                        }
                        ccontent=showchangete;
                    }
                    //console.log(ccontent);
                    var ccname=formatUserName(cname);
                    //当出现为封盘的时候 不能显示聊天消息
                    if(whichGame==1){
                        if(sessionStorage.status1==3){return;}
                    }else{
                        if(sessionStorage.status2==3){return;}
                    }
                    document.getElementById("chat_Ul").innerHTML+="<li class=\"chat_li\"><div class=\"alert alert-success chat_li_div\" role=\"alert\"><span class=\"chat_sp_name\">"+ccname+"： "+"</span><span class=\"chat_sp_content\">"+ccontent+"</span></div></li>";
                    //当记录多于200条时要删除最旧50条
                    if(xx.childNodes.length>200){
                        for(var cnode=0;cnode<50;cnode++){
                            xx.removeChild(xx.childNodes[cnode]);
                        }    
                    }
                    gundongdi();
                    //m.scrollTop+=50;滚屏
                }else{
                    //console.log("忽略了一条自己的记录")
                }               
           }
       } 
    });
    
    //将聊天室数据存储到本地
    storedInTheLocal();
    
    //console.log(sessionStorage.chat);
};

//将聊天室内容存储到本地
function storedInTheLocal(){
    if(whichGame==1){
        sessionStorage.content1=document.getElementById('chat_Ul').innerHTML;
        sessionStorage.chatid1=chatID;
        //console.log(sessionStorage.content1);
    }else{
        sessionStorage.content2=document.getElementById('chat_Ul').innerHTML;
        sessionStorage.chatid2=chatID;
    }
    
}

//输出自己内容的聊天
function showToChat(content){
    var playername=formatUserName(USER);
    //console.log(playername);
    if(content!=""){
        //style=\"background-color:#ff0;\"
        document.getElementById("chat_Ul").innerHTML+="<li class=\"chat_li\" style=\"text-align:right\"><div class=\"alert alert-success chat_li_div\"  role=\"alert\"><span class=\"chat_sp_content\">"+content+"</span><span class=\"chat_sp_name\">"+"  ："+playername+"</span></div></li>";
    }
    gundongdi();
    storedInTheLocal();
}

//聊天框自动滚到底部
function gundongdi(){
    var m=document.getElementById("chatroom");
    m.scrollTop=m.scrollHeight;
}

//格式化用户名 主要是在名字中用***隐藏字符
function formatUserName(wname){
    var rwname="";
    rwname="会员"+wname.substr(0,2)+"***"+wname.substr(wname.length-2,wname.length-1);
    return rwname;
}

//提交
function pcBetSubmit(){
    // 防止出现快速点击事件
    document.getElementById('should_submit').setAttribute("disabled","disabled");
    if(isPC){
        touzhu(-1);//将投注栏隐藏
        if(theBet.length<=0){
            alert("请投注再提交");
            document.getElementById("should_submit").removeAttribute("disabled");
            return;
        }else{
            //调用方法把数据封装成服务器的规则数据
            dataFormat(theBet,serverBet);
            var jobj=sbToJson();
            if(jobj!=null){
                var csrftoken = getCookie('csrftoken');
                $.ajaxSetup({
                    beforeSend: function(xhr, settings) {
                        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                            xhr.setRequestHeader("X-CSRFToken", csrftoken);
                        }
                    },
                    async:false
                });
                $.post('/bet/',jobj,function(data,status){
                    //console.log(status);
                    if(status!="success"){
                        alert("连接服务器失败！");
                        return;
                    }
                    if(data!=null){
                        //获取提交后的服务器传来的数据
                        //console.log(data);
                        var strAA=data.message;
                        var strBB=data.result;
                        var stobistrue=1;//用于判断服务器传过来的结果是否与本地相同
                        if(strBB!=1){
                            var errortips=data.message;
                            alert(errortips);
                            window.location.href=location;
                        }else{
                            //console.log(strAA);
                            var mstr=strAA.split(";");
                            var showchatstr="";
                            var showchatstr1="";
                            for(var jo=0,fo=mstr.length-1;jo<fo;jo++){
                                var ms2=mstr[jo].split(",");
                                var scname=pkfindtype(ms2[2]);
                                var scmoney=ms2[3];
                                if(istzComplete(ms2[2],scmoney)!=1){
                                    stobistrue=0;
                                }
                                showchatstr1=scname+":"+scmoney+" ";
                                showchatstr+=showchatstr1;
                            }
                            
                            //调用输出聊天                        
                            if(stobistrue==1){
                                var qwqw=document.getElementById("chat_Input").value;
                                qwqw=qwqw.substr(0,qwqw.length-1);
                                qwqw=qwqw.replace(/:/g,"");
                                showToChat(qwqw);
                            }else{
                                showToChat(showchatstr);    
                            }
                            isStillThisIssue=true;
                            isAlreadyTZ=true;
                            //getChat();
                            //清空前面的投注记录 并获取最新余额
                            pcBetEmptyB()
                            getWhoAndMoney();
                        }
                    }else{
                        alert("余额不足，请联系您代理商");
                    }
                });    
            }else{
                console.log("解析json数据出错");
            }
        }
    }else{
        if(newMoblieBet.length<=0){
            alert("请投注再提交");
        }else{
            //调用方法把数据封装成服务器的规则数据
            dataFormat(newMoblieBet,serverBet);
            var jobj=sbToJson();
            if(jobj!=null){
                var csrftoken = getCookie('csrftoken');
                $.ajaxSetup({
                    beforeSend: function(xhr, settings) {
                        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                            xhr.setRequestHeader("X-CSRFToken", csrftoken);
                        }
                    },
                    async:false    
                });
                $.post('/bet/',jobj,function(data,status){
                    if(status!="success"){
                        alert("连接服务器失败");
                        return;
                    }
                    if(data!=null){
                        //获取提交后的服务器传来的数据
                        //console.log(data);
                        var strAA=data.message;
                        var strBB=data.result;
                        var stobistrue=1;//判断服务器传过来的结果是否与本地相同
                        if(strBB!=1){
                            alert("开奖中，请稍后下注");
                            window.location.href=location;
                        }else{
                            //console.log(strAA);
                            var mstr=strAA.split(";");
                            var showchatstr="";
                            var showchatstr1="";
                            for(var jo=0,fo=mstr.length-1;jo<fo;jo++){
                                var ms2=mstr[jo].split(",");
                                var scname=pkfindtype(ms2[2]);
                                var scmoney=ms2[3];
                                //console.log(scmoney);
                                if(istzComplete(ms2[2],scmoney)!=1){
                                    stobistrue=0;
                                }
                                showchatstr1=scname+":"+scmoney+"  ";
                                showchatstr+=showchatstr1;
                            } 
                                //调用输出聊天                        
                            if(stobistrue==1){
                                var qwqw=document.getElementById("chat_Input").value;
                                qwqw=qwqw.substr(0,qwqw.length-1);
                                qwqw=qwqw.replace(/:/g,"");
                                showToChat(qwqw);
                            }else{
                                showToChat(showchatstr);    
                            }
                            isAlreadyTZ=true;
                            //清空前面的投注记录 并获取最新余额
                            for(var x=0,m=serverBet.length;x<m;x++){
                                serverBet[x].money=0;
                            }
                            getWhoAndMoney();
                        }
                    }else{
                        alert("余额不足，请联系您的代理商");
                    }
                });    
            }else{
                console.log("解析json数据出错");
            }
                
        }
    }   
    document.getElementById('should_submit').removeAttribute('disabled');    
}

//清空1
function pcBetEmpty(){
    balance1=balance2;
    theBet.length=0;
    if(serverBet.length>0){
        for(var x=0,m=serverBet.length;x<m;x++){
            serverBet[x].money=0;
        }    
    }
    document.getElementById('pc_Bet_Blance').innerHTML=balance1;
    document.getElementById('pc_Bet_DoneNum').innerHTML=0;
    for(var j=0;j<38;j++){
        document.getElementById('pc_M_'+j).innerHTML=0;    
    }
    updateInputBox();
}
//清空2
function pcBetEmptyB(){
    theBet.length=0;
    for(var x=0,m=serverBet.length;x<m;x++){
        serverBet[x].money=0;
    }
    document.getElementById('pc_Bet_DoneNum').innerHTML=0;
    for(var j=0;j<38;j++){
        document.getElementById('pc_M_'+j).innerHTML=0;    
    }
    updateInputBox();
}

//单个点击确定下注
function pcDoBetFrom(haName){
    var betType=["大单","大双","小单","小双","大","小","单","双",
            "特码00","特码01","特码02","特码03","特码04","特码05",
            "特码06","特码07","特码08","特码09","特码10","特码11",
            "特码12","特码13","特码14","特码15","特码16","特码17",
            "特码18","特码19","特码20","特码21","特码22","特码23",
            "特码24","特码25","特码26","特码27","极大","极小"];
    if(haName==null){
        haName="";
    }
    var xx=document.getElementById('pc_doBet_Money').value;
    if(xx==""){
        
    }else{
        var yy=document.getElementById('pc_doBet_Select').innerHTML;
        balance1=balance1-xx;
        //console.log(balance1);
        var din=findtzindex(yy);
        if(din>=0){
            balance1+=parseInt(theBet[din].money,10);
            theBet[din].money=xx;    
        }else{
            var theBetObj1={};
            theBetObj1.name=yy;
            theBetObj1.money=xx;
            theBet.push(theBetObj1);
        }    
        for(var j=0,k=betType.length;j<k;j++){
            if(betType[j]==yy){
                document.getElementById('pc_M_'+j).innerHTML=xx;
            }
        }
        //console.log("这一步"+balance1);
        document.getElementById('pc_Bet_Blance').innerHTML=balance1;
        document.getElementById('pc_Bet_DoneNum').innerHTML=balance2-balance1;
        touzhuPopup(-1);
        //调用更新聊天输入框
        updateInputBox(haName);    
    }
    
}

//点击筹码下注
function clickChip(index){
    // 添加筹码投注的功能 判断余额 相应按钮不能被点击
    var thebalan=document.getElementById("pc_Bet_Blance").innerHTML;//余额
    thebalan=parseInt(thebalan,10);
    var inputaa=document.getElementById("pc_doBet_Money");
    var sel=document.getElementById('pc_doBet_Select');//选择的
    var xfront=findtzmoney(sel.innerHTML);
    xfront=parseInt(xfront,10);
    thebalan+=xfront;
    switch(index){
        case 20:
            if(thebalan>=20){
                inputaa.value=20;
                dobet_keyup();
            }
            break;
        case 100:
            if(thebalan>=100){
                inputaa.value=100;
                dobet_keyup();
            }
            break;
        case 500:
            if(thebalan>=500){
                inputaa.value=500;
                dobet_keyup();
            }
            break;
        case 2000:
            if(thebalan>=2000){
                inputaa.value=2000;
                dobet_keyup();
            }
            break;
        case 5000:
            if(thebalan>=5000){
                inputaa.value=5000;
                dobet_keyup();
            }
            break;
        default:
            break;
    }
    
}

//更新输入框
function updateInputBox(haName){
    //console.log("正在更新");
     var cainput=document.getElementById("chat_Input");
    if(theBet.length<=0){
        cainput.value="";
    }else{
        if(isStillThisIssue){
            cainput.value="加";
        }else{
            cainput.value="";            
        }
        for(var gh=0,hh=theBet.length;gh<hh;gh++){
            var hjkname=theBet[gh].name;
            var hjkmoney=theBet[gh].money;
            var tematema=hjkname.charAt(hjkname.length-2)+hjkname.charAt(hjkname.length-1);
            //console.log(tematema);
            var aa=parseInt(tematema,10);
            //console.log(aa);
            if(!isNaN(aa)){
                //判断出是特码
                //取随机数
                //var lucky=Math.floor(Math.random()*5);
                //var caocao=new Array("艹","草","操","特","T","");
                var ssss=" "+tematema+"/"+hjkmoney+" ";
                cainput.value+=ssss;
            }else{
                if(hjkname==haName){
                    var shiha=" 哈"+hjkname+" ";
                    cainput.value+=shiha;
                }else{
                    var ssss=" "+hjkname+hjkmoney+" ";
                    cainput.value+=ssss;        
                }
                
            }
        }
    }
}

//梭哈
function pcDoBetPoker(){
    var pdbpokersel=document.getElementById('pc_doBet_Select');
    var haName=pdbpokersel.innerHTML;
    var yixiaz=document.getElementById('pc_Bet_DoneNum').innerHTML;
    yixiaz=parseInt(yixiaz,10);
    //console.log(yixiaz);
    if(yixiaz<=50000){
        if(balance1>=0){
            var sn=pdbpokersel.innerHTML;
            var front=findtzmoney(sn);
            front=parseInt(front,10);
            var pokeBalance=balance1+front;
            if(balance1<=50000){
                document.getElementById('pc_doBet_Money').value=pokeBalance;
                pcDoBetFrom(haName);    
            }else{
                document.getElementById('pc_doBet_Money').value=50000;
                pcDoBetFrom(haName);
            }
        }else{
            return;
        }        
    }else if(yixiaz<100000){
        if(balance1>0){
            var sn=pdbpokersel.innerHTML;
            var front=findtzmoney(sn);
            front=parseInt(front,10);
            balance1+=front;
            var yu=100000-yixiaz;
            if(balance1>yu){
                document.getElementById('pc_doBet_Money').value=yu;
                pcDoBetFrom(haName);
            }else{
                document.getElementById('pc_doBet_Money').value=balance1;
                pcDoBetFrom(haName);
            }
        }else{
            return;
        }
    }else if(yixiaz>=100000){
        return;
    }
    
}

//获取gameid
function getGameID(){
    newServerBetType=["大","小","单","双","大单","大双","小单","小双",
            "特码00","特码01","特码02","特码03","特码04","特码05",
            "特码06","特码07","特码08","特码09","特码10","特码11",
            "特码12","特码13","特码14","特码15","特码16","特码17",
            "特码18","特码19","特码20","特码21","特码22","特码23",
            "特码24","特码25","特码26","特码27","极大","极小"];
    //console.log("HAHA"+GAMEID);
    $.get('/getruleid/',{"gameid":GAMEID},function(data,status){
        // 获取到服务器上的大单小单的id(pk) 
        if(data!=null){
            //console.log(data);
            if(data.result==1){
               var gameob=eval(data.data);
                $.each(gameob,function(i,item){
                    var sobj={};
                    sobj.name=newServerBetType[item.fields.rulename];
                    sobj.odds=item.fields.odds;
                    sobj.pk=item.pk;
                    sobj.money=0;
                    serverBet.push(sobj);
                    //console.log(sobj);
                }); 
            }else{
                console.log("获取赔率数据失败");            
            }
        }
    });
}

//查找theBet内投注名字返回投注金额
function findtzmoney(stname){
    var tblength=theBet.length;
    var jk=0;
    if(tblength==0){
    }else{
        for(var ds=0;ds<tblength;ds++){
            if(theBet[ds].name==stname){
                var as=theBet[ds].money;
                //console.log("前一个"+as);
                if(as>=0){
                    jk=as;
                }else{
                    
                }
            }
        }
    }
    return jk;
}

//查找theBet内含有该名字的下标
function findtzindex(stname){
    var b=-1;
    for(var a=0,c=theBet.length;a<c;a++){
        if(theBet[a].name==stname){
            b=a;
        }
    }
    return  b;
}

//数据格式转换
function dataFormat(f1,f2){
    //console.log(f1);
    //console.log(f2);
    if(Object.prototype.toString.call((f1)) != '[object Array]'){
        console.log("hey sb coder");
    }else{
        for(var v=0,n=f1.length;v<n;v++){
            for(var m=0,l=f2.length;m<l;m++){
                if(f2[m].name==f1[v].name){
                    f2[m].money=f1[v].money;
                }
            }
        }
    }
}

//将serverBet的数据变成json
function sbToJson(){
    var mmobj;
    var gstr="{";
    var ii=0;
    for(var r=0;r<serverBet.length;r++){
        if(serverBet[r].money>0){
            var qw1=serverBet[r].pk;
            var qw2=serverBet[r].money;
            gstr+="\"tz"+(++ii)+"\":"+"\""+GAMEID+","+gameIssueNo+","+qw1+","+qw2+"\",";
        }
    }
    if(gstr.length>1){
        gstr=gstr.substr(0,gstr.length-1)+"}";    
    }else{
        gstr+="}";
    }
    //console.log(gstr);
    mmobj=JSON.parse(gstr);
    return mmobj;
}

//输入检测
function dobet_keyup(){
    var qx=document.getElementById('pc_doBet_Money');
    var x=qx.value;
	if(x.length==1){
		qx.value=x.replace(/[^1-9]/g,'')
	}else{
		qx.value=x.replace(/\D/g,'')
	};
    x=parseInt(x,10);
	//alert(parseInt(document.getElementById('g_play_blance').innerHTML));
    var sub=document.getElementById('pc_touzhu_submit');
    var soha=document.getElementById('pc_touzhu_soha');
    var tip=document.getElementById('pc_touzhu_tips');
    var yixiaz=document.getElementById('pc_Bet_DoneNum').innerHTML;
    yixiaz=parseInt(yixiaz,10);
    if(x+yixiaz>100000){
        //console.log(x+yixiaz);
        sub.disabled=true;
        tip.style.color="#FF0000";
		tip.innerHTML="总注100000封顶";
    }else{
        if (x>balance1){
		  sub.disabled=true;
		  tip.style.color="#FF0000";
		  tip.innerHTML="余额不足";
        }else if(x<20){
            sub.disabled=true;
            tip.style.color="#FF0000";
            tip.innerHTML="单注20起";
        }else if(x>50000){
            sub.disabled=true;
            tip.style.color="#FF0000";
            tip.innerHTML="单注50000封顶";
        }else {
            sub.disabled=false;
            tip.style.color="#ddd";
            tip.innerHTML="请填入大于0的数字";
        }    
    }
	
}

//根据判断结果是否是完整投注
function istzComplete(pk,money){
    var d=0;
    for(var x=0,y=serverBet.length;x<y;x++){
        if(pk==serverBet[x].pk&&money==serverBet[x].money){
            d=1;
        }
    }
    return d;
}

//根据pk值查找投注type
function pkfindtype(pk){
    var d="";
    for(var x=0,y=serverBet.length;x<y;x++){
        if(pk==serverBet[x].pk){
            d=serverBet[x].name;
        }
    }
    return d;
}

//获取用户名余额
function getWhoAndMoney(){
    $.get('/getnamo/',{"gameid":GAMEID},function(data,status){
       if(data!=null){
           //console.log(data);
           if(data.result==1){
                USER=data.username;
                var mmm=parseInt(data.money,10);
                //console.log(mmm);
                balance1=mmm;
                balance2=mmm;
                document.getElementById("pc_Bet_Blance").innerHTML=balance1;
                $("#youyuer").html(balance1);
                //参与期数今日盈亏 ，换成ID 
                document.getElementById('base_userid_sp').innerHTML=data.userid==null?0:data.userid;
                document.getElementById('base_zhanji_sp').innerHTML=data.todaysettle==null?0:data.todaysettle;
                document.getElementById('base_qishu_sp').innerHTML=data.invocount==null?0:data.invocount;
                //console.log(data);
                //手机
                document.getElementById('UeserID_int').innerHTML=data.userid==null?0:data.userid;
               
           }else{
                alert("余额不足，请充值！");
           }
           
       }else{
           alert("余额不足，请充值！");
       }
    });
}




//手机底部JS

$(".page2").click(function(){
          $(".tema1").css("display","none");
          $(".tema3").css("display","none");
          $(".tema4").css("display","none");
          $(".tema2").css("display","block");
        });
       $(".page1").click(function(){
          $(".tema2").css("display","none");
          $(".tema3").css("display","none");
          $(".tema4").css("display","none");
          $(".tema1").css("display","block");
        }); 
       $(".page3").click(function(){
          $(".tema1").css("display","none");
          $(".tema2").css("display","none");
          $(".tema4").css("display","none");
          $(".tema3").css("display","block");
        });
       $(".page4").click(function(){
          $(".tema1").css("display","none");
          $(".tema2").css("display","none");
          $(".tema3").css("display","none");
          $(".tema4").css("display","block");
        })
       $(".xuanze01").click(function(){
           $(".zuhe").css("display","block");
           $(".tema").css("display","none");
           $(".jizhi").css("display","none");
       });
      $(".xuanze02").click(function(){
           $(".zuhe").css("display","none");
           $(".tema").css("display","block");
           $(".jizhi").css("display","none");
           $(".tema2").css("display","none");
           $(".tema1").css("display","block");
           $(".tema3").css("display","none");
           $(".tema4").css("display","none");
       });
     $(".xuanze03").click(function(){
           $(".zuhe").css("display","none");
           $(".tema").css("display","none");
           $(".jizhi").css("display","block");
       });

    $("#nobtn").click(function(){
       $(".Tipstan").css("display","none");
    });
    $("#yesbtn").click(function(){
       $(".Tipstan").css("display","none");
    });
  //点击某项弹出下注数量的输入框
  var fanhui=$(".temashu").click(function(){
        var Aid=$(this).attr("id");
        var Bid=$(this).siblings("div.temazhu").attr("id");
        var Cid=$(this).siblings("div.temapei").attr("id");
        var Anameold=$(this).html();
        var Aname="特码"+Anameold;
        var Bname=$(this).siblings("div.temazhu").html();
        var Cname=$(this).siblings("div.temapei").html();
       if(!isLogin){
           $(function(){ $("#loginmodal").modal();});
           $(".Tipstan").css("display","none");
        }else{
            $("#youzhushu").html("");
            $(".Tipstan").css("display","block");
            $("#Tipstans").html(Aname);
            $("#Tipstant").html(Cname);
                fanhui01.Aid=Aid;
                fanhui01.Bid=Bid;
                fanhui01.Cid=Cid;
                fanhui01.Aname=Aname;
                fanhui01.Bname=Bname;
                fanhui01.Cname=Cname;
        }
    });
    var fanhui=$(".jizhiname").click(function(){
        var Aid=$(this).attr("id");
        var Bid=$(this).siblings("div.jizhizhu").attr("id");
        var Cid=$(this).siblings("div.jizhipei").attr("id");
        var Aname=$(this).html();
        var Bname=$(this).siblings("div.jizhizhu").html();
        var Cname=$(this).siblings("div.jizhipei").html();
        if(!isLogin){
           $(function(){ $("#loginmodal").modal();});
           $(".Tipstan").css("display","none");
        }else{
            $("#youzhushu").html("");
            $(".Tipstan").css("display","block");
            $("#Tipstans").html(Aname);
            $("#Tipstant").html(Cname);
                fanhui01.Aid=Aid;    //投注选项名字的ID
                fanhui01.Bid=Bid;    //投注选项压注数的ID
                fanhui01.Cid=Cid;    //投注选项赔率的ID
                fanhui01.Aname=Aname;//投注选项名字
                fanhui01.Bname=Bname;//投注选项的压注数
                fanhui01.Cname=Cname;//投注选项的赔率
        }
    });
    $(".zhuname").click(function(){
        //console.log(mobileBet);
        var Aid=$(this).attr("id");
        var Bid=$(this).siblings("div.yazhu").attr("id");
        var Cid=$(this).siblings("div.peilv").attr("id");
        var Aname=$(this).html();
        var Bname=$(this).siblings("div.yazhu").html();
        var Cname=$(this).siblings("div.peilv").html();
        if(!isLogin){
           $(function(){ $("#loginmodal").modal();});
           $(".Tipstan").css("display","none");
        }else{
            $("#youzhushu").html("");
            $(".Tipstan").css("display","block");
            $("#Tipstans").html(Aname);
            $("#Tipstant").html(Cname);
                fanhui01.Aid=Aid;
                fanhui01.Bid=Bid;
                fanhui01.Cid=Cid;
                fanhui01.Aname=Aname;
                fanhui01.Bname=Bname;
                fanhui01.Cname=Cname;
        }
    });
//投注输入注数提示
   function checkTouzhu(){
        var biaodashi=/^[1-9]\d*$/;
        var youzhi=$("#youzhushu").val();//输入的注数
        var youzhi1=parseInt(youzhi);
        var youzhi2=parseInt($("#youyuer").html());//余额
        var youzhi3=parseInt($("#youyixiazhu").html());//已下注
           if(youzhi==""){/*是否有输入值没有的话返回给$("#yesbtn")的值为false*/
                $("#Tipsyuer").html("");
                $("#Tipsyuer").css("color","#333");
                return false;
           }else{
                if(biaodashi.test(youzhi)&&youzhi.indexOf(" ")<=0){/*判断输入是否合法*/
                     if(youzhi1<20){/*输入小于20注*/
                                $("#Tipsyuer").html("单注下注"+" "+"20"+" "+"起");
                                $("#Tipsyuer").css("color","#f00");
                                return false;
                             }  
                     if(parseInt(fanhui01.Bname)+parseInt(youzhi1)>50000){/*单注输入大于50000注*/
                        $("#Tipsyuer").html("单注"+" "+"50000"+" "+"封顶");
                        $("#Tipsyuer").css("color","#f00");  
                        return false;
                     }else{
                           if(mobileBet.length>0){
                               for( var i=0;i<mobileBet.length;i++){
                                        if(fanhui01.Aname==mobileBet[i].Aname){/*数组存在与fanhui01对象相同的对象元素*/
                                        var youzhi2=$("#youyuer").html();                       
                                        var youzhi3=$("#youyixiazhu").html();
                                        var youzhi3=parseInt(youzhi3-parseInt(mobileBet[i].Bname));/*//此处youzhi3是当前你已下注(youyixiazhu)减去数组中与fanhui02对象相同的元素的下注数量(Bname);为数组其它元素的下注数的总和；*/
                                        var youzhi4=parseInt(parseInt(youzhi2)+parseInt(mobileBet[i].Bname));/*//原本的下注加上现有余额为本次下注上限*/
                                               if(parseInt(youzhi4)>=parseInt(youzhi1)){/*当本次下注上限大于新输入的压注数（也就是不需要梭哈，有足够的钱下注）*/
                                                   $("#Tipsyuer").html("你所压注数是"+" "+youzhi1+" "+"注");
                                                   $("#Tipsyuer").css("color","#333");
                                               }else{
                                                    $("#Tipsyuer").html("你的余额不足，如需梭哈请按确定");/*余额不足1梭哈//数组元素大于0 相同元素 输入的金额大于（之前此元素下注数与现有余额的的和）*/
                                                    $("#Tipsyuer").css("color","#333");
                                               }                            
                                               if(parseInt(parseInt(youzhi3)+parseInt(youzhi1))>100000){/*//其它元素的下注总和加上你所输入的的值为你这期总注数不可以大于10万注*/
                                                  $("#Tipsyuer").html("总注"+" "+"100000"+" "+"封顶");
                                                  $("#Tipsyuer").css("color","#f00");  
                                                  return false;
                                               }
                                            /*点击的时候获取全局对象fanhui01的值传递给一个新的对象fanhui02*/
                                           var fanhui02=new Object();
                                                 fanhui02.result=true;        //输入是否合法
                                                 fanhui02.money=youzhi1;      //输入的金额
                                                 fanhui02.yuer=youzhi2;       //显示的余额
                                                 fanhui02.youyixiazhu=youzhi3;//显示的你已下注
                                                 fanhui02.Aid=fanhui01.Aid;    //投注选项名字的ID
                                                 fanhui02.Bid=fanhui01.Bid;    //投注选项压注数的ID
                                                 fanhui02.Cid=fanhui01.Cid;    //投注选项赔率的ID
                                                 fanhui02.Aname=fanhui01.Aname;//投注选项名字
                                                 fanhui02.Bname=fanhui01.Bname;//投注选项的压注数 一开始是0 输入的money就是Bname
                                                 fanhui02.Cname=fanhui01.Cname;//投注选项的赔率
                                                 return fanhui02;
                                            return;
                                       }
                                }
                               for(var i=0;i<mobileBet.length;i++){
                                    if(fanhui01.Aname!=mobileBet[i].Aname){/*数组不存在与fanhui01对象相同的对象元素*/
                                           if(youzhi1>youzhi2&&youzhi2>0){
                                           $("#Tipsyuer").html("你的余额不足，如需梭哈请按确定");/* 余额不足2梭哈2//数组长度大于0 且没有相同的元素2  3.但是输入的金额大于余额且余额大于20*/
                                           }else{
                                           $("#Tipsyuer").html("你所压注数是"+" "+youzhi1+" "+"注"); 
                                           $("#Tipsyuer").css("color","#333");        
                                           }
                                           if(youzhi2<20){
                                              $("#Tipsyuer").html("你的余额不足，请及时充值");/*余额不足3充值//数组长度大于0 且没有相同的元素2  3.余额低于20；*/
                                               return false;
                                           }
                                           if(youzhi3+youzhi1>100000){/*当数组元素不存在相同的情况下 输入大于10万注*/
                                           $("#Tipsyuer").html("总注"+" "+"100000"+" "+"封顶");
                                           $("#Tipsyuer").css("color","#f00");  
                                           return false;
                                           }
                                        /*点击的时候获取全局对象fanhui01的值传递给一个新的对象fanhui02*/
                                           var fanhui02=new Object();
                                                 fanhui02.result=true;        //输入是否合法
                                                 fanhui02.money=youzhi1;      //输入的金额
                                                 fanhui02.yuer=youzhi2;       //显示的余额
                                                 fanhui02.youyixiazhu=youzhi3;//显示的你已下注
                                                 fanhui02.Aid=fanhui01.Aid;    //投注选项名字的ID
                                                 fanhui02.Bid=fanhui01.Bid;    //投注选项压注数的ID
                                                 fanhui02.Cid=fanhui01.Cid;    //投注选项赔率的ID
                                                 fanhui02.Aname=fanhui01.Aname;//投注选项名字
                                                 fanhui02.Bname=fanhui01.Bname;//投注选项的压注数 一开始是0 输入的money就是Bname
                                                 fanhui02.Cname=fanhui01.Cname;//投注选项的赔率
                                                 return fanhui02;
                                        return;
                                  }                        
                             }
                            /*(mobileBet.length>0) end*/
                           }else{/* 数组长度小于0 start*/
                                   if(youzhi1>youzhi2&&youzhi2>=20){
                                      $("#Tipsyuer").html("你的余额不足，如需梭哈请按确定");/*余额不足4梭哈//数组是空的  输入的金额大于现有余额；余额大于20；*/
                                   }else{
                                      $("#Tipsyuer").html("你所压注数是"+" "+youzhi1+" "+"注");
                                      $("#Tipsyuer").css("color","#333");
                                   }
                                   if(youzhi2<20){
                                       $("#Tipsyuer").html("你的余额不足，请你及时充值");/*余额不足5//数组是空的 且余额小于20 是不允许投注的*/
                                       return false;
                                   }
                                   if(youzhi3+youzhi1>100000){
                                      $("#Tipsyuer").html("总注"+" "+"100000"+" "+"封顶");
                                      $("#Tipsyuer").css("color","#f00");  
                                      return false;
                                   }
                                /*点击的时候获取全局对象fanhui01的值传递给一个新的对象fanhui02*/
                                   var fanhui02=new Object();
                                         fanhui02.result=true;        //输入是否合法
                                         fanhui02.money=youzhi1;      //输入的金额
                                         fanhui02.yuer=youzhi2;       //显示的余额
                                         fanhui02.youyixiazhu=youzhi3;//显示的你已下注
                                         fanhui02.Aid=fanhui01.Aid;    //投注选项名字的ID
                                         fanhui02.Bid=fanhui01.Bid;    //投注选项压注数的ID
                                         fanhui02.Cid=fanhui01.Cid;    //投注选项赔率的ID
                                         fanhui02.Aname=fanhui01.Aname;//投注选项名字
                                         fanhui02.Bname=fanhui01.Bname;//投注选项的压注数 一开始是0 输入的money就是Bname
                                         fanhui02.Cname=fanhui01.Cname;//投注选项的赔率
                                         return fanhui02;
                                   return;
                          }
                   
                     }
            /*(biaodashi.test(youzhi)&&youzhi.indexOf(" ") end*/
                }else{/*输入不合法start*/
                          $("#Tipsyuer").html("不正确的格式");
                          $("#Tipsyuer").css("color","#f00");
                          return false;
                }
           }
   }
//投注确定
 $("#yesbtn").click(function(){
      var data=checkTouzhu();
          if(data.result&&data){
                  if(mobileBet.length<1){//数组是空的
                      //console.log(mobileBet);//未压入数据之前数组是空的           
                      mobileBet.push(data);
                        var oldBname=parseInt($("#"+data.Bid).html());
                        var oldyouyixiazhu=parseInt($("#youyixiazhu").html());//@@下注前的值
                          if(data.money>data.yuer){/*余额不足4梭哈//数组是空的  输入的金额大于现有余额；余额大于20；*/
                                 $("#"+data.Bid).html(data.yuer+oldBname);
                                 $("#youyuer").html(0);
                                 $("#youyixiazhu").html(data.yuer+oldyouyixiazhu);
                                 mobileBet[0].Bname=data.yuer;
                                 mobileBet[0].yuer=0;
                                 mobileBet[0].youyixiazhu=$("#youyixiazhu").html();
                          }else{ 
                                 $("#"+data.Bid).html(data.money+oldBname);//投注选项的压注数
                                 $("#youyuer").html(parseInt(data.yuer-data.money));//显示的余额
                                 $("#youyixiazhu").html(data.money+oldyouyixiazhu);
                                 mobileBet[0].Bname=data.money;
                                 mobileBet[0].yuer=$("#youyuer").html();
                                 mobileBet[0].youyixiazhu=$("#youyixiazhu").html();
                          }
                       
                     //console.log(mobileBet);//数据对象压入数据之后数组是有一个元素的 那么
                                            //他就会满足下面的 mobileBet.length>0 
                                            //为了避免在压入数据之前走第一个条件，压入数据之后走下面另一个条件
                                            //我们则使用return来终止它往下走；
                      MobileupdateInpuT1();
                      return;
                  }/*if(mobileBet.length<1);end*/
                  if(mobileBet.length>0){  //当前数组是有一个元素的
                          for(var i=0;i<mobileBet.length;i++){
                                        if(data.Aname==mobileBet[i].Aname){//数组元素存在 且有相同元素
                                            var DataBname=parseInt(data.Bname);
                                            var oldBname=parseInt(DataBname)-parseInt(mobileBet[i].Bname);
                                              var dqyuer=parseInt($("#youyuer").html());
                                              var dqyouyixiazhu=parseInt($("#youyixiazhu").html());
                                              if(data.money>parseInt(dqyuer)+parseInt(mobileBet[i].Bname)){/*余额不足1梭哈//数组元素大于0 相同元素 输入的金额大于（之前此元素下注数与现有余额的的和）*/
                                                  mobileBet[i].money=parseInt(dqyuer)+parseInt(mobileBet[i].Bname);
                                                  mobileBet[i].Bname=parseInt(dqyuer)+parseInt(mobileBet[i].Bname);
                                                  mobileBet[i].yuer=0;
                                                  mobileBet[i].youyixiazhu=parseInt(dqyouyixiazhu)+parseInt(dqyuer);
                                                 /* console.log(mobileBet[i].Bname);*/
                                                  $("#"+data.Bid).html(parseInt(mobileBet[i].Bname)+oldBname);
                                                  $("#youyuer").html(mobileBet[i].yuer);
                                                  $("#youyixiazhu").html(parseInt(mobileBet[i].youyixiazhu)+oldBname);
                                                 
                                               }else{/* 无需梭哈//数组元素大于0 相同元素 输入的金额小于（之前此元素下注数与现有余额的的和）*/
                                                  mobileBet[i].money=data.money;
                                                  mobileBet[i].Bname=data.money;
                                                  mobileBet[i].yuer=dqyuer-parseInt(parseInt(data.money)+oldBname-parseInt(data.Bname));
                                                  mobileBet[i].youyixiazhu=dqyouyixiazhu-parseInt(parseInt(data.Bname)-parseInt(data.money));
                                                   /*console.log( mobileBet[i].youyixiazhu)
                                                   console.log(mobileBet[i].yuer);
                                                   console.log(mobileBet[i].Bname);*/
                                                  $("#"+data.Bid).html(parseInt(mobileBet[i].Bname)+oldBname);
                                                  $("#youyuer").html(mobileBet[i].yuer);
                                                  $("#youyixiazhu").html(parseInt(mobileBet[i].youyixiazhu)+oldBname);
                                                   
                                                  /* console.log(mobileBet);*/
                                               }
                                        MobileupdateInpuT1();
                                           return;
                                        }
                           }  
                           for(var j=0;j<mobileBet.length;j++){//开始它会走上面那个for,满足相等条件之后，就给它终止函数执行因为你不终止他又会走下面 for，  
                                                               //如果一开始不满足上面相等的条件，它会走下面我们现在所在位置的这个for，然后把新来的对象添加进入数组，这时候就该终止函数运行了，如果不终止
                                                               //然后上边的for循环觉得数组又多了一个元素，我要拿出来循环遍历，遍历一下发现又满足上面的条件，那就走上边的语句；
                                   if(data.Aname!==mobileBet[j].Aname){//数组元素存在 但没有相同元素 先把对象压入数组中
                                           mobileBet.push(data);
                                           var index1=parseInt(mobileBet.length-1);
                                           //console.log(mobileBet);//数据对象未压入的时候
                                           if(mobileBet[index1].money>=parseInt(mobileBet[index1-1].yuer)){/* 余额不足2梭哈2//数组长度大于0 且没有相同的元素2  3.但是输入的金额大于等于对象压入数组之前的余额*/
                                                  var oldBname=parseInt($("#"+data.Bid).html());
                                                  mobileBet[index1].money=mobileBet[index1-1].yuer;
                                                  mobileBet[index1].Bname=parseInt(mobileBet[index1-1].yuer)+oldBname;
                                                  mobileBet[index1].yuer=0;
                                                  mobileBet[index1].youyixiazhu=parseInt(mobileBet[index1-1].youyixiazhu)+parseInt(mobileBet[index1-1].yuer);
                                                  $("#"+data.Bid).html(parseInt(mobileBet[index1].Bname)+parseInt(oldBname));
                                                  $("#youyuer").html(mobileBet[index1].yuer);
                                                  $("#youyixiazhu").html(mobileBet[index1].youyixiazhu);                                          
                                               //console.log(mobileBet);
                                           }else{/*无需梭哈 //数组长度大于0 且没有相同的元素2  3.但是输入的金额小于对象压入数组之前的余额*/
                                                   var oldBname=parseInt($("#"+data.Bid).html());
                                                  mobileBet[index1].yuer=parseInt(mobileBet[index1-1].yuer-mobileBet[index1].money);
                                                  mobileBet[index1].youyixiazhu=parseInt(mobileBet[index1].youyixiazhu)+parseInt(mobileBet[index1].money);
                                                  mobileBet[index1].Bname=data.money;
                                                  $("#"+data.Bid).html(data.money+oldBname);//投注选项的压注数
                                                  $("#youyuer").html(mobileBet[index1].yuer);//显示的余额
                                                  $("#youyixiazhu").html(mobileBet[index1].youyixiazhu);                
                                                  //-console.log(mobileBet);//数据对象压入之后                                                   
                                           }
                                       MobileupdateInpuT1();
                                       return;
                                     }
                            }
                           
                   }///* if(mobileBet.length>0) end;*/
                   //确认之后显示下注的框的的内容； 
          }else{
              $(".Tipstan").css("display","none");
              return false;
          }
 });
//更新输入框的单号(DanhaO);
function MobileupdateInpuT1(){
         var severinput=document.getElementById("chat_Input");
         if(mobileBet.length<=0){
                 severinput.value="123";
          }else{
                /* severinput.value="321";*/
                    document.getElementById("chat_Input").value="";
                    for(var i=0;i<mobileBet.length;i++){
                            var Aname=mobileBet[i].Aname;
                            var Bname=mobileBet[i].Bname;
                            var TemanamE=Aname.charAt(Aname.length-2)+Aname.charAt(Aname.length-1);
                            //console.log(tematema);
                            var Intname=parseInt(TemanamE,10);
                            //console.log(aa);
                            if(!isNaN(Intname)){//isNAN(数字)=false !isNaN(数字)=ture;
                                //判断出是特码
                                //取随机数
                               /* var lucky=Math.floor(Math.random()*5);
                                var caocao=new Array("艹","草","操","特","T","");
                                var ssss=" "+Intname+caocao[lucky]+":"+Bname+" ";*/
                                var DanhaO=" "+TemanamE+"/"+Bname+" ";
                                severinput.value+=DanhaO;
                            }else{
                                 var DanhaO=" "+Aname+Bname+" ";
                                 severinput.value+=DanhaO;        
 
                            }
                    }
         }
}




//在页面刷新时调用它清空投注数Bname
function mobileclearBname(){
   $(".yazhu").html(0);
   $(".temazhu").html(0);
   $(".jizhizhu").html(0);
}

//投注提交
  function tijiao(){
      //console.log(mobileBet);
      
      for(var ii=0;ii<mobileBet.length;ii++){
          var newMob=new Object();
          newMob.name=mobileBet[ii].Aname;
          newMob.money=mobileBet[ii].money;
          newMoblieBet.push(newMob);
          newMob=null;
      }
      pcBetSubmit();
      qingkongb();
      newMoblieBet=[];
      
  }
//清空
function qingkong(){
    console.log(mobileBet);
 var nowyouyixiazhu=$("#youyixiazhu").html();//此已下注结果为某一期多次下注提交的累积
 var price=parseInt(0);
 for(i=0;i<mobileBet.length;i++){
     if(mobileBet.length>0){
        price+=parseInt(mobileBet[i].Bname);//获取当前已下注
       var everyBname=parseInt($("#"+mobileBet[i].Bid).html());
       $("#"+mobileBet[i].Bid).html(parseInt(everyBname)-parseInt(mobileBet[i].Bname));
     }
 }
 
 var oldyouyixiazhu=parseInt(nowyouyixiazhu-price);
 $("#youyixiazhu").html(oldyouyixiazhu);
 $("#chat_Input").val("");
 var shijiyuer4=(parseInt($("#youyuer").html())+parseInt(price));//当前余额加上当前已下注则是它原始余额
 $("#youyuer").html(shijiyuer4);  
   mobileBet.length=0;
}
function qingkongb(){
    $("#chat_Input").val("");
   mobileBet.length=0;
}
//上局盈利
function getmobileIssueNoyuer(){
    if(isPC){return;}
    var mobileIssueNo=parseInt($("#ip_nowNum").html());//此时是当前期
    if(mobileIssueNo==888888){setTimeout(getmobileIssueNoyuer,1000);return;}
    var mobileIssueNo1=parseInt(mobileIssueNo-1);//上一期的期号
      $.get('/getcurwl/',{"gameid":GAMEID,"issueNO":mobileIssueNo1},function(data1,status){
          //console.log(data1);
           if(data1.result==1){
             $("#youyingli").html(data1.balance);
          }
      });
}
//刷新页面
$("#refresh28").click(function(){
    window.location.href=location;
    
});
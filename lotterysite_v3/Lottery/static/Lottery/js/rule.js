
var x=window.location.href;
var f=parseInt(x.charAt(x.length-1),10);
switch(f){
     //显示新手上路
     case 0:
         $(".mid_1right").eq(f).css("display","block").siblings(".mid_1right").css("display","none");
         $(".mid_2right").css("display","none");
         break;
     case 1:
         $(".mid_1right").eq(f).css("display","block").siblings(".mid_1right").css("display","none");
         $(".mid_2right").css("display","none");
         break;
     case 2:
        $(".mid_1right").eq(f).css("display","block").siblings(".mid_1right").css("display","none");
        $(".mid_2right").css("display","none");
        break;
     case 3:
        $(".mid_1right").eq(f).css("display","block").siblings(".mid_1right").css("display","none");
        $(".mid_2right").css("display","none");
        break;
     case 4:
        $(".mid_1right").eq(f).css("display","block").siblings(".mid_1right").css("display","none");
        $(".mid_2right").css("display","none");
        break;
    //显示游戏帮助
     case 5:
         $(".mid_2right").eq(f-5).css("display","block").siblings(".mid_2right").css("display","none");
         $(".mid_1right").css("display","none");
         break;
     case 6:
         $(".mid_2right").eq(f-5).css("display","block").siblings(".mid_2right").css("display","none");
         $(".mid_1right").css("display","none");
         break;
     case 7:
        $(".mid_2right").eq(f-5).css("display","block").siblings(".mid_2right").css("display","none");
        $(".mid_1right").css("display","none");
        break;
     case 8:
        $(".mid_2right").eq(f-5).css("display","block").siblings(".mid_2right").css("display","none");
        $(".mid_1right").css("display","none");
        break;
     case 9 :
        $(".mid_2right").eq(f-5).css("display","block").siblings(".mid_2right").css("display","none");
        $(".mid_1 right").css("display","none");
        break;
}
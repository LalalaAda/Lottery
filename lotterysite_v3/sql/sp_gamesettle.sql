DROP PROCEDURE IF EXISTS sp_gamesettle;
# 结算存储过程
DELIMITER //
CREATE  procedure sp_gamesettle(in gid INT,in isno int,out spret int)
lb_pro:begin
	
    declare userid int;			#用户id
    declare betmount decimal;	#下注数量
    declare betodds float;		#赔率
    declare rid 	int	;		#规则id
        
    declare isid int;			#期s数id
    declare gameresult int;		#游戏结果
    declare bsettled tinyint;	#是否结算
	
    declare isbg	tinyint;	#是否为大 ,1:大 ;0:小
    declare isdb	tinyint;	#是否为双, 1:双 ;0:单

    set gameresult = -1,bsettled=2;
    select result,isSettled,issueid into gameresult,bsettled,isid from GameIssue where gameid = gid and issueNO = isno;
    
    if gameresult = -1 # 无法找到游戏对应的期号 , 直接退出存储过程, 并输出参数为1
    then
		select 1 into spret;
    	leave lb_pro;
	end if;
    
    if bsettled = 1		#已结算,
    then
		select 2 into spret;
        leave lb_pro;
	end if;
    
    #更改结算状态
    update GameIssue set isSettled = TRUE where gameid = gid and issueNO = isno;
    
    #大小
    if gameresult > 13
    then
		set isbg = 1;
	else
		set isbg = 0;
	end if;
    
    #单双
    if gameresult % 2 = 0
    then
		set isdb = 1;
	else
		set isdb = 0;
	end if;
	   
    #结算大小
    if isbg = 1 #大
    then
		#in gid INT,in isid int,in runame int
        select ruleid into rid from Rule where gameid = gid and rulename = 0;
		call sp_curwinsettle(gid,isid,rid); #大
    else	#小
		#in gid INT,in isid int,in runame int
        select ruleid into rid from Rule where gameid = gid and rulename = 1;
		call sp_curwinsettle(gid,isid,rid); #小
    end if;

    #结算单双
	if 	isdb = 1	#双
    then
    select ruleid into rid from Rule where  gameid = gid and rulename = 3;
		call sp_curwinsettle(gid,isid,rid); #双
	else	#单
		select ruleid into rid from Rule where  gameid = gid and rulename = 2;
		call sp_curwinsettle(gid,isid,rid); #单
    end if;
    
    #结算大小单双
    if isbg=1 and isdb =1	#大双
    then
		select ruleid into rid from Rule where  gameid = gid and rulename = 5;
		call sp_curwinsettle(gid,isid,rid);
    end if;
    
    if isbg=1 and isdb=0	#大单
    then
    select ruleid into rid from Rule where  gameid = gid and rulename = 4;
		call sp_curwinsettle(gid,isid,rid);
    end if;
    
    if isbg=0 and isdb=1	#小双
    then
		select ruleid into rid from Rule where  gameid = gid and rulename = 7;
		call sp_curwinsettle(gid,isid,rid);
    end if;
    
    if isbg=0 and isdb=0	#小单
    then
    select ruleid into rid from Rule where  gameid = gid and rulename = 6;
		call sp_curwinsettle(gid,isid,rid);
    end if;
    
    #结算特码
    select ruleid into rid from Rule where gameid = gid and  rulename = (gameresult+8);
    call sp_curwinsettle(gid,isid,rid);
    
    #结算极值
    if gameresult = 0	#极小
    then
		select ruleid into rid from Rule where gameid = gid and  rulename = 37;
		call sp_curwinsettle(gid,isid,rid);
    end if;
    if gameresult = 27	#极大
    then
		select ruleid into rid from Rule where gameid = gid and  rulename = 36;
		call sp_curwinsettle(gid,isid,rid);
    end if;
	
    #将本期输的玩家插入到日志
    call sp_curlosesettle(gid,isid);
    
    select 0 into spret;
    
end //
DELIMITER ;

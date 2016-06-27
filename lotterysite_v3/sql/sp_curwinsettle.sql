DROP PROCEDURE IF EXISTS sp_curwinsettle;
# 结算所有赢的玩家的金币数
DELIMITER //
CREATE  procedure sp_curwinsettle(in gid INT,in isid int,in ruid int) #游戏id,  期数id, 规则id
lb_pro:begin

    declare u_id int;			#用户id
    declare btamount decimal; 	#下注数量
    declare betodds  float default 0.0;		#赔率
    declare loopdone int default FALSE;	#游标是否结束
    declare curbetid int ;			#投注id
    
    declare totalIn	 int;			#总注
    declare issueresult int;		#开奖结果
    declare inrutype int;			#投注类型 0-组合，1-特码 2-极值 3-单值
        
    #定义游标
    declare cur cursor for select betid,userid,amount from BetLog where gameid=gid and issueid = isid and ruleid = ruid and bsettled=False;
    declare continue handler for not found set loopdone = TRUE;
	
    #获取赔率
    select odds, ruletype into betodds,inrutype from Rule where gameid = gid and ruleid = ruid;
    if	betodds <= 0.0	#如果赔率未找到,或者小于等于0,则退出
    then
		leave lb_pro;
    end if;
    
    select result into issueresult from GameIssue where gameid = gid and issueid = isid;
    if issueresult is null
    then 
		leave lb_pro;
    end if;
    
    open cur;
    read_loop:LOOP
		fetch cur into curbetid,u_id,btamount;
        
        if loopdone 
        then
			leave read_loop;
		end if;
        
        if u_id is not null and btamount is not null
        then
        
			select sum(amount) into totalIn from BetLog where gameid = gid and issueid=isid and userid=u_id;
            
            # 组合
            if (issueresult = 13 or issueresult = 14) and inrutype = 0 and totalIn is not null
            then
				if totalIn >= 1001 and totalIn <= 10000		# 1001,10000之间,下组合,赔3倍
                then
					update Member set money = (money + btamount*3) where userid=u_id;
                    update BetLog set bsettled = True where betid=curbetid;
                    
                    insert into MoneyChangeLog(amount,changetype,changetime,gameid,issueid,userid) values(btamount*3,1,localtime(),gid,isid,u_id);
                elseif totalIn > 10000						# 10000以上,下组合,保本
                then
					update Member set money = (money + btamount) where userid=u_id;
                    update BetLog set bsettled = True where betid=curbetid;
                    
                    insert into MoneyChangeLog(amount,changetype,changetime,gameid,issueid,userid) values(btamount,1,localtime(),gid,isid,u_id);
                else	#其他情况安装赔率赔
					update Member set money = (money + btamount*betodds) where userid=u_id;
                    update BetLog set bsettled = True where betid=curbetid;
                    
                    insert into MoneyChangeLog(amount,changetype,changetime,gameid,issueid,userid) values(btamount*betodds,1,localtime(),gid,isid,u_id);
                    
                end if;
                
			# 大小单双
            elseif (issueresult = 13 or issueresult = 14) and inrutype = 3 and totalIn is not null
            then 
				if totalIn >= 1001 and totalIn <=10000		# 1001,10000之间,下大小单双 赔 1.5倍
                then
					update Member set money = (money + btamount*1.5) where userid=u_id;
                    update BetLog set bsettled = True where betid=curbetid;
                    insert into MoneyChangeLog(amount,changetype,changetime,gameid,issueid,userid) values(btamount*1.5,1,localtime(),gid,isid,u_id);
                elseif totalIn > 10000                      # 10000以上, 下大小单上保本
                then
					update Member set money = (money + btamount) where userid=u_id;
                    update BetLog set bsettled = True where betid=curbetid;
                    #插入金币变化日志
                    insert into MoneyChangeLog(amount,changetype,changetime,gameid,issueid,userid) values(btamount,1,localtime(),gid,isid,u_id);
                    
                else #其他情况安装赔率赔 
					update Member set money = (money + btamount*betodds) where userid=u_id;
                    update BetLog set bsettled = True where betid=curbetid;
                    #插入金币变化日志
					insert into MoneyChangeLog(amount,changetype,changetime,gameid,issueid,userid) values(btamount*betodds,1,localtime(),gid,isid,u_id);
                    
                end if;
				
            else
            	update Member set money = (money + btamount*betodds) where userid=u_id;
				update BetLog set bsettled = True where betid=curbetid;
				#插入金币变化日志
				insert into MoneyChangeLog(amount,changetype,changetime,gameid,issueid,userid) values(btamount*betodds,1,localtime(),gid,isid,u_id);
            end if;
        end if;
	
	end LOOP;
      
    close cur;
end //
DELIMITER ;



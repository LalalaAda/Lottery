DROP PROCEDURE IF EXISTS sp_curlosesettle;
# 结算所有输的玩家的金币数
DELIMITER //
CREATE  procedure sp_curlosesettle(in gid INT,in isid int)
lb_pro:begin

    declare u_id int;			#用户id
    declare btamount decimal; 	#下注数量
    declare betodds  float default 0.0;		#赔率
    declare loopdone int default FALSE;	#游标是否结束
    declare curbetid int ;		#下注id
    
    #定义游标
    declare cur cursor for select betid, userid , amount from BetLog where gameid=gid and issueid = isid and bsettled=False;
    declare continue handler for not found set loopdone = TRUE;
	
    open cur;
    read_loop: loop
		fetch cur into curbetid,u_id,btamount;
        
        if loopdone 
        then
			leave read_loop;
		end if;

        if u_id is not null and btamount is not null
        then
			update BetLog set bsettled =True where betid=curbetid;
			
            #插入金币变化日志
			#insert into MoneyChangeLog(amount,changetype,changetime,gameid,issueid,userid) values(-btamount,1,localtime(),gid,isid,u_id);
        end if;
                
        
	
    end loop;
    
    close cur;
end //
DELIMITER ;



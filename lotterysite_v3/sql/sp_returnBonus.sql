DROP PROCEDURE IF EXISTS sp_returnBonus;
# 反水存储过程
DELIMITER //
create procedure sp_returnBonus()
lb_pro:begin
	
    declare userid int;	#用户id
	declare totalin int; #下注总额
    declare singlein int; #大小单双投入总额
 
    declare cur cursor ;

    


end //
DELIMITER ;


select * from MoneyChangeLog where userid = 14;

select sum(amount) as total,userid from MoneyChangeLog where changetype = 2 and  changetime > current_date() and  changetime <  DATE_ADD(current_date(),INTERVAL 1 DAY) group by userid;


#总
select sum(amount) as totalIn, userid from BetLog where gameid=1 and bettime > current_date() and  bettime <  DATE_ADD(current_date(),INTERVAL 1 DAY) group by userid;

#大小单双
select sum(amount) as totalIn, userid  from BetLog where gameid=1 and ruleid in (1,2,3,4) and bettime > current_date() and  bettime <  DATE_ADD(current_date(),INTERVAL 1 DAY);

select * from Rule;
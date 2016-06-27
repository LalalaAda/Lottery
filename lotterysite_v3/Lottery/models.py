# -*- coding:utf-8 -*-
import datetime
from django.db import models
from django.contrib.auth.models import User

# Create your models here.

#性别
GENDER_CHOICES = (
    (0,u"Female"),
    (1,u"Male"),
)

#用户身份
PERMISSION_CHOICES = (
    (0,u"普通用户"),
    (1,u"代理"),
)

#代理界别
AGENTLEVEL_CHOICES = (
    (0,u"一级代理"),
    (1,u"二级代理"),
)

#游戏状态
GAMESTATUS_CHOICES = (
    (0,u"游戏维护中"),
    (1,u"游戏暂停中"),
    (2,u"游戏进行中"),
    (3,u"游戏已废弃"),
)

#登陆类型
LOGINTYPE_CHOICES = (
    (0,u"电脑登陆"),
    (1,u"移动设备"),
)

#金币变化类型
MONEYCHANGETYPE_CHOICES = (
    (1,u"游戏输赢"),
    (2,u"代理上下分"),
    (3,u"反水"),
)

#游戏期数状态
ISSUESTATUS_CHOICES = (
    (0,u"未开奖"),
    (1,u"已开奖"),
)

#游戏规则类型
RULETYPE_CHOICES = (
    (0,u"组合"),
    (1,u"特码"),
    (2,u"极值"),
    (3,u'单')
)

#上下分权限
MONEYPRIVILEGE_CHOICES = (
    (0,u'无'),
    (1,u'有'),
)

#代理山状态
AGENTSTATUS_CHOICES = (
    (0,u'冻结'),
    (1,u'正常'),
)

MEMBERSTATUS_CHOICES = (
    (0,u'冻结'),
    (1,u'正常'),
)

#快乐28下注种类
KL28BETKINDS_CHOICES = (
    (0,u'大'),
    (1,u'小'),
    (2,u'单'),
    (3,u'双'),
    (4,u'大单'),
    (5,u'大双'),
    (6,u'小单'),
    (7,u'小双'),
    (8,u'特码00'),
    (9,u'特码01'),
    (10,u'特码02'),
    (11,u'特码03'),
    (12,u'特码04'),
    (13,u'特码05'),
    (14,u'特码06'),
    (15,u'特码07'),
    (16,u'特码08'),
    (17,u'特码09'),
    (18,u'特码10'),
    (19,u'特码11'),
    (20,u'特码12'),
    (21,u'特码13'),
    (22,u'特码14'),
    (23,u'特码15'),
    (24,u'特码16'),
    (25,u'特码17'),
    (26,u'特码18'),
    (27,u'特码19'),
    (28,u'特码20'),
    (29,u'特码21'),
    (30,u'特码22'),
    (31,u'特码23'),
    (32,u'特码24'),
    (33,u'特码25'),
    (34,u'特码26'),
    (35,u'特码27'),
    (36,u'极大'),
    (37,u'极小'),
)

# 28cq.com/getann/?type=1
#公告类型
ANNOUNCE_CHOICES = (
    (0,u'0 - 进入游戏欢迎界面信息'),
    (1,u'1 - 上期开奖结果'),
    (2,u'2 - 近10期结果'),
    (3,u'3 - 可以投注信息'),
    (4,u'4 - 60秒抓紧时间投注'),
    (5,u'4 - 封盘'),
)

GAMETYPE_CHOICES = (
    (1,u'快乐28'),
    (2,u'加拿大28'),
)

class Member(models.Model):
    memberid = models.AutoField(primary_key=True,db_column='memberid',editable=False,help_text=u"主键")
    userid = models.ForeignKey(User,db_column='userid',help_text=u"外键,关联django系统的User表",verbose_name=u'用户')
    agentid = models.ForeignKey('Agent',db_column='agentid', on_delete=models.SET_NULL,blank=True,null=True,help_text=u"外键,关联代理商",verbose_name=u'代理商')
    gender = models.IntegerField(choices=GENDER_CHOICES,default=1,help_text=u"性别",verbose_name=u'性别')
    money = models.IntegerField(default=18,help_text=u"金币",verbose_name=u'金币')
    status = models.IntegerField(choices=MEMBERSTATUS_CHOICES,default=1,help_text=u"玩家状态",verbose_name=u"玩家状态")
    
    def __unicode__(self):
        return unicode(self.userid.username)
    
    class Meta():
        db_table = 'Member'
        verbose_name_plural = u'会员'
        
class LoginLog(models.Model):
    loginid = models.AutoField(primary_key=True,db_column='loginid',editable=False,help_text=u"主键")
    userid = models.ForeignKey(User,db_column='userid',help_text=u"外键,关联User表",verbose_name=u'用户')
    loginip = models.CharField(max_length=50,null=False,help_text=u"登陆IP",verbose_name=u'登录IP')
    logintype = models.IntegerField(choices=LOGINTYPE_CHOICES,default=0,help_text=u"登陆类型",verbose_name=u'登录类型')
    logintime = models.DateTimeField(auto_now=True,help_text=u"登陆时间",verbose_name=u'登录时间')
    
    def __unicode__(self):
        return unicode(self.userid.username)
    
    class Meta():
        db_table = "LoginLog"
        verbose_name_plural = u'登录日志'
        

class Agent(models.Model):
    agentid = models.AutoField(primary_key=True,db_column="agentid",editable=False,help_text=u"主键")
    userid = models.ForeignKey(User,db_column="userid",verbose_name=u'用户')
    agentcode = models.CharField(max_length=10,null=False,unique=True,help_text=u"代理商编码",verbose_name=u'代理商编码')
    agentlevel = models.IntegerField(choices=AGENTLEVEL_CHOICES,default=0,help_text=u"代理级别",verbose_name=u'代理级别')
    ratio = models.FloatField(default=0.0,help_text=u'占成')
    chargemount = models.DecimalField(max_digits=20,decimal_places=2,default=0.00,help_text=u"总上分")
    exchange = models.DecimalField(max_digits=20,decimal_places=2,default=0.00,help_text=u"总下分")
    moneyprivilege = models.IntegerField(choices=MONEYPRIVILEGE_CHOICES,default=1,help_text=u"是否有上下分权限,0:无,1:有")
    status = models.IntegerField(choices=AGENTSTATUS_CHOICES,default=1,help_text=u"代理商状态,0:冻结;1:正常")
    takeupdate = models.DateTimeField(default=datetime.datetime.now(),help_text=u"成为代理商时间",verbose_name=u'成为代理商时间')
    
    def __unicode__(self):
        return unicode(self.userid.username)
    
    class Meta():
        db_table = 'Agent'
        verbose_name_plural = u'代理商'

class Game(models.Model):
    gameid = models.AutoField(primary_key=True,db_column='gameid',editable=False,help_text=u"主键")
    gamename = models.CharField(max_length=100,null=False,help_text=u"游戏名称",verbose_name=u'游戏名称')
    gametype = models.IntegerField(choices=GAMETYPE_CHOICES,help_text=u'游戏类别',verbose_name=u'游戏类别')
    descript = models.TextField(null=True,help_text=u"游戏描述",verbose_name=u'游戏描述')
    gamerule = models.TextField(null=True,help_text=u"游戏规则",verbose_name=u'游戏规则')
    status = models.IntegerField(choices=GAMESTATUS_CHOICES,default=0,help_text=u"游戏状态",verbose_name=u'游戏状态')
    jackpot = models.IntegerField(default=0,help_text=u"奖池",verbose_name=u'奖池')
    begintime = models.TimeField(default='09:05' ,help_text=u"游戏开始时间",verbose_name=u'游戏开始时间')
    endtime = models.TimeField(default='00:00', help_text=u"游戏结束时间",verbose_name=u'游戏结束时间')
    
    def __unicode__(self):
        return self.gamename
    
    class Meta():
        db_table = 'Game'
        verbose_name_plural = u'游戏'
        
class GameRules(models.Model):
    ruleid = models.AutoField(primary_key=True,db_column='ruleid',editable=False,help_text=u"主键")
    gameid = models.ForeignKey(Game,db_column='gameid',help_text=u"外键,关联Game表",verbose_name=u'游戏')
    rulename = models.IntegerField(choices=KL28BETKINDS_CHOICES,editable=False,help_text=u'规则' )
    ruledesc = models.CharField(max_length=50,null=False,help_text=u'规则名称',verbose_name=u'规则名称')
    odds = models.FloatField(null=False,help_text=u"赔率",verbose_name=u'赔率')
    ruletype = models.IntegerField(choices=RULETYPE_CHOICES,help_text=u"游戏规则类型",verbose_name=u"游戏规则类型")
    def __unicode__(self):
        return unicode(self.ruledesc)
    
    class Meta():
        db_table='Rule'
        verbose_name_plural = u'游戏规则'
        
class GameIssue(models.Model):
    issueid = models.AutoField(primary_key=True,db_column='issueid',editable=False,help_text=u"主键")
    gameid = models.ForeignKey(Game,db_column='gameid',help_text=u"外键,关联Game表",verbose_name=u"游戏")
    issueNO = models.IntegerField(null=False,help_text=u"期数",verbose_name=u'期数')
    balance = models.IntegerField(default=0,help_text=u"当期输赢",verbose_name=u'当期输赢')
    lotterytime = models.DateTimeField(help_text=u"开奖时间",verbose_name=u'开奖时间')
    result = models.IntegerField(null=True,blank=True,help_text=u"开奖结果",verbose_name=u"开奖结果")
    resultdetail = models.CharField(null=True,blank=True,max_length=200,help_text=u"结果详细",verbose_name=u"结果详细")
    bopened = models.IntegerField(choices=ISSUESTATUS_CHOICES,default=0,editable=False,help_text=u"是否已开奖",verbose_name=u"是否已开奖")
    isSettled = models.BooleanField(default=False,help_text=u"本期是否已结算,True表示已结算;False表示未结算")
    def __unicode__(self):
        return unicode(self.issueNO)
    
    class Meta():
        db_table = 'GameIssue'
        verbose_name_plural = u'游戏期数'
        
        
class BetLog(models.Model):
    betid = models.AutoField(primary_key=True,db_column='betid',editable=False,help_text=u"主键")
    userid = models.ForeignKey(User,db_column='userid',on_delete=models.SET_NULL,blank=False,null=True,help_text=u"外键, 下注玩家",verbose_name=u'下注玩家')
    gameid = models.ForeignKey(Game,db_column='gameid',on_delete=models.SET_NULL,blank=False,null=True,help_text=u"外键, 下注的游戏",verbose_name=u'下注游戏')
    issueid = models.ForeignKey(GameIssue,db_column='issueid',on_delete=models.SET_NULL,blank=False,null=True,help_text=u"外键,下注期数",verbose_name=u'下注期数')
    ruleid = models.ForeignKey(GameRules,db_column='ruleid',on_delete=models.SET_NULL,blank=False,null=True,help_text=u"外键,下了什么注",verbose_name=u'下注')
    amount = models.IntegerField(null=False,help_text=u"下注数量",verbose_name=u'下注数量')
    bsettled = models.BooleanField(default=False,help_text=u"投注是否结算",verbose_name=u"投注是否结算")
    bettime = models.DateTimeField(null=False,help_text=u"下注时间",verbose_name=u'下注时间')

    def __unicode__(self):
        return unicode(self.betid)
    
    class Meta():
        db_table = 'BetLog'
        verbose_name_plural = u'下注记录'
        
class MoneyChangeLog(models.Model):
    changeid = models.AutoField(primary_key=True,db_column='changeid',editable=False,help_text=u"主键")
    userid = models.ForeignKey(User,db_column='userid',help_text=u"外键,用户",verbose_name=u'用户')
    gameid = models.ForeignKey(Game,blank=False,null=True,db_column='gameid',help_text=u"外键,关联游戏",verbose_name=u"游戏")
    issueid = models.ForeignKey(GameIssue,null=True,db_column='issueid',help_text=u'外键,游戏期数',verbose_name=u'期数')
    amount = models.IntegerField(null=False,help_text=u"变化数量",verbose_name=u'变化数量')
    changetype = models.IntegerField(choices=MONEYCHANGETYPE_CHOICES,null=False,help_text=u"金币变化类型",verbose_name=u'金币变化类型')
    changetime = models.DateTimeField(auto_now=True,help_text=u"改变时间",verbose_name=u'改变时间')
    
    def __unicode__(self):
        return unicode(self.userid.username) + u' - ' + unicode(self.gameid.gamename) + u' - ' + unicode(self.amount)
    
    class Meta():
        db_table = 'MoneyChangeLog'
        verbose_name_plural = u'金币变化记录'

class GameRecord(models.Model):
    recordid = models.AutoField(primary_key=True,db_column='recordid',editable=False,help_text=u"主键")
    gameid = models.ForeignKey(Game,db_column='gameid',help_text=u"外键,关联Game表",verbose_name=u"游戏")
    issueid = models.ForeignKey(GameIssue,db_column='issueid',help_text=u"外键,关联GameIssue表",verbose_name=u"期数")
    balance = models.DecimalField(max_digits=20,decimal_places=2,null=False,help_text=u"输赢",verbose_name=u"输赢金币数")
    gametime = models.DateTimeField(auto_now=True,help_text=u"游戏时间",verbose_name=u"游戏时间")
    
    def __unicode__(self):
        return unicode(self.gameid.gamename) + unicode(self.recordid)
    
    class Meta():
        db_table = 'GameRecord'
        verbose_name_plural = u"游戏记录"
        
class BetMessage(models.Model):
    betmsgid = models.AutoField(primary_key=True,db_column='betmsgid',help_text=u'主键')
    userid = models.ForeignKey(User,db_column='userid',on_delete=models.SET_NULL,blank=True,null=True,help_text=u'外键,关联User')
    gameid = models.ForeignKey(Game,db_column='gameid',help_text=u'游戏ID')
    issueid = models.ForeignKey(GameIssue,null=True,db_column='issueid',help_text=u'期数')
    msg = models.CharField(max_length=1000,null=False,help_text=u'下注信息')
    bettime = models.DateTimeField(auto_now=True,help_text=u'下注完成时间',null=False)
    
    def __unicode__(self):
        return  unicode(self.userid.username) + unicode(self.msg) + unicode(self.bettime)
    
    class Meta():
        db_table = 'BetMessage'
        verbose_name_plural=u'下注信息'
        

class Announce(models.Model):
    announceid = models.AutoField(primary_key=True,db_column='announceid',help_text=u'主键')
    antype = models.IntegerField(choices=ANNOUNCE_CHOICES,help_text=u'聊天框中的提示信息')
    content = models.TextField(help_text=u'提示内容')
    createdate = models.DateTimeField(default=datetime.datetime.now(),help_text=u'创建公告日期')
    
    def __unicode__(self):
        return unicode(self.content)
    
    class Meta():
        db_table = 'Announce'
        verbose_name_plural = u'公告'
        
        
class News(models.Model):
    newsid = models.AutoField(primary_key=True,db_column='newsid',help_text=u'主键')
    title = models.CharField(max_length=150,help_text=u'标题')
    content = models.TextField(help_text=u'内容')
    createdate = models.DateTimeField(default=datetime.datetime.now(),help_text=u'创建时间')
    
    def __unicode__(self):
        return unicode(self.title)
    
    class Meta():
        db_table = 'News'
        verbose_name_plural = u'新闻'
        

class Benefits(models.Model):
    benefitsid = models.AutoField(primary_key=True,db_column='benefitsid',help_text=u'主键')
    isreturned = models.BooleanField(default=True,help_text=u'是否发放福利')
    date = models.DateField(default=datetime.date.today(),help_text=u"福利结算日期")
    settledate = models.DateTimeField(default=datetime.datetime.now(),help_text=u'福利结算时间')
    
    def __unicode__(self):
        return unicode(self.benefitsid)
    
    def Meta():
        db_table = 'Benefits'
        verbose_name_plural = u'福利结算'
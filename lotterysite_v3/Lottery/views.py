# -*- coding:utf-8 -*-
import re
import datetime
from django.core import serializers
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate,logout,login
from django.http import JsonResponse,HttpResponse,HttpResponseRedirect
from django.core.exceptions import ObjectDoesNotExist
from Lottery.models import Member,LoginLog,Agent,Game,GameRules,GameIssue,BetLog,MoneyChangeLog,BetMessage,Announce,News
from Lottery.forms import RegisterForm,LoginForm
from django.db import connection
import traceback
from django.utils import timezone

from decimal import *

# Create your views here.
def testrule(request):
	return render(request,'Lottery/rule.html')

def testIndex(request):
	return render(request,'Lottery/index.html')

def mytest(request):
    return render(request,'Lottery/base.html')

def bstest(request):
    return render(request,'Lottery/base.html')

def showNews(request,newsid):
    newlist = News.objects.order_by('-createdate')[:5]
    newid = int(newsid)
    news = News.objects.get(newsid=newid)
    member = None
    if request.user.is_authenticated():
        member = Member.objects.get(userid=request.user)
    return render(request,'Lottery/news.html',{'newslist':newlist,'news':news,'member':member})

def index(request):
    
    newlist = News.objects.order_by('-createdate')[:5]
    
    if request.user.is_authenticated():
        
        try:
            checkagent = Agent.objects.get(userid=request.user)
        except Exception,e:
            pass
        else:
            logout(request)
            return render(request,'Lottery/index.html',{'newslist':newlist})
        
        try:
            member = Member.objects.get(userid=request.user)
        except ObjectDoesNotExist:
            logout(request)
            return render(request,'Lottery/index.html',{'newslist':newlist})    
        else:
            return render(request,"Lottery/index.html",{'member':member,'newslist':newlist})
    else:
        return render(request,'Lottery/index.html',{'newslist':newlist})

def register(request):
    if request.method == 'POST':
        registerResult = {}
        
        username = request.POST.get('username')
        pwd = request.POST.get('password')
        agentname = request.POST.get('agentname')    #代理商用户名    agentcode
        bDataValid = True
        
        if len(username) <6:
            bDataValid = False
        if len(pwd) < 6:
            bDataValid = False
        if len(agentname) < 6:
            bDataValid = False
        
        if bDataValid:
            #检查用户名是否符合要求
            pattern = re.compile(r'[A-Za-z0-9]{6,20}')
            match = pattern.match(username)
            if match is None:
                registerResult['result'] = 0  #注册失败
                registerResult['reason'] = '用户名不符合要求'
                return JsonResponse(registerResult) 
            try:
                user = User.objects.get(username=username)
            except ObjectDoesNotExist:
                pass
            else:
                registerResult['result'] = 0  #注册失败
                registerResult['reason'] = '用户名已存在,换一个试试!'
                return JsonResponse(registerResult)
            
            try:
                #agent = Agent.objects.get(agentcode=agentcode)
                user_agent = User.objects.get(username=agentname)
                agent = Agent.objects.get(userid=user_agent)
            except ObjectDoesNotExist:
                registerResult['result'] = 0  #注册失败
                registerResult['reason'] = u'推荐人不存在,请重新输入'
                return JsonResponse(registerResult)
            except Exception , e:
                registerResult['result'] = 0  #注册失败
                registerResult['reason'] = u'系统正在维护，请稍候再试'
                return JsonResponse(registerResult)
            try:
                user = User.objects.create_user(username=username,password=pwd)
                member = Member(userid=user,agentid=agent)
                member.save()
            except Exception ,e:
                registerResult['result'] = 0  #注册失败
                registerResult['reason'] = '注册失败,请稍候再试'
                return JsonResponse(registerResult)
            
            else:
                user = authenticate(username=username,password=pwd)
                login(request,user)
                registerResult['result'] = 1  #注册失败
                registerResult['reason'] = u'注册成功'
                return JsonResponse(registerResult)
        else:
            registerResult['result'] = 0   #注册结果, 0:失败 ； 1:成功
            registerResult['reason'] = u'请按要求填写用户名和密码'
            return JsonResponse(registerResult)
    else:
        return HttpResponseRedirect('/')

    
def loginuser(request):
    if request.method == 'POST':      
        jsLogin = {}    #要返回的json格式数据
        loginMessage = u''
        username = request.POST['logusername']
        pwd = request.POST['logpassword']
        user = authenticate(username=username,password=pwd)
        if user is not None:
            if user.is_active:
                #代理账号无法登陆游戏
                try:
                    agent = Agent.objects.get(userid=user)
                except ObjectDoesNotExist:
                    pass
                except Exception,e:
                    print 'login----------------',traceback.print_exc()
                else:
                    jsLogin['result'] = 0
                    jsLogin['reason'] = u'代理账号不能登陆游戏'
                    return JsonResponse(jsLogin)
                try:
                    login(request,user)
                    member = Member.objects.get(userid=user)

                    #插入登录记录
                    loginlog = LoginLog(userid=user,loginip=request.META['REMOTE_ADDR'])
                    loginlog.save()
                except Exception,e:
                    print traceback.print_exc()
                    jsLogin['result'] = 0
                    jsLogin['reason'] = u'登录错误'
                    return JsonResponse(jsLogin)
                else:
                    #设置登录成功session
                    request.session['haslogedin'] = '1'
                    jsLogin['result'] = 1  #登录成功
                    jsLogin['reason'] = u"登陆成功!"
                    return JsonResponse(jsLogin)
            else:
                jsLogin['result'] = 0  #登录失败
                jsLogin['reason'] = u"账号被禁用,请联系管理员"
                return JsonResponse(jsLogin)
        else:
            
            jsLogin['result'] = 0  #登录失败
            jsLogin['reason'] = u"账户或密码错误，请检查"
            return JsonResponse(jsLogin)
    else:
        return HttpResponseRedirect('/')

        
def logoutuser(request):
    if request.user.is_authenticated():
        logout(request)
        
    return HttpResponseRedirect('/')   #返回当前页面

def checkname(request,username):
    jsCheck = {}
    
    #检查用户名是否符合规则
    pattern = re.compile(r'[A-Za-z]([A-Za-z]|_){5,20}')
    _tempname = username.strip()
    match = pattern.match(_tempname)
    if match is None:
        jsCheck['result'] = 0  #用户名不符合要求
        jsCheck['reason'] = u'用户名不符合要求'
        return JsonResponse(jsCheck)
    
    try:
        user = User.objects.get(username=_tempname)
    except ObjectDoesNotExist:
        jsCheck['result'] = 1  #用户名可用
        jsCheck['reason'] = u"用户名可用"
        return JsonResponse(jsCheck)
    else:
        jsCheck['result'] = 0  #用户名已存在
        jsCheck['reason'] = u"用户名已存在"
        return JsonResponse(jsCheck)
    
def checkagent(request,agentcode):
    jsCheck = {}
    agentcode = agentcode.strip()
    try:
        agent = Agent.objects.get(agentcode=agentcode)
    except ObjectDoesNotExist:
        jsCheck['result'] = 0  #代理商检查失败
        jsCheck['reason'] = u"推荐人不存在"
        return JsonResponse(jsCheck)
    else:
        jsCheck['result'] = 1
        jsCheck['reason'] = u"推荐人存在"
        return JsonResponse(jsCheck)
    
def getdata(request):
    if request.method == 'GET':
        redata = {}
        try:
            gametype = request.GET.get('type')
            gameobj = Game.objects.get(gametype=gametype)

            maxopened = GameIssue.objects.filter(gameid=gameobj).filter(bopened=1).order_by('-issueNO')[:1]
            unopen = GameIssue.objects.filter(gameid=gameobj).filter(bopened=0).filter(issueNO__gt=maxopened[0].issueNO)
            
            unopencount = unopen.count()
            if unopencount>=4:
                unopen = GameIssue.objects.filter(gameid=gameobj).filter(bopened=0).order_by('-issueNO')[1:4]
            elif unopencount <4:
                unopen = GameIssue.objects.filter(gameid=gameobj).filter(bopened=0).filter(issueNO__gt=maxopened[0].issueNO).order_by('-issueNO')
            
            #unopen = GameIssue.objects.filter(gameid=gameobj).filter(bopened=0).order_by('-issueNO')[1:4]
            history = GameIssue.objects.filter(gameid=gameobj).filter(bopened=1).order_by('-issueNO')[:10]
            
            alllist = []
            for item in unopen:
                alllist.append(item)
            for item in history:
                alllist.append(item)
            
            data = serializers.serialize("json",alllist)
            #issuelist = GameIssue.objects.order_by('-issueNO')[:13]
        except Exception,e:
            print traceback.print_exc()
            return JsonResponse({'result':0,'servertime':datetime.datetime.now(),'data':''})
        else:
            return JsonResponse({'result':1,'servertime':datetime.datetime.now(),'data':data},safe=False)
    else:
        return JsonResponse({'result':0,'servertime':datetime.datetime.now(),'data':''})

# 查询是否登录
def checklogin(request):
    jsRes ={}
    if request.user.is_authenticated():
        jsRes['islogedin'] = 1
    else:
        jsRes['islogedin'] = 0
    return JsonResponse(jsRes)

# 查询开奖结果
def checkResult(request):
    rejson = {'result':0}
    if request.method == 'GET':
        klno = request.GET['klno']
        try:
            gameissue = GameIssue.objects.get(issueNO=klno)
            if gameissue is None:
                rejson['result'] = 0
            
            bopened = gameissue.bopened
            if bopened == 1:
                rejson['result'] = 1
            
        except Exception,e:
                rejson['result'] = 0
        return JsonResponse(rejson)
    else:
        return JsonResponse(rejson)

# 获取游戏规则   
def getrules(request):
    resjson = {}
    if request.method == 'GET':
        gameid = request.GET.get('gameid')
        try:
            rules = GameRules.objects.filter(gameid=gameid)
        except Exception,e:
            resjson['result'] = 0
            resjson['data'] = u''
        else:
            resjson['result'] = 1
            data = serializers.serialize("json",rules)
            resjson['data']= data
    else:
        resjson['result'] = 0
        resjson['data'] = u''
    return JsonResponse(resjson)

def getnamemoney(request):
    retjson = {}
    retjson['result'] = 0
    if request.method == 'GET':
        if request.user.is_authenticated():
            try:
                gameid = request.GET.get('gameid')
                username = request.user.username
                member = Member.objects.get(userid=request.user)
                money = member.money
                cursor = connection.cursor()
                try:
                    #sqlstr = 'select sum(amount) from MoneyChangeLog where gameid=%d and userid=%d and changetype=1 and changetime >= current_date() and changetime <  DATE_ADD(current_date(),INTERVAL 1 DAY)'%(int(gameid),int(request.user.id))
                    sqlstr = 'select sum(amount) from MoneyChangeLog where userid=%d and changetype=1 and changetime >= current_date() and changetime <  DATE_ADD(current_date(),INTERVAL 1 DAY)'%(int(request.user.id))
                except Exception,e:
                    print 'fuckkkkkkkkkkkkk',traceback.print_exc()
                cursor.execute(sqlstr)
                record = cursor.fetchone()
                if record is None:
                    retjson['todaysettle'] = 0
                else:
                    retjson['todaysettle'] = record[0]
                #sql = 'select count(distinct issueid) from BetLog where gameid=%d and userid=%d and bettime >= current_date() and bettime < DATE_ADD(current_date(),INTERVAL 1 DAY)'%(int(gameid),int(request.user.id))
                sql = 'select count(distinct issueid) from BetLog where userid=%d and bettime >= current_date() and bettime < DATE_ADD(current_date(),INTERVAL 1 DAY)'%(int(request.user.id))
                cursor.execute(sql)
                record = cursor.fetchone()
                
                if record is None:
                    retjson['invocount'] =0
                else:
                    retjson['invocount'] =record[0]
                    
                retjson['result'] = 1
                retjson['username'] = username
                retjson['money'] = money
                retjson['userid'] = request.user.id + 16000
                return JsonResponse(retjson)
            except Excpetion,e:
                print '**********************',print_exc()
    return JsonResponse(retjson)


#下注
def gamebet(request):
    if request.method == 'POST' and request.user.is_authenticated():
        retjson = {}
        retjson['result'] = 1
        retstr = ''
        msg = ''
        
        try:
            _checkagent = Agent.objects.get(userid=request.user)
        except ObjectDoesNotExist:
            pass
        else:
            retjson['result'] = 0
            retjson['message'] = u'代理账号不能玩游戏'
            return JsonResponse(retjson)
        
        for key in request.POST:
            data = request.POST[key]
            if data is None:
                retjson['result'] = 0
                retstr = u'投注数据不能为空'
            dlist = data.split(',')
            if dlist.__len__() != 4:
                retjson['result'] = 0
                retstr = u'投注数据格式错误'
            
            try:
                gameid = int(dlist[0])
                issueno = int(dlist[1])
                ruleid = int(dlist[2])
                money = int(dlist[3])
                
                if money < 20:
                    retjson['result'] = 0
                    retstr = u'单注下注20起'
                if money > 50000:
                    retjson['result'] = 0
                    retstr = u'单注下注50000封顶'
            
            except Exception,e:
                print '----------e,',traceback.print_exc()
                retjson['result'] = 0
                retstr = u'投注数据解析错误'
            if money <0:
                retjson['result'] = 0
                retstr = u'非法投注额度'
            
            try:
                member = Member.objects.get(userid=request.user)
            except Exception,e:
                print '----------e,',traceback.print_exc()
                retjson['result'] = 0
                retstr = u'用户不存在'
            try:
                gameobj = Game.objects.get(gameid=gameid)
            except Exception,e:
                print '----------e,',traceback.print_exc()
                retjson['result'] = 0
                retstr = u'游戏不存在'
            try:
                issueobj = GameIssue.objects.get(issueNO=issueno)
                
                now = timezone.now()
                opentm = issueobj.lotterytime
                
                if now >= opentm:
                    retjson['result'] = 0
                    retstr = u'投注时间已过'
                
            except Exception,e:
                print '----------e,',traceback.print_exc()
                retjson['result'] = 0
                retstr = u'游戏不存在'
            try:
                ruleobj = GameRules.objects.get(ruleid=ruleid)
            except Exception,e:
                print '----------e,',traceback.print_exc()
                retjson['result'] = 0
                retstr = u'游戏不存在'
            try:
                if member.money < money:
                    retjson['result'] = 0
                    retstr = u'余额不足'
            except Exception,e:
                retjson['result'] = 0
                retstr = u'余额计算错误'
            
            if retjson['result'] == 1:
                try:
                    betobj = BetLog(userid=request.user,gameid=gameobj,issueid=issueobj,ruleid=ruleobj,amount=money,bettime=timezone.now())
                    betobj.save()
                    
                    member.money -= Decimal(money)
                    member.save()
                    
                    
                    moneychange = MoneyChangeLog(userid=request.user,gameid=gameobj,issueid=issueobj,amount=-money,changetype=1,changetime=timezone.now())
                    moneychange.save()
                    
                    retjson['result'] = 1
                    retstr += data + ';'
                    
                    msg += ruleobj.ruledesc + ':' + str(money) +'; '
                    
                except Exception,e:
                    print '**********',traceback.print_exc()
                    retjson['result'] = 0
                    retstr = u'下注失败'
            else:
                break;
        
        if msg != '':
            bmsg = BetMessage(userid=request.user,gameid=gameobj,issueid=issueobj,msg=msg,bettime=timezone.now())
            bmsg.save()
        retjson['message'] = retstr
        return JsonResponse(retjson)
            
    else:
        return JsonResponse(retjson)

# 游戏结算
def settlement(request):
    jsResponse = {}
    if request.method == 'GET':
        gameid = request.GET.get('gameid')
        issuNO = request.GET.get('issueNO')
        try:
            gameid = int(gameid)
            issuNO = int(issuNO)
            gameobj = Game.objects.get(gameid=gameid)
            issueobj = GameIssue.objects.get(gameid=gameobj,issueNO=issuNO)
        except Exception,e:
            print '--------1', traceback.print_exc()
            jsResponse['result'] = 0
            jsResponse['message'] = u'请求参数错误'
            return JsonResponse(jsResponse)
        if issueobj.isSettled:
            jsResponse['result'] = 0
            jsResponse['message'] = u'本期已经结算'
            return JsonResponse(jsResponse)
        try:
            cursor = connection.cursor()
            ret = 0
            cursor.callproc('sp_gamesettle',(gameid,issuNO,ret))
        except Exception,e:
            print '--------2',traceback.print_exc()
            jsResponse['result'] = 0
            jsResponse['message'] = u'结算出错'
            return JsonResponse(jsResponse)
        else:
            jsResponse['result'] = 0
            jsResponse['message'] = u'结算完成'
            return JsonResponse(jsResponse)
    else:
        jsResponse['result'] = 0
        jsResponse['message'] = u'错误请求'
        return JsonResponse(jsResponse)
    
def getbetmsg(request):
    retjson = {}
    retjson['result'] = 0
    try:
        if request.method == 'GET':
            msgid = 0
            msgidstr = request.GET.get('chatid')
            gameid = request.GET.get('gameid')
            issueno = request.GET.get('issueNO')
            
            try:
                issueobj = GameIssue.objects.get(issueNO=int(issueno))
            except Exception,e:
                return JsonResponse(retjson)
            else:
                issueid = issueobj.issueid
            try:
                msgid = int(msgidstr)
                gameid = int(gameid)
                issueid = int(issueid)
            except Exception,e:
                msglist = BetMessage.objects.order_by('-betmsgid')[:10]
            else:
                cursor = connection.cursor()
                data = 0
                if msgid == 0:
                    sql = 'select auth_user.username as username,BetMessage.betmsgid as betid,BetMessage.msg as msg,BetMessage.bettime  as bettime from BetMessage inner join auth_user on BetMessage.userid = auth_user.id where BetMessage.gameid=%d and BetMessage.issueid=%d order by betmsgid desc'%(gameid,issueid)
                    cursor.execute(sql)
                    data = cursor.fetchall()
                else:
                    sql = 'select auth_user.username as username,BetMessage.betmsgid as betid,BetMessage.msg as msg,BetMessage.bettime  as bettime from BetMessage inner join auth_user on BetMessage.userid = auth_user.id where BetMessage.gameid=%d and BetMessage.issueid=%d and BetMessage.betmsgid>%d order by betmsgid desc'%(gameid,issueid,msgid)
                    cursor.execute(sql)
                    data = cursor.fetchall()
                retjson['result'] = 1
                retjson['msglist'] = data
    except Exception,e:
        print '----------0',traceback.print_exc()
    return JsonResponse(retjson)

#def getwinlose(request):
#    pass

def getannounce(request):
    retjson = {}
    retjson['result'] = 0
    if request.method == 'GET':
        antype = int(request.GET.get('type'))
        
        try:
            msg = Announce.objects.get(antype=antype)
        except Exception,e:
            pass
        else:
            retjson['result'] = 1
            retjson['content'] = msg.content

    return JsonResponse(retjson)
    
    
def getcurrentbalance(request):
    retjs = {}
    retjs['result'] = 0
    if request.method == 'GET' and request.user.is_authenticated():
        gameid = request.GET.get('gameid')
        issueno = request.GET.get('issueNO')
        try:
            issue = GameIssue.objects.get(issueNO=issueno)
            
            sql = 'select sum(amount) from MoneyChangeLog where gameid=%d and issueid=%d and userid=%d'%(int(gameid),int(issue.issueid),request.user.id)
            cursor = connection.cursor()
            ret = cursor.execute(sql)
            retjs['result'] = 1
            if ret == 0:
                retjs['balance'] = 0
            else:
                retjs['balance'] = cursor.fetchone()[0]
                
        except Exception,e:
            print '------------',traceback.print_exc()
            retjs['balance'] = 0
        
    return JsonResponse(retjs)


def bethistory(request):
    if request.user.is_authenticated():
        betloglist = BetLog.objects.filter(userid=request.user).order_by('-bettime')[:88]
        member = Member.objects.get(userid=request.user)
        return render(request,'Lottery/bethistory.html',{'member':member,'bethistory':betloglist})
    else:
        return HttpResponseRedirect('/')
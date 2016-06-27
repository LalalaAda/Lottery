# -*- coding:utf-8 -*-
import re
import datetime
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate,logout,login
from django.http import JsonResponse,HttpResponse,HttpResponseRedirect
from django.core.exceptions import ObjectDoesNotExist
from django.db import connection
from Lottery.models import Member,LoginLog,Agent,Game,GameRules,GameIssue,BetLog,MoneyChangeLog
import traceback

import hashlib
import base64

# Create your views here.

# /
def index(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect('/for28cqadmin/home/')
    else:
        return render(request,'Agency/login.html')

# /register/
def register(request):
    if request.method == 'POST':
        registerResult = {}
        registerResult['result'] = 0
        username = request.POST.get('username')
        pwd = request.POST.get('password')
        
        pattern = re.compile(r'[A-Za-z0-9]{6,13}')
        match = pattern.match(username)
        if match is None:
            registerResult['result'] = 0
            registerResult['message'] = u'用户名不符合要求'
            return JsonResponse(registerResult)
            
        try:
            agent = Agent.objects.get(userid=request.user)
        except ObjectDoesNotExist:
            bDataValid = False
        except Exception,e:
            print traceback.print_exc()
            bDataValid = False
        
        bDataValid = True
        
        if len(username) <6:
            bDataValid = False
            registerResult['message'] = u'用户名长度小于6'
        if len(pwd) <6:
            bDataValid = False
            registerResult['message'] = u'密码长度小于6'
            
        try:
            user = User.objects.get(username=username)
        except ObjectDoesNotExist:
            pass
        except Exception,e:
            registerReuslt['message'] = u'系统繁忙'
        else:
            registerResult['message'] = u'用户名已存在'
        
        if not bDataValid:
            return JsonResponse(registerResult)
        
        #注册
        try:
            user = User.objects.create_user(username=username,password=pwd)
            member = Member(userid=user,agentid=agent)
            member.save()
        except Exception,e:
            print '==========',traceback.print_exc()
            registerResult['message'] = u'添加失败,请稍候再试!'
        else:
            
            msg = u'添加会员成功! 用户名:%s,密码:%s'%(username,pwd)
            registerResult['result'] = 1
            registerResult['message'] = msg
            
#            user = authenticate(username=username,password=pwd)
#            login(request,user)
        
        return JsonResponse(registerResult)
    else:
        return HttpResponseRedirect('/for28cqadmin/')

# /addagent/
def addagent(request):
    if request.method =='POST' and request.user.is_authenticated():
        retjson = {}
        agentname = request.POST.get('agentname')
        agentpwd = request.POST.get('agentpwd')
        taken = request.POST.get('take')
#        agentcode = request.POST.get('agentcode')
        try:
            ftaken = float(taken)
            if ftaken <0 or ftaken >1:
                retjson['result'] = 0
                retjson['message'] = u'占成比例错误'
                return JsonResponse(retjson)    
        except Exception,e:
            retjson['result'] = 0
            retjson['message'] = u'占成比例输入错误'
            return JsonResponse(retjson)
        
        pattern = re.compile(r'[A-Za-z0-9]{6,13}')
        match = pattern.match(agentname)
        if match is None:
            retjson['result'] = 0
            retjson['message'] = u'用户名不符合要求'
            return JsonResponse(retjson)
#        try:
#            checkagent = Agent.objects.get(agentcode=agentcode)
#        except ObjectDoesNotExist:
#            pass
#        except Exception,e:
#            print '===========',traceback.print_exc()
#        else:
#            if checkagent.count() >0:
#                retjson['result'] = 0
#                retjson['message'] = u'代理商编码已存在'
#                return JsonResponse(retjson)
        try:
            agent = Agent.objects.get(userid=request.user)
        except Exception,e:
            retjson['result'] = 0
            retjson['message'] = u'你不是代理商,无添加代理商权限'
            print '=======',traceback.print_exc()
            return JsonResponse(retjson)
        try:
            user = User.objects.get(username=agentname)
        except ObjectDoesNotExist:
            try:
                user = User.objects.create_user(username=agentname,password=agentpwd)
                member = Member(userid=user,agentid=agent)
                member.save()
                newagent = Agent(userid=user,agentcode=agentname,ratio=ftaken,takeupdate=datetime.datetime.now())
                newagent.save()
                
                msg = u'代理商添加成功,账号:'+unicode(agentname) + u', 密码:'+unicode(agentpwd) + u' ;' 
                
                retjson['result'] = 1
                retjson['message'] = msg
                return JsonResponse(retjson)
            except Exception,e:
                retjson['result'] = 0
                retjson['message'] = u'添加代理失败,系统维护中'
                print '----------',traceback.print_exc()
                return JsonResponse(retjson)
        else:
            try:
                isAlreadAgent = Agent.objects.get(userid=user)
            except ObjectDoesNotExist:
                hisAgent = Member.objects.get(userid=user)
                if hisAgent is not None:
                    if hisAgent != agent:
                        retjson['result'] = 0
                        retjson['message'] = u'此用户不是由你推荐,无权添加'
                        return JsonResponse(retjson)
                    else:
                        newAgent = Agent(userid=user,agentcode=agentcode,ratio=ftaken,takeupdate=datetime.datetime.now())
                        newAgent.save()
                        retjson['result'] = 1
                        retjson['message'] = u'添加代理成功'        
                        return JsonResponse(retjson)
                else:
                    try:
                        member = Member.objects.get(userid=user)
                        member.agentid = agent
                        member.save()
                        
                        newAgent = Agent(userid=user,agentcode=agentcode,ratio=ftaken,takeupdate=datetime.datetime.now())
                        newAgent.save()
                        
                        retjson['result'] = 1
                        retjson['message'] = u'添加代理成功'        
                        return JsonResponse(retjson)
                    except Exception,e:
                        print '==========',traceback.print_exc()
                        retjson['result'] = 0
                        retjson['message'] = u'添加代理失败'        
                        return JsonResponse(retjson)
            else:
                retjson['result'] = 0
                retjson['message'] = u'该用户已经是代理商'
                return JsonResponse(retjson)
    else:
        print 'not authenticated'
        return HttpResponseRedirect('/for28cqadmin/')

# /login/
def agentlogin(request):
    if request.method == 'POST':
        uname = request.POST.get('username')
        pwd = request.POST.get('password')
        loginInfo = {}
        user = authenticate(username=uname,password=pwd)
        if user is not None:
            if user.is_active:
                try:
                    agent = Agent.objects.get(userid=user)
                except ObjectDoesNotExist:
                    loginInfo['result'] = 1
                    loginInfo['message'] = u'登录失败：代理商账号不存在'
                except Exception,e:
                    loginInfo['result'] = 1
                    loginInfo['message'] = u'登录失败'
                else:
                    login(request,user)
                    return HttpResponseRedirect('/for28cqadmin/home/')
            else:
                loginInfo['result'] = 1
                loginInfo['message'] = u'登录失败:账号不可用'
        else:
            loginInfo['result'] = 1
            loginInfo['message'] = u'登录失败:用户名或密码错误'
        
        return render(request,'Agency/login.html',{'loginInfo':loginInfo})
    else:
        return HttpResponseRedirect('/for28cqadmin/')

# /home/
def home(request):
    if request.user.is_authenticated():
        cursor = connection.cursor()
        info = {}
        try:
            member = Member.objects.get(userid=request.user)
            info['memberCount'] = Member.objects.all().count() - Agent.objects.all().count()
            agent = Agent.objects.get(userid=request.user)
            sql = 'select agentid from Agent where userid in (select userid from Member where agentid=%d)'%agent.agentid
            ret = cursor.execute(sql)
            info['proxyCount'] = ret

            sql = 'select sum(money) from Member where agentid=%d'%agent.agentid
            ret = cursor.execute(sql)
            if ret is None:
                info['proxyTotal'] = 0
            else:
                info['proxyTotal'] = cursor.fetchone()[0]
            
            sql = 'select distinct userid from LoginLog where logintime > DATE_SUB(curdate(), INTERVAL 7 DAY);'
            ret = cursor.execute(sql)
            #record = cursor.fetchone()
            info['dau'] = ret
            
            sql = 'select sum(money) from Member where agentid=%d'%(agent.agentid)
            ret = cursor.execute(sql)
            record = cursor.fetchone()
            if record is None:
                info['MemberTotal'] = 0
            else:
                info['MemberTotal'] = record[0]
                
            # win list
            sql = 'select sum(amount) as winMount,auth_user.username from MoneyChangeLog inner join auth_user on MoneyChangeLog.userid = auth_user.id where changetype=1 and changetime >= current_date() and changetime <  DATE_ADD(current_date(),INTERVAL 1 DAY) group by userid order by winMount desc limit 10'
            ret = cursor.execute(sql)
            records = cursor.fetchall()
            winlist = []
            
            for item in records:
                _tmp = {}
                _tmp['winMount'] = item[0]
                _tmp['username'] = item[1]
                winlist.append(_tmp)
            
            #lost list
            sql = 'select sum(amount) as winMount,auth_user.username as username from MoneyChangeLog inner join auth_user on MoneyChangeLog.userid = auth_user.id where changetype=1 and changetime >= current_date() and changetime <  DATE_ADD(current_date(),INTERVAL 1 DAY) group by userid order by winMount asc limit 10'
            ret = cursor.execute(sql)
            records = cursor.fetchall()
            lostlist = []
            for item in records:
                _tmp = {}
                _tmp['winMount'] = item[0]
                _tmp['username'] = item[1]
                lostlist.append(_tmp)
            
            shaobj = hashlib.sha1(request.user.username)
            shortcode = shaobj.hexdigest()[-7:]
            info['weburl'] = 'http://www.28cq.com/'+shortcode
            
        except Exception,e:
            print '-----------------', traceback.print_exc()
            logout(request)
            return HttpResponseRedirect('/for28cqadmin/')
        
        
        return render(request,'Agency/home-t.html',{'member':member,'info':info,'winlist':winlist,'lostlist':lostlist})
    else:
        return HttpResponseRedirect('/for28cqadmin/')

# /exit/
def agentlogout(request):
    if request.user.is_authenticated():
        logout(request)
        
    return HttpResponseRedirect('/for28cqadmin/')

# /members/
def membermanage(request):
    if request.user.is_authenticated():
        try:
            agent = Agent.objects.get(userid=request.user)
        except Exception,e:
            print 'e------------',traceback.print_exc()
            logout(request)
            return HttpResponseRedirect('/for28cqadmin/')
        
        ulist = Member.objects.filter(agentid=agent)
        for item in ulist:
            item.userid.id = item.userid.id + 16000
        
        return  render(request,'Agency/membermanage-t.html',{'ulist':ulist})
    else:
        return HttpResponseRedirect('/for28cqadmin/')

# /gamerecords/
def gamerecord(request):
    if request.user.is_authenticated():
        return render(request,'Agency/gamerecord-t.html')
    else:
        return HttpResponseRedirect('/for28cqadmin/')

# /agents/
def agentmanage(request):
    if request.user.is_authenticated():
        agent = Agent.objects.get(userid=request.user)
        members = Member.objects.filter(agentid=agent)
        myself = Member.objects.get(userid=request.user)
        userlist = []
        for item in members:
            userlist.append(item.userid)
        agentlist = Agent.objects.filter(userid__in=userlist)
        
        for item in agentlist:
            item.userid.id = item.userid.id + 16000
        
        return render(request,'Agency/agentmanage-t.html',{'aglist':agentlist,'member':myself,'myagent':agent})
    else:
        return HttpResponseRedirect('/for28cqadmin/')

# /reports/
def reports(request):
    if request.user.is_authenticated():
        return render(request,'Agency/agentreport-t.html')
    else:
        return HttpResponseRedirect('/for28cqadmin/')

# /charge/
def charge(request):
    if request.user.is_authenticated():
        return render(request,'Agency/charge-t.html')
    else:
        return HttpResponseRedirect('/for28cqadmin/')

# /logs/
def showlogs(request):
    if request.user.is_authenticated():
        return render(request,'Agency/logs-t.html')
    else:
        return HttpResponseRedirect('/for28cqadmin/')
    
# /getuserinfo/
def getuserinfo(request):
    retjson = {}
    retjson['result'] =0
    if request.method == 'GET' and request.user.is_authenticated():
        try:
            userid = int(request.GET.get('userid')) - 16000
            checktype = request.GET.get('type') # 0:表示查询会员； 1:表示查询代理
            checktype = int(checktype)
            try:
                if checktype == 0:
                    try:
                        user = User.objects.get(id=userid)
                        member = Member.objects.get(userid=user)
                        retjson['result'] =1
                        retjson['username'] = user.username
                        retjson['money'] = member.money
                        retjson['userid'] = user.id + 16000
                    except Exception,e:
                        if checktype == 0:
                            retjson['msg'] = u'用户不存在,请检查'
                        elif checktype == 1:
                            retjson['msg'] = u'代理不存在,请检查'
                
                if checktype == 1:
                    try:
                        user = User.objects.get(id=userid)
                        member = Member.objects.get(userid=user)
                        agent = Agent.objects.get(userid=user)
                        retjson['result'] =1
                        retjson['username'] = user.username
                        retjson['money'] = member.money
                        retjson['userid'] = user.id + 16000
                    except Exception,e:
                        if checktype == 0:
                            retjson['msg'] = u'用户不存在,请检查'
                        elif checktype == 1:
                            retjson['msg'] = u'代理不存在,请检查'
                
            except Exception,e:
                print '------------',traceback.print_exc()
                if checktype == 0:
                    retjson['msg'] = u'用户不存在,请检查'
                if checktype == 1:
                    retjson['msg'] = u'代理不存在,请检查'
        except Exception,e:
            print '-----------------',traceback.print_exc()
        
    return JsonResponse(retjson)

def modifymember(request):
    if request.method == 'POST' and request.user.is_authenticated():
        retjson = {}
        retjson['result'] = 0
        statusVal = request.POST.get('status')
        username = request.POST.get('username')
        
        try:
            user = User.objects.get(username=username)
        except Exception,e:
            retjson['msg'] = u'用户不存在'
        
        if int(statusVal) == 1: #可用
            user.is_active = True
            user.save()
            retjson['result'] = 1
        elif int(statusVal) == 2: #禁用
            user.is_active = False
            user.save()
            retjson['result'] = 1
        else:
            retjson['msg'] = u'修改状态错误'
        
        return JsonResponse(retjson)
    else:
        return HttpResponseRedirect('/for28cqadmin/')

def mbchargemoney(request):
    if request.method == 'POST' and request.user.is_authenticated():
        try:
            uname = request.POST.get('username')
            chargemount = int(request.POST.get('chargemount'))
            tp = int(request.POST.get('type'))
            
            retjs = {}
            retjs['result'] = 0
            retjs['optype'] = tp
            
            if chargemount <=0:
                retjs['msg'] = u'充值金额不能小于0'
            try:
                targetuser = User.objects.get(username=uname)
                targetmember = Member.objects.get(userid=targetuser)
            except ObjectDoesNotExist:
                retjs['msg'] = u'用户不存在'
            except Exception,e:
                retjs['msg'] = u'服务器繁忙'
            try:
                agent = Agent.objects.get(userid=request.user)
            except ObjectDoesNotExist:
                retjs['msg'] = u'无权上下分'
            except Exception,e:
                retjs['msg'] = u'服务器繁忙'
            if targetmember.agentid != agent:
                retjs['msg'] = u'无权上下分'
            
            try:
                mymember = Member.objects.get(userid=request.user)
            except ObjectDoesNotExist:
                retjs['msg'] = u'服务器繁忙'
            except Exception,e:
                retjs['msg'] = u'服务器繁忙'
            
            print 'typeof tp:',type(tp), ' value:',tp
            
            if tp == 1: #上分
                if mymember.money < chargemount:
                    retjs['msg'] = u'余额不足'
                    return JsonResponse(retjs)
                targetmember.money = targetmember.money + chargemount
                mymember.money = mymember.money - chargemount
                targetmember.save()
                mymember.save()
                
                #写入日志
                #....
                moneylog = MoneyChangeLog(userid=targetuser,amount=chargemount,changetype=2)
                moneylog.save()
                moneylog = MoneyChangeLog(userid=request.user,amount=-chargemount,changetype=2)
                moneylog.save()
                
                retjs['reuslt'] = 1
                retjs['msg'] = u'上分成功'
                
            elif tp == 2: #下分
                if chargemount > targetmember.money:
                    retjs['msg'] = u'玩家金币不足,请重新输入下分数量'
                    return JsonResponse(retjs)
                    
                targetmember.money = targetmember.money - chargemount
                mymember.money = mymember.money + chargemount
                targetmember.save()
                mymember.save()
                
                #写入日志
                #....
                moneylog = MoneyChangeLog(userid=targetuser,issueid=1,amount=-chargemount,changetype=2)
                moneylog.save()
                moneylog = MoneyChangeLog(userid=request.user,issueid=1,amount=chargemount,changetype=2)
                moneylog.save()
                
                retjs['reuslt'] = 1
                retjs['msg'] = u'下分成功'
            
            return JsonResponse(retjs)
        except Exception,e:
            print '--------------0',traceback.print_exc()
    else:
        return HttpResponseRedirect('/for28cqadmin/')
    
def agchargemoney(request):
    if request.method == 'POST' and request.user.is_authenticated():
        try:
            uname = request.POST.get('username')
            chargemount = int(request.POST.get('chargemount'))
            tp = int(request.POST.get('type'))
            
            retjs = {}
            retjs['result'] = 0
            retjs['optype'] = tp
            
            if chargemount <= 0:
                retjs['msg'] = u'充值金额不能小于0'
                return JsonResponse(retjs)
            try:    
                myagent = Agent.objects.get(userid=request.user)
                mymember = Member.objects.get(userid=request.user)
            except Exception,e:
                retjs['msg'] = u'无上下分权限'
                return JsonResponse(retjs)
            
            try:
                targetuser = User.objects.get(username=uname)
                targetmember = Member.objects.get(userid=targetuser)
            except Exception,e:
                retjs['msg'] = u'用户不存在'
                return JsonResponse(retjs)
            
            targetagent = targetmember.agentid
            
            if targetagent != myagent:
                retjs['msg'] = u'无上下分权限'
                return JsonResponse(retjs)
            
            if tp == 1: #上分
                if mymember.money < chargemount:
                    retjs['msg'] = u'上分失败,余额不足1'
                    return JsonResponse(retjs)
                targetmember.money = targetmember.money + chargemount
                mymember.money = mymember.money - chargemount
                targetmember.save()
                mymember.save()
                
                retjs['result'] = 1
                retjs['msg'] = u'上分成功'
                #写入日志
                moneylog = MoneyChangeLog(userid=targetuser,amount=chargemount,changetype=2)
                moneylog.save()
                moneylog = MoneyChangeLog(userid=request.user,amount=-chargemount,changetype=2)
                moneylog.save()
                
                return JsonResponse(retjs)
            elif tp == 2: #下分
                if targetmember.money < chargemount:
                    retjs['msg'] = u'下分失败,余额不足1'
                    return JsonResponse(retjs)
                targetmember.money = targetmember.money - chargemount
                mymember.money = mymember.money + chargemount
                targetmember.save()
                mymember.save()
                
                retjs['result'] = 1
                retjs['msg'] = u'下分成功'
                
                #写入日志
                moneylog = MoneyChangeLog(userid=targetuser,amount=-chargemount,changetype=2)
                moneylog.save()
                moneylog = MoneyChangeLog(userid=request.user,amount=chargemount,changetype=2)
                moneylog.save()
            return JsonResponse(retjs)
        except Exception,e:
            return JsonResponse({'result':0,'msg':'服务器繁忙,请稍候再试'})
    else:
        return HttpResponseRedirect('/for28cqadmin/')
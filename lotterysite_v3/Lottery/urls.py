# -*- coding:utf-8 -*-
from django.conf.urls import include, url
from . import views

urlpatterns = [    
	url(r'^$',views.index),
    url(r'^p[a-zA-Z0-9]{7}/$',views.index),
    url(r'^login/$',views.loginuser),
    url(r'^register/$',views.register),
    url(r'^logout/$',views.logoutuser),
    url(r'^checkname/(?P<username>\w{6,30})',views.checkname),
    url(r'^test/$',views.bstest),
    
    url(r'^getdata/$',views.getdata),
    url(r'^testbase/$',views.mytest),
	url(r'^testindex/$',views.testIndex),
	url(r'^testrule/$',views.testrule),
    
    url(r'^checklogin/$',views.checklogin), #检查用户是否登录
    url(r'^ckresult/$',views.checkResult),  #查询开奖结果是否公布
    url(r'^getruleid/$',views.getrules),
    
    url(r'^bet/$',views.gamebet),           #下注
    url(r'^getnamo/$',views.getnamemoney),  #获取用户名和余额
    url(r'^getchat',views.getbetmsg),       #获取下注信息
    
    url(r'^settlegame/$',views.settlement), #结算
    
    #url(r'^getwinlose/$',views.getwinlose), #获取输赢情况
    
    url(r'^getann/$',views.getannounce),    #获取提示信息
    
    url(r'^news/(?P<newsid>\d)/$',views.showNews),
    
    url(r'getcurwl/$',views.getcurrentbalance),#获取当局盈利
    
    url(r'^bethistory/$',views.bethistory), #下注历史
]

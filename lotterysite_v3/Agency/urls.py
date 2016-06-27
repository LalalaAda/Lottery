# -*- coding:utf-8 -*-
from django.conf.urls import include, url

from . import views

urlpatterns = [
    url(r'^$',views.index),
    
    url(r'^register/$',views.register),
    url(r'^addagent/$',views.addagent),
    url(r'^login/$',views.agentlogin),
    url(r'^home/$',views.home),
    url(r'^exit/$',views.agentlogout),
    url(r'^members/$',views.membermanage),
    url(r'^gamerecords/$',views.gamerecord),
    url(r'^agents/$',views.agentmanage),
    url(r'^reports/$',views.reports),
    url(r'^charge/$',views.charge),
    url(r'^logs/$',views.showlogs),
    
    url(r'^getuserinfo/$',views.getuserinfo),
    
    url('^alertmember/$',views.modifymember),   #修改状态
    
    url('^membercharge/$',views.mbchargemoney),         #会员上下分
    url('^agentcharge/$',views.agchargemoney),          #代理上下分
]
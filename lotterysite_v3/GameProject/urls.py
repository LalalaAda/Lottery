# -*- coding:utf-8 -*-
from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    # Examples:
    # url(r'^$', 'GameProject.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^for28cqadmin/',include('Agency.urls')),
    url(r'^for28cqadministrator/', include(admin.site.urls)),
    url(r'^',include('Lottery.urls')),
]

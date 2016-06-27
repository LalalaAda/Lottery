# -*- coding:utf-8 -*-

from django.contrib import admin
from Lottery import models
from django.contrib.auth.models import User


class GameRuleInline(admin.StackedInline):
    model = models.GameRules
    extra = 3

class MemberAdmin(admin.ModelAdmin):
    list_display = ('userid','agentid','money','status')
    
class GameAdmin(admin.ModelAdmin):
    list_display = ('gamename','begintime','endtime','status')
    inlines = [GameRuleInline]

class BetLogAdmin(admin.ModelAdmin):
    list_display = ('userid', 'gameid', 'issueid','ruleid','amount','bettime')

class MoneyChangeLogAdmin(admin.ModelAdmin):
    list_display = ('userid','gameid','issueid','amount','changetype','changetime')

class LoginLogAdmin(admin.ModelAdmin):
    list_display = ('userid','loginip','logintime')

class AgentAdmin(admin.ModelAdmin):
    list_display = ('userid','agentcode','chargemount','exchange','status','takeupdate')

class GameIssueAdmin(admin.ModelAdmin):
    list_display = ('gameid','issueNO','result','resultdetail','lotterytime','bopened','isSettled')
    
class AnnounceAdmin(admin.ModelAdmin):
    list_display = ('antype','content','createdate')
    
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title','createdate')
    
# Register your models here.
admin.site.register(models.Member,MemberAdmin)
admin.site.register(models.LoginLog,LoginLogAdmin)
#admin.site.register(models.Game)
#admin.site.register(models.GameRules)
admin.site.register(models.GameIssue,GameIssueAdmin)
#admin.site.register(models.LotteryResult)
admin.site.register(models.BetLog,BetLogAdmin)
admin.site.register(models.MoneyChangeLog,MoneyChangeLogAdmin)
admin.site.register(models.Agent,AgentAdmin)
admin.site.register(models.Game,GameAdmin)
admin.site.register(models.Announce,AnnounceAdmin)
admin.site.register(models.News,NewsAdmin)
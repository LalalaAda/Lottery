# -*- coding: utf-8 -*-

from django import forms

class RegisterForm(forms.Form):
    regusername = forms.CharField(label='用户名',min_length=6,max_length=30,required=True)
    regpassword = forms.CharField(label="密码",min_length=6,max_length=30,widget=forms.PasswordInput,required=True)
    regagent = forms.CharField(label="推荐人",min_length=6,max_length=15,required=True)
	
class LoginForm(forms.Form):
    logusername = forms.CharField(label='用户名',min_length=6,max_length=30,required=True)
    logpassword = forms.CharField(label="密     码",min_length=6,max_length=30,widget=forms.PasswordInput,required=True)
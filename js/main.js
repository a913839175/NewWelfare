(function (win) {
    //判断是否微信客户端
    var isWeiXin = function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    };
    //获取URL参数
    var getUrlparam = function(name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.atob(window.location.search.substr(1)).match(reg);
        if (r != null) {
            return decodeURI(r[2]);
        }
        return null;
    };
    //取回cookie
    var getCookie = function(c_name){
        if (document.cookie.length>0){
            c_start=document.cookie.indexOf(c_name + "=");
            if (c_start!=-1){ 
                c_start=c_start + c_name.length+1;
                c_end = document.cookie.indexOf(";",c_start);
                if (c_end==-1) 
                c_end=document.cookie.length;
                return unescape(document.cookie.substring(c_start,c_end));
            } 
         }
        return "";
    };
    var PAGENAME = "weipaidai";
    var PAGEWEB = "java_http_web";
    var encodeStr = function(STR, TOKEN) {
        return JSEncrypt(STR, PAGENAME, TOKEN, PAGEWEB);
    };
    var App = function(){
        var phone = getUrlparam("phone");
        var unionId = getUrlparam("unionId");
        var APPURL = "https://www.weipaidai.com/public/h5/NewWelfare";
        var redisURL = "https://www.weipaidai.com/api/redis";
        var msURL = 'https://www.weipaidai.com/api/ms';
        var WXURL = "https://www.weipaidai.com/api/jssdk";
        var usname = getUrlparam("name")||"微拍贷";
        var usimgurl = getUrlparam("imgurl")||APPURL+"/images/wxtx.png";
        var inviteCode = getUrlparam("inviteCode")||"";
        var userdata = getCookie("userinfo")?JSON.parse(getCookie("userinfo")):"";
        return {
            /**
             * 初始化入口
             * 
             */
            init:function(){
                if(isWeiXin()){
                    if (typeof WeixinJSBridge == "undefined") {
                        if (document.addEventListener) {
                            document.addEventListener('WeixinJSBridgeReady', App.onBridgeReady(), false);
                        } else if (document.attachEvent) {
                            document.attachEvent('WeixinJSBridgeReady', App.onBridgeReady());
                            document.attachEvent('onWeixinJSBridgeReady', App.onBridgeReady());
                        }
                    } else {
                        App.onBridgeReady();
                    }                          
                }
                if(phone){
                    $('.reg-phone').val(phone);
                }            
                App.bindEvent();        
            },
            //判断是否授权过登录
            getStorge:function(_APPID){
                if(!userdata){
                    var link = encodeURIComponent(APPURL+'/oauth.html?fromUrl='+location.href);
                    window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+_APPID+"&redirect_uri="+link+"&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect";
                }else{
                    App.name = userdata.nickname;
                    App.imgurl = userdata.headImgUrl;
                    App.unionId = userdata.unionId;
                    // console.log(App.unionId);       
                }
                // alert("----用户信息:"+JSON.stringify(userdata));
            },
            onBridgeReady:function() {
                var postData = {};
                var now_url = window.location.href;
                postData.url = now_url;
                $.ajax({
                    url: WXURL + "/jssdk",
                    type: "get",
                    dataType: "json",
                    data:{
                        url:now_url
                    },
                    success: function(data) {
                        // console.log(data);
                        App.getStorge(data.appId);                     
                        wx.config({
                            appId: data.appId,
                            timestamp: data.timestamp,
                            nonceStr: data.nonceStr,
                            signature: data.signature,
                            jsApiList: ["onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ","onMenuShareWeibo"]
                        }); 
                        wx.ready(function(){
                            //分享配置信息
                            var share_title, share_desc, share_link, share_img;
                                share_title = "【微拍贷】送你188元红包大礼，银行存管更安全!";
                                share_desc = "现在注册即送188元新手礼包、0.1%加息红包和100微币！还有更多活动福利等你来领哦~";
                                share_link = encodeURI(APPURL+"/share.html?name="+usname+"&imgurl="+usimgurl+"&inviteCode="+inviteCode);
                                share_img = APPURL+"/images/success01.png";
                            console.log(share_link);
                            wx.onMenuShareAppMessage({
                                title: share_title,
                                desc: share_desc,
                                link: share_link,
                                imgUrl: share_img,
                                success: function() {},
                                cancel: function() {
                                    
                                }
                            });
                            wx.onMenuShareTimeline({
                                title: share_title,
                                link: share_link,
                                imgUrl: share_img,
                                success: function() {},
                                cancel: function() {}
                            });
                            wx.onMenuShareQQ({
                                title: share_title,
                                desc: share_desc,
                                link: share_link,
                                imgUrl: share_img,
                                success: function() {},
                                cancel: function() {}
                            });
                            wx.onMenuShareWeibo({
                                title: share_title,
                                desc: share_desc,
                                link: share_link,
                                imgUrl: share_img,
                                success: function() {},
                                cancel: function() {}
                            });
                        });                   
                    },
                    error: function(data) {
                       App.toast("系统连接超时");
                    }
                });
            },
            checkPhone:function(phone){
                var reg = /^((\+86)|(86)|0)?(1[3|4|5|7|8|9])\d{9}$/;                     
                return reg.test(phone); 
            },
            showLoading:function(callback){
                $('body').loading({
                    loadingWidth:120,
                    title:'请稍等！',
                    name:'loading',
                    discription:'',
                    direction:'column',
                    type:'origin',
                    originDivWidth:40,
                    originDivHeight:40,
                    originWidth:6,
                    originHeight:6,
                    smallLoading:false,
                    loadingMaskBg:'rgba(0,0,0,0.2)'
                });
                setTimeout(function(){ 
                    if(callback) {callback();}
                },1000);         
            },
            /**
             * 手机端toast提示
             * @param {String} msg
             * @param {String} time
            */
            toast:function(msg,callback,time){
                var t = time || 2000;
                if($('.util-toast').length >= 1){
                    return false;
                }
                $('body').append('<div class="util-toast">' + msg + '</div>');
                setTimeout(function() {
                    $('.util-toast').remove();
                    $('.reg-button').removeClass('btn-disable').removeAttr("disabled");
                    if(callback) {callback();}                
                }, t);
            },
            //事件绑定
            bindEvent:function(){
                $('.reg-button').on('click',function(){
                    var phone = $('.reg-phone').val();
                    var smsCode = $('.reg-code').val();
                    var password = $.md5($('.reg-psw').val());
                    $(this).addClass('btn-disable').attr("disabled","true");
                    if(!phone){
                        App.toast("请输入手机号码!");
                        return false;                        
                    }else if(!App.checkPhone(phone)){
                        App.toast("手机号码有误，请重填!");                     
                        return false;
                    }else if(!smsCode){
                        App.toast("请输入手机验证码!");
                        return false; 
                    }else{                       
                        var postData = JSON.stringify({
                            'u1': phone,
                            'u2': unionId,
                            'u3': "B0001",
                            'u4': password,
                            'u5': "A0001",
                            'u6': smsCode,
                            'u7': inviteCode,
                            'u8': returnCitySN["cip"]
                        });
                        var subtime = new Date().getTime()+"";
                        var params = {
                            userVerify: encodeStr(postData, subtime),
                            unixkey: subtime
                        };
                        App.showLoading(function(){
                            $.ajax({
                                url:redisURL+'/channel/weChat/userReg',
                                type: "post",
                                dataType: "json",
                                data: params,
                                success: function(data) {
                                    removeLoading('loading');   
                                    if(data.returnCode == 1){
                                        App.toast(data.returnMsg,function(){
                                            window.location.href = "success.html";
                                        });  
                                    }else{
                                       App.toast(data.returnMsg); 
                                    }                                                                                                  
                                },
                                error: function(data) {
                                    removeLoading('loading');
                                    App.toast(JSON.stringify(data));
                                }
                            });  
                        });                                                
                    }                                     
                });
                $('.code-button').on('click',function(){
                    var mobile = $('.reg-phone').val();
                    var $this = $(".code-button");
                    var s = 120; 
                    $(this).addClass('btn-disable').attr("disabled","true");
                    if(!mobile){
                        App.toast("请输入手机号码!",function(){
                            $this.removeClass('btn-disable').removeAttr("disabled");
                        });
                        return false;  
                    }else if(!App.checkPhone(mobile)){
                        App.toast("手机号码有误，请重填!",function(){
                            $this.removeClass('btn-disable').removeAttr("disabled");
                        });                     
                        return false;
                    }else{
                        $.post(msURL+"/message/sendText", {
                            mobile: mobile,
                            action: "regist"
                        }, function(data) {
                            // console.log(data);
                            if (data.result == 1) {
                                $this.html("等待<b>60</b>秒");
                                var ping = window.setInterval(function() {
                                    var s = parseInt($(".code-button b").html());
                                    if (s == 0) {
                                        $this.html("重发验证码");
                                        $this.removeClass('btn-disable').removeAttr("disabled");
                                        clearInterval(ping);
                                        return false;
                                    } else {
                                        $(".code-button b").html(s - 1);
                                    }
                                }, 1000);
                            } else {
                                App.toast("发送验证码失败！");
                            }
                        });
                    }         
                });
            }
        };
    }();
    window.onload = function(){
        App.init();
    };
})(window);
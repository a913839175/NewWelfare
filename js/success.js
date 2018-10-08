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
        var r = window.location.search.substr(1).match(reg);
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
    var App = function(){
        var userdata = getCookie("userinfo")?JSON.parse(getCookie("userinfo")):"";
        var APPURL = "https://www.weipaidai.com/public/h5/NewWelfare";
        var redisURL = "https://www.weipaidai.com/api/redis";
        var WXURL = "https://www.weipaidai.com/api/jssdk";
        var usname = getUrlparam("name")||"微拍贷";
        var usimgurl = getUrlparam("imgurl")||APPURL+"/images/wxtx.png";
        var inviteCode = getUrlparam("inviteCode")||"";
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
                        console.log(data);
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
                                share_title = "【微拍贷】送你188元红包大礼，银行存管更安全利!";
                                share_desc = "现在注册即送188元新手礼包、0.1%加息红包和100微币！还有更多活动福利等你来领哦~";
                                share_link = encodeURI(APPURL+"/share.html?name="+usname+"&imgurl="+usimgurl+"&inviteCode="+inviteCode);
                                share_img = APPURL+"/images/success01.png";
                            wx.onMenuShareAppMessage({
                                title: share_title,
                                desc: share_desc,
                                link: share_link,
                                imgUrl: share_img,
                                success: function() {},
                                cancel: function() {}
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
            /**
             * 手机端toast提示
             * @param {String} msg
             * @param {String} time
            */
            toast:function(msg,time){
                var t = time || 1500;
                if($('.util-toast').length >= 1){
                    return false;
                }
                $('body').append('<div class="util-toast">' + msg + '</div>');
                setTimeout(function() {
                    $('.util-toast').remove();
                }, t);
            },
            //事件绑定
            bindEvent:function(){

            }
        };
    }();
    window.onload = function(){
        App.init();
    };
})(window);
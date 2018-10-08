(function (doc, win) {
    var d = window.document.createElement('div');
        d.style.width = '1rem';
        d.style.display = 'none';
    var head = window.document.getElementsByTagName('head')[0];
        head.appendChild(d);
    var defaultFontSize = parseFloat(window.getComputedStyle(d, null).getPropertyValue('width'));
    var docEl = doc.documentElement,
        designWidth = 750,
        rem2px = 100,
        resizeEvt = 'onorientationchange' in window ? 'onorientationchange' : 'resize',       
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            if (!navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i) && clientWidth > 1024) {
                docEl.style.fontSize = '100px';
            }else{
                docEl.style.fontSize = (clientWidth / (designWidth / rem2px) / defaultFontSize * 100)+"%";
            }
        };

    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);
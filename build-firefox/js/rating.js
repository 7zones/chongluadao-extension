/*!

=========================================================
* Chong Lua Dao
=========================================================

* Product Page: https://chongluadao.vn/
* Copyright 2021 https://chongluadao.vn/
* Coded by ChongLuaDao

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=4)}({4:function(e,t){$(document).ready(()=>{$("#stars li").on("mouseover",()=>{const e=parseInt($(this).data("value"),10);$(this).parent().children("li.star").each(t=>{t<e?$(this).addClass("hover"):$(this).removeClass("hover")})}).on("mouseout",(function(){$(this).parent().children("li.star").each(()=>{$(this).removeClass("hover")})})),$(".success-box").hide(),$("#stars li").on("click",(function(){const e=parseInt($(this).data("value"),10),t=$(this).parent().children("li.star");for(let e=0;e<t.length;e++)$(t[e]).removeClass("selected");for(let n=0;n<e;n++)$(t[n]).addClass("selected");const r=parseInt($("#stars li.selected").last().data("value"),10);n(r)}))});const n=e=>{$.post("https://api.chongluadao.vn/v1/initSession",{app:"chrome-extension",secret:"xxeaWiCnkx"},(function(t){if(t&&t.token){const{token:n}=t;browser.tabs.query({currentWindow:!0,active:!0},([t])=>{$.ajax({type:"POST",url:"https://api.chongluadao.vn/v1/rate",headers:{Authorization:"Bearer "+n},dataType:"json",data:{rating:e,url:t.url},success:()=>{browser.storage.local.set({cachedUrl:t.url,cacheTime:Date.now()}),$("#stars li").off(),$(".success-box").show(),$(".success-box").fadeIn(200),$(".success-box div.text-message").html("<span>Cảm ơn bạn đã đánh giá</span>")}})})}}))}}});
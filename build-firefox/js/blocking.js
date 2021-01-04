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
!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([,function(e,t){let n={};const o=browser.runtime.connect({name:"REDIRECT_PORT_NAME"}),r=browser.runtime.connect({name:"CLOSE_TAB_PORT_NAME"});document.getElementById("close").addEventListener("click",()=>(r.postMessage({close_tab:!0}),!1)),document.getElementById("allow").addEventListener("click",()=>{localStorage.setItem("whiteList","true"),o.postMessage({redirect:n.site})});const c=window.location.hash.substring(1);try{n=JSON.parse(decodeURI(c)),n.v2||(n.v2=!0,window.location.hash=JSON.stringify(n));const e=document.createElement("link");e.type="image/x-icon",e.rel="icon",e.href=n.favicon,document.head.appendChild(e);let t,o=document.getElementsByClassName("sitename");for(let e=0;e<o.length;++e)o[e].textContent=n.site;o=document.getElementsByClassName("sitetitle");for(let e=0;e<o.length;++e)o[e].textContent=n.title;o=document.getElementsByClassName("sitematch");for(let e=0;e<o.length;++e)t||(t=n.match.replace(/\\([.+?^${}()|[\]\\]{1})/g,"$1").replace(/[.]{1}[*]{1}/g,"*")),o[e].textContent=t;document.title=`${document.title} ${n.title}`,n.lenient&&(document.getElementById("access").style.display="inline-block",document.getElementById("access").addEventListener("click",()=>{browser.runtime.sendMessage({access:n.match,access_seconds:300,site:n.site})}))}catch(e){console.trace(e)}}]);
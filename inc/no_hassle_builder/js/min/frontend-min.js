!function(view){if(window.MSInputMethodContext&&document.documentMode||-1!==navigator.appVersion.indexOf("MSIE 10")){var constructors=["SVGSVGElement","SVGGElement"],dummy=document.createElement("dummy");if(!constructors[0]in view)return!1;if(Object.defineProperty){var innerHTMLPropDesc={get:function(){return dummy.innerHTML="",Array.prototype.slice.call(this.childNodes).forEach(function(node,index){dummy.appendChild(node.cloneNode(!0))}),dummy.innerHTML},set:function(content){var self=this,allNodes=Array.prototype.slice.call(self.childNodes),fn=function(to,node){if(1!==node.nodeType)return!1;var newNode=document.createElementNS("http://www.w3.org/2000/svg",node.nodeName);Array.prototype.slice.call(node.attributes).forEach(function(attribute){newNode.setAttribute(attribute.name,attribute.value)}),"TEXT"===node.nodeName&&(newNode.textContent=node.innerHTML),to.appendChild(newNode),node.childNodes.length&&Array.prototype.slice.call(node.childNodes).forEach(function(node,index){fn(newNode,node)})};content=content.replace(/<(\w+)([^<]+?)\/>/,"<$1$2></$1>"),allNodes.forEach(function(node,index){node.parentNode.removeChild(node)}),dummy.innerHTML=content,Array.prototype.slice.call(dummy.childNodes).forEach(function(node){fn(self,node)})},enumerable:!0,configurable:!0};try{constructors.forEach(function(constructor,index){Object.defineProperty(window[constructor].prototype,"innerHTML",innerHTMLPropDesc)})}catch(ex){}}else Object.prototype.__defineGetter__&&constructors.forEach(function(constructor,index){window[constructor].prototype.__defineSetter__("innerHTML",innerHTMLPropDesc.set),window[constructor].prototype.__defineGetter__("innerHTML",innerHTMLPropDesc.get)})}}(window),function(){function CustomEvent(event,params){params=params||{bubbles:!1,cancelable:!1,detail:void 0};var evt=document.createEvent("CustomEvent");return evt.initCustomEvent(event,params.bubbles,params.cancelable,params.detail),evt}(window.MSInputMethodContext&&document.documentMode||-1!==navigator.appVersion.indexOf("MSIE 10"))&&(CustomEvent.prototype=window.Event.prototype,window.CustomEvent=CustomEvent)}(),window.nhbIsRTL=function(){var html=document.querySelector("html");return"rtl"===html.getAttribute("dir")},window._nhbFixRowWidth=function(element){var dataWidth=element.getAttribute("data-width");element.parentNode.classList.contains("nhb-col")?window._nhbRowReset(element):"undefined"!=typeof dataWidth&&dataWidth?"full-width"===dataWidth?window._nhbFullWidthRow(element):window._nhbFullWidthRow(element,!0):window._nhbRowReset(element),clearTimeout(window._nhbFixRowWidthsResizeTrigger),window._nhbFixRowWidthsResizeTrigger=setTimeout(function(){window._nhbFixRowWidthsResizeNoReTrigger=!0,window.dispatchEvent(new CustomEvent("resize"))},1)},window._nhbRowReset=function(element){element.style.width="",element.style.position="",element.style.maxWidth="",window.nhbIsRTL()?element.style.right="":element.style.left="",element.style.webkitTransform="",element.style.mozTransform="",element.style.msTransform="",element.style.transform=""},window._nhbFullWidthRow=function(element,fitToContentWidth){var origWebkitTransform=element.style.webkitTransform,origMozTransform=element.style.mozTransform,origMSTransform=element.style.msTransform,origTransform=element.style.transform;element.style.width="auto",element.style.position="relative",element.style.maxWidth="none",element.style.webkitTransform="",element.style.mozTransform="",element.style.msTransform="",element.style.transform="",element.style.marginLeft="0px",element.style.marginRight="0px","undefined"!=typeof fitToContentWidth&&fitToContentWidth&&(element.style.paddingLeft="",element.style.paddingRight=""),element.parentNode.style.overflowX="visible",window.nhbIsRTL()?element.style.right="0px":element.style.left="0px";var bodyWidth=document.body.clientWidth,rect=element.getBoundingClientRect(),bodyRect=document.body.getBoundingClientRect();if(element.style.width=bodyWidth+"px",element.style.position="relative",element.style.maxWidth=bodyWidth+"px",window.nhbIsRTL()?element.style.right=rect.right-bodyRect.right+"px":element.style.left=-rect.left+bodyRect.left+"px",element.style.webkitTransform=origWebkitTransform,element.style.mozTransform=origMozTransform,element.style.msTransform=origMSTransform,element.style.transform=origTransform,"undefined"!=typeof fitToContentWidth&&fitToContentWidth){var paddingLeft,paddingRight,actualWidth=rect.width;window.nhbIsRTL()?(paddingLeft=bodyWidth-actualWidth+rect.right-bodyRect.right,paddingRight=-rect.right+bodyRect.right):(paddingLeft=rect.left-bodyRect.left,paddingRight=bodyWidth-actualWidth-rect.left+bodyRect.left),actualWidth>bodyWidth&&(paddingLeft=0,paddingRight=0),element.style.paddingLeft=paddingLeft+"px",element.style.paddingRight=paddingRight+"px"}},window.nhbFixRowWidths=function(){var fullRows=document.querySelectorAll(".nhb-row[data-width]");Array.prototype.forEach.call(fullRows,function(el){window._nhbFixRowWidth(el)})},window.addEventListener("resize",function(){return window._nhbFixRowWidthsResizeNoReTrigger?void delete window._nhbFixRowWidthsResizeNoReTrigger:void window.nhbFixRowWidths()}),window.nhbFixRowWidths(),window.addEventListener("DOMContentLoaded",function(){setTimeout(function(){window.nhbFixRowWidths()},1)}),function(){window.nhbInitAllPretext=function(){if("undefined"!=typeof hljs){var codes=document.querySelectorAll(".nhb-main-wrapper pre");Array.prototype.forEach.call(codes,function(el){hljs.highlightBlock(el)})}},window.addEventListener("DOMContentLoaded",window.nhbInitAllPretext)}(),window.nhbTabsRefreshActiveTab=function(tabsElement){var radio=tabsElement.querySelector(".nhb-tab-state:checked"),id=radio.getAttribute("id"),tabs=tabsElement.querySelector(".nhb-tab-tabs ");if(tabs){var activeTab=tabs.querySelector(".nhb-tab-active");activeTab&&activeTab.classList.remove("nhb-tab-active"),activeTab=tabs.querySelector('[for="'+id+'"]'),activeTab&&activeTab.classList.add("nhb-tab-active")}},function(){window.addEventListener("DOMContentLoaded",function(){document.addEventListener("change",function(ev){ev.target&&ev.target.classList.contains("nhb-tab-state")&&window.nhbTabsRefreshActiveTab(ev.target.parentNode)})}),document.addEventListener("DOMContentLoaded",function(){var elements=document.querySelectorAll('[data-ce-tag="tabs"]');Array.prototype.forEach.call(elements,function(el){el=el.querySelector('[data-ce-tag="tab"]'),el&&el.classList.add("nhb-tab-active")})})}();
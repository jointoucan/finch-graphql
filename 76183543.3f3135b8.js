(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{127:function(e,t,r){"use strict";r.r(t),t.default=r.p+"assets/images/process-graph-af3bb7cb5f5d1ed50679efa0fc59bcee.svg"},73:function(e,t,r){"use strict";r.r(t),r.d(t,"frontMatter",(function(){return s})),r.d(t,"metadata",(function(){return i})),r.d(t,"toc",(function(){return c})),r.d(t,"default",(function(){return u}));var n=r(3),o=r(7),a=(r(0),r(86)),s={id:"how-it-works",title:"How it works"},i={unversionedId:"how-it-works",id:"how-it-works",isDocsHomePage:!1,title:"How it works",description:"GraphQL over messages",source:"@site/docs/how-it-works.md",slug:"/how-it-works",permalink:"/finch-graphql/docs/how-it-works",editUrl:"https://github.com/jointoucan/finch-graphql/edit/master/packages/finch-docs/docs/how-it-works.md",version:"current",sidebar:"someSidebar",next:{title:"API Setup",permalink:"/finch-graphql/docs/"}},c=[{value:"GraphQL over messages",id:"graphql-over-messages",children:[]}],p={toc:c};function u(e){var t=e.components,s=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(n.a)({},p,s,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h2",{id:"graphql-over-messages"},"GraphQL over messages"),Object(a.b)("p",null,"Most implementations of GraphQL use ",Object(a.b)("strong",{parentName:"p"},"HTTP")," to pass queries and mutations to a server, but using HTTP is not required with GraphQL. GraphQL can be boiled down to a schema for contracts between two processes. Finch GraphQL uses GraphQL in a way were it passes queries and mutations over the browser built in ",Object(a.b)("strong",{parentName:"p"},Object(a.b)("a",{parentName:"strong",href:"https://developer.chrome.com/docs/extensions/mv3/messaging/"},"messaging passing"))," APIs for browser extensions. You can think of this implementation of GraphQL almost exactly the same as you would have on a server but the protocol to which you talk to the API is different. "),Object(a.b)("p",null,"Below is attached a simple graph of where Finch GraphQL runs in relation to your other scripts in an extension."),Object(a.b)("p",null,Object(a.b)("img",{alt:"Finch GraphQL Process Graph",src:r(127).default})))}u.isMDXComponent=!0},86:function(e,t,r){"use strict";r.d(t,"a",(function(){return l})),r.d(t,"b",(function(){return m}));var n=r(0),o=r.n(n);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function s(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?s(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):s(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var p=o.a.createContext({}),u=function(e){var t=o.a.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},l=function(e){var t=u(e.components);return o.a.createElement(p.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},h=o.a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,a=e.originalType,s=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),l=u(r),h=n,m=l["".concat(s,".").concat(h)]||l[h]||f[h]||a;return r?o.a.createElement(m,i(i({ref:t},p),{},{components:r})):o.a.createElement(m,i({ref:t},p))}));function m(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var a=r.length,s=new Array(a);s[0]=h;var i={};for(var c in t)hasOwnProperty.call(t,c)&&(i[c]=t[c]);i.originalType=e,i.mdxType="string"==typeof e?e:n,s[1]=i;for(var p=2;p<a;p++)s[p]=r[p];return o.a.createElement.apply(null,s)}return o.a.createElement.apply(null,r)}h.displayName="MDXCreateElement"}}]);
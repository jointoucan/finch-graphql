(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{81:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return s})),n.d(t,"metadata",(function(){return c})),n.d(t,"toc",(function(){return i})),n.d(t,"default",(function(){return l}));var r=n(3),o=n(7),a=(n(0),n(88)),s={id:"typescript-codegen",title:"Typescript codegen"},c={unversionedId:"typescript-codegen",id:"typescript-codegen",isDocsHomePage:!1,title:"Typescript codegen",description:"What is codegen?",source:"@site/docs/typescript-codegen.md",sourceDirName:".",slug:"/typescript-codegen",permalink:"/finch-graphql/docs/typescript-codegen",editUrl:"https://github.com/jointoucan/finch-graphql/edit/master/packages/finch-docs/docs/typescript-codegen.md",version:"current",frontMatter:{id:"typescript-codegen",title:"Typescript codegen"},sidebar:"someSidebar",previous:{title:"Finch GraphiQL Devtools",permalink:"/finch-graphql/docs/devtools"},next:{title:"Finch v2.x",permalink:"/finch-graphql/docs/finch-v2"}},i=[{value:"What is codegen?",id:"what-is-codegen",children:[]},{value:"Setup",id:"setup",children:[]},{value:"Generating custom hooks",id:"generating-custom-hooks",children:[]}],p={toc:i};function l(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},p,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h3",{id:"what-is-codegen"},"What is codegen?"),Object(a.b)("p",null,"Codegen is a way to generate types from a graphQL schema. Typescript is the most common types that would be generated in javascript, and is what kind of codegen that Finch GraphQL supports. The code generator we support is ",Object(a.b)("a",{parentName:"p",href:"https://www.graphql-code-generator.com"},"GraphQL Code Generator")," and in this page we will go over how to get this setup in your project while using Finch GraphQL."),Object(a.b)("h3",{id:"setup"},"Setup"),Object(a.b)("p",null,"GraphQL Code generator has some good documentation on how to ",Object(a.b)("a",{parentName:"p",href:"https://www.graphql-code-generator.com/docs/getting-started/installation"},"get the library setup"),". Once you have the cli setup you can skip ahead to getting this to work with Finch GraphQL."),Object(a.b)("h4",{id:"working-with-schemas"},"Working with Schemas"),Object(a.b)("p",null,"To load in the schema from Finch it is best to use the schemas source files, if it is in the same repo. For example you may want to store all of schema files in a directory like ",Object(a.b)("inlineCode",{parentName:"p"},"./src/typeDefs/schemas"),". In this example there is a ",Object(a.b)("inlineCode",{parentName:"p"},"index.ts")," file in the root of typeDefs to export out the array of schemas from the schema folder."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-typescript"},"// ./src/typeDefs/index.ts\nimport gql from 'graphql-tag';\nimport browserSchema from './schemas/browser';\nimport otherSchema from './schemas/other';\n\nexport const typeDefs = [browserSchema, otherSchema];\n")),Object(a.b)("p",null,"This makes it so the schemas are consumable by the ",Object(a.b)("strong",{parentName:"p"},"FinchApi")," ",Object(a.b)("em",{parentName:"p"},"typeDefs")," option and we can also point codegen towards the schema files. Also in this example the schema files looks something like this."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-typescript"},"// ./src/typeDefs/schema/browser.ts\nimport gql from 'graphql-tag';\n\nexport default gql`\n  type Manifest {\n    name: String!\n    version: String!\n    description: String!\n  }\n\n  type Browser {\n    manifest: Manifest\n  }\n\n  extend type Query {\n    browser: Browser\n  }\n`;\n")),Object(a.b)("p",null,"Now you are setup to point your GraphQL Code Generator config towards these schema files, we would also recommend storing your GraphQL documents that consume the API somewhere close to these schema files as well."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-yaml"},"schema: ./src/typeDefs/schemas/*.ts # Schema files with default exports\ndocuments: ./src/graphql/*.graphql # GraphQL files for clients to consume\ngenerates:\n  ./src/schema/background.ts: # Path to file to be generated\n    plugins: # Common typescript plugins\n      - typescript\n      - typescript-operations\n      - typescript-document-nodes\n")),Object(a.b)("p",null,"This should generate a file with all the types of the GraphQL queries. Now you should be able to pass the types generated from these queries into ",Object(a.b)("strong",{parentName:"p"},"queryApi")," and ",Object(a.b)("strong",{parentName:"p"},"useQuery")," hooks."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-typescript"},"import {\n  GetBrowserManifestQuery,\n  GetBrowserManifestQueryVariables,\n  GetBrowserManifestDocument,\n} from './schema/background';\n\n// Fully typed response!\nconst resp = queryApi<\n  GetBrowserManifestQuery,\n  GetBrowserManifestQueryVariables\n>(GetBrowserManifestDocument);\n\n// in React component, and useMutation is supported too\nconst { data } = useQuery<\n  GetBrowserManifestQuery,\n  GetBrowserManifestQueryVariables\n>(GetBrowserManifestDocument);\n")),Object(a.b)("h3",{id:"generating-custom-hooks"},"Generating custom hooks"),Object(a.b)("p",null,"Finch GraphQL has a module for GraphQL Code Generator that will take these types and generate custom hooks that are hooked into Finch GraphQL. To install the module."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-shell"},"npm install finch-typescript-codegen --save\n")),Object(a.b)("p",null,"The update your configuration to look something like this"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-diff"},"generates:\n  ./src/schema/background.ts:\n    plugins:\n      - typescript\n      - typescript-operations\n--    - typescript-document-nodes\n++    - finch-typescript-codegen\n")),Object(a.b)("blockquote",null,Object(a.b)("p",{parentName:"blockquote"},Object(a.b)("em",{parentName:"p"},"typescript-document-nodes are now generated by finch-graphql-codegen"))),Object(a.b)("p",null,"This should run and now your generated file should contain hooks that make it so you do not need to import so many types."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-typescript"},"import { useGetBrowserManifestQuery } from './schema/background';\n\n// in React component, fully typed!\nconst { data } = useGetBrowserManifestQuery();\n")))}l.isMDXComponent=!0},88:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return d}));var r=n(0),o=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var p=o.a.createContext({}),l=function(e){var t=o.a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},u=function(e){var t=l(e.components);return o.a.createElement(p.Provider,{value:t},e.children)},h={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},m=o.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),u=l(n),m=r,d=u["".concat(s,".").concat(m)]||u[m]||h[m]||a;return n?o.a.createElement(d,c(c({ref:t},p),{},{components:n})):o.a.createElement(d,c({ref:t},p))}));function d(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,s=new Array(a);s[0]=m;var c={};for(var i in t)hasOwnProperty.call(t,i)&&(c[i]=t[i]);c.originalType=e,c.mdxType="string"==typeof e?e:r,s[1]=c;for(var p=2;p<a;p++)s[p]=n[p];return o.a.createElement.apply(null,s)}return o.a.createElement.apply(null,n)}m.displayName="MDXCreateElement"}}]);
# Finch GraphQL Devtools

Finch GraphQL devtools is an extension that will allow you to query a [Finch GraphQL](https://github.com/jointoucan/finch-graphql) background process to be able to debug the schema, query, and mutate data in the extension.

![Screen Shot](./app/images/screen-shot.png)

## Install

    $ yarn

## Development

    yarn dev chrome
    yarn dev firefox
    yarn dev opera
    yarn dev edge

## Build

    yarn build chrome
    yarn build firefox
    yarn build opera
    yarn build edge

## Environment

The build tool also defines a variable named `process.env.NODE_ENV` in your scripts.

## Built with

- [webextension-toolbox](https://github.com/HaNdTriX/webextension-toolbox)

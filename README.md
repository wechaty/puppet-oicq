# WECHATY PUPPET OICQ (基于[OICQ](https://github.com/takayama-lily/oicq)项目的QQ机器人)

[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-brightgreen.svg)](https://wechaty.js.org)

[![NPM Version](https://badge.fury.io/js/wechaty-puppet-lark.svg)](https://badge.fury.io/js/wechaty-puppet-lark)
[![npm (tag)](https://img.shields.io/npm/v/wechaty-puppet-lark/next.svg)](https://www.npmjs.com/package/wechaty-puppet-lark?activeTab=versions)

## 运行方法

### 配置系统环境变量

1. `WECHATY_PUPPET_OICQ_QQ`：要登录的QQ号

### 安装依赖

将代码clone到本地，执行`npm install`

### 运行示例代码

`npm run start`

按照提示完成扫码完成后按下回车，即可运行示例机器人

## Getting Started with Wechaty

```sh
export WECHATY_PUPPET=wechaty-puppet-lark
npm start
```

Learn more for building your first Wechaty bot at <https://github.com/wechaty/wechaty-getting-started>

## 项目介绍

“开源软件供应链点亮计划-暑期2021”（以下简称 暑期2021）是由中科院软件所与 openEuler 社区共同举办的一项面向高校学生的暑期活动，旨在鼓励在校学生积极参与开源软件的开发维护，促进国内优秀开源软件社区的蓬勃发展。

根据项目的难易程度和完成情况，参与者还可获取“开源软件供应链点亮计划-暑期2021”活动奖金和奖杯。

官网：<https://summer.iscas.ac.cn>

## Wechaty

[Wechaty](https://wechaty.js.org) 是一个开源聊天机器人框架SDK，具有高度封装、高可用的特性，支持NodeJs, Python, Go 和Java 等多语言版本。在过去的5年中，服务了数万名开发者，收获了 Github 的 9600 Star。同时配置了完整的DevOps体系并持续按照Apache 的方式管理技术社区。

## 项目名称

开发支持 QQ 聊天软件的 [Wechaty Puppet Provider](https://wechaty.js.org/docs/puppet-providers/) 模块

## 背景介绍

Wechaty 社区目前已经支持微信、Whatsapp、企业微信、飞书等常见流行即时通讯工具，并且能够通过多语言 SDK （比如 Python Wechaty） 进行调用。

QQ 是国内和微信并列的两大聊天软件。我们在本次 Summer 2021 的项目中，Wechaty 希望可以实现对 QQ Chatbot 的支持。通过 Wechaty Puppet 的接口，可以将 QQ 进行 RPA 封装，使其成为 `wechaty-puppet-qq`  供 Wechaty 开发者方便接入 QQ 平台，使其成为 Wechaty 可以使用的社区生态模块。

## 需求介绍

使用 <https://github.com/wechaty/wechaty-puppet-mock> 项目作为模版，参考社区其他的 [Wechaty Puppet Provider](https://wechaty.js.org/docs/puppet-providers/) 代码模块，对 QQ 进行规划、RPA选型、原型测试，和最终的代码封装。

这里有一个专门讲解如何开发 Wechaty Puppet Provider 的 workshop 视频，它以 `wechaty-puppet-official-account` 作为例子，做了从0到1的入门讲解：[Wechaty Workshop for Puppet Makers: How to make a Puppet for Wechaty](https://wechaty.js.org/2020/08/05/wechaty-puppet-maker/)。通过观看这一个小时的视频，应该可以系统性的了解如何完成构建一个 Wechaty Puppet Provider 模块。

在初期开发中，能够实现文本消息的接收和发送，即可完成原型验证 POC 。

还可以参考以下链接：

1. TypeScript Puppet Official Documentation: <https://wechaty.github.io/wechaty-puppet/typedoc/classes/puppet.html>
1. Wechaty Puppet Specification: <https://wechaty.js.org/docs/specs/puppet>
1. <https://github.com/wechaty/wechaty-puppet-mock>

## 导师联系方式

1. [李佳芮](https://wechaty.js.org/contributors/lijiarui/): Wechaty co-creator, Founder & CEO of Juzi.BOT (rui@chatie.io)
1. [李卓桓](https://wechaty.js.org/contributors/huan)：Wechaty creator, Tencent TVP of Chatbot (huan@chatie.io)

## 项目产出目标

1. 每日代码 commit
1. 每周提交一份 report （回复本 issue）
1. 每两周一次在线会议
1. 发布 Git Repo `wechaty-puppet-qq`
1. 可以通过 Wechaty 加载 wechaty-puppet-qq 模块，并通过 QQ RPA 底层，实现文本消息的收发功能
1. 提供一个 `examples/ding-dong-bot.ts` ，完成“接收到文字消息`ding`时，自动回复消息`dong`\"的功能
1. 配置 GitHub Actions 实现自动化测试* （可选）

## 项目技术栈

1. TypeScript programming language
2. Git
3. [RPA](https://wechaty.js.org/docs/explainations//rpa)

## Links

- <https://github.com/wechaty/wishlist/issues/9>",

## 相关链接

- [Wechaty](https://wechaty.js.org/v/zh/)
- [Express](https://www.runoob.com/nodejs/nodejs-express-framework.html)
- [TypeScripts中文手册](https://www.tslang.cn/docs/handbook/basic-types.html)

## History

### main

### v0.1

- ES Modules support

### v0.0.1

- [OSPP 2021 Project started](https://github.com/wechaty/summer/issues/81)

## Author

[@naivebird](https://wechaty.js.org/contributors/anaivebird/)

## Copyright & License

- Code & Docs © 2021-2021 Fairy FAN and Wechaty Contributors
- Code released under the Apache-2.0 License
- Docs released under Creative Commons

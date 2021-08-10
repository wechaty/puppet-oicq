/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */

import {
  ContactPayload,
  FileBox,
  FriendshipPayload,
  ImageType,
  MessagePayload,
  Puppet,
  PuppetOptions,
  RoomInvitationPayload,
  RoomMemberPayload,
  RoomPayload,
  UrlLinkPayload,
  MiniProgramPayload,
  MessageType,
  log,
  FriendshipAddOptions,
}                           from 'wechaty-puppet'

import {
  VERSION,
}                                   from './config'


export type PuppetOICQOptions = PuppetOptions

class PuppetOICQ extends Puppet {
  contactSelfName(_name: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  contactSelfQRCode(): Promise<string> {
    throw new Error('Method not implemented.')
  }
  contactSelfSignature(_signature: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  tagContactAdd(_tagId: string, _contactId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  tagContactDelete(_tagId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  tagContactList(contactId: string): Promise<string[]>
  tagContactList(): Promise<string[]>
  tagContactList(_contactId?: any): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  tagContactRemove(_tagId: string, _contactId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  contactAlias(contactId: string): Promise<string>
  contactAlias(contactId: string, alias: string): Promise<void>
  contactAlias(_contactId: any, _alias?: any): Promise<void> | Promise<string> {
    throw new Error('Method not implemented.')
  }
  contactAvatar(contactId: string): Promise<FileBox>
  contactAvatar(contactId: string, file: FileBox): Promise<void>
  contactAvatar(_contactId: any, _file?: any): Promise<void> | Promise<FileBox> {
    throw new Error('Method not implemented.')
  }
  contactPhone(_contactId: string, _phoneList: string[]): Promise<void> {
    throw new Error('Method not implemented.')
  }
  contactCorporationRemark(_contactId: string, _corporationRemark: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  contactDescription(_contactId: string, _description: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  contactList(): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  protected contactRawPayload(_contactId: string): Promise<any> {
    throw new Error('Method not implemented.')
  }
  protected contactRawPayloadParser(_rawPayload: any): Promise<ContactPayload> {
    throw new Error('Method not implemented.')
  }
  friendshipAccept(_friendshipId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  friendshipAdd(_contactId: string, _option?: FriendshipAddOptions): Promise<void> {
    throw new Error('Method not implemented.')
  }
  friendshipSearchPhone(_phone: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  friendshipSearchWeixin(_weixin: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  protected friendshipRawPayload(_friendshipId: string): Promise<any> {
    throw new Error('Method not implemented.')
  }
  protected friendshipRawPayloadParser(_rawPayload: any): Promise<FriendshipPayload> {
    throw new Error('Method not implemented.')
  }
  conversationReadMark(_conversationId: string, _hasRead?: boolean): Promise<boolean | void> {
    throw new Error('Method not implemented.')
  }
  messageContact(_messageId: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  messageFile(_messageId: string): Promise<FileBox> {
    throw new Error('Method not implemented.')
  }
  messageImage(_messageId: string, _imageType: ImageType): Promise<FileBox> {
    throw new Error('Method not implemented.')
  }
  messageMiniProgram(_messageId: string): Promise<MiniProgramPayload> {
    throw new Error('Method not implemented.')
  }
  messageUrl(_messageId: string): Promise<UrlLinkPayload> {
    throw new Error('Method not implemented.')
  }
  messageForward(_conversationId: string, _messageId: string): Promise<string | void> {
    throw new Error('Method not implemented.')
  }
  messageRecall(_messageId: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  roomInvitationAccept(_roomInvitationId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  protected roomInvitationRawPayload(_roomInvitationId: string): Promise<any> {
    throw new Error('Method not implemented.')
  }
  protected roomInvitationRawPayloadParser(_rawPayload: any): Promise<RoomInvitationPayload> {
    throw new Error('Method not implemented.')
  }
  roomAdd(_roomId: string, _contactId: string, _inviteOnly?: boolean): Promise<void> {
    throw new Error('Method not implemented.')
  }
  roomAvatar(_roomId: string): Promise<FileBox> {
    throw new Error('Method not implemented.')
  }
  roomCreate(_contactIdList: string[], _topic?: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  roomDel(_roomId: string, _contactId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  roomList(): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  roomQRCode(_roomId: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  roomQuit(_roomId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  roomTopic(roomId: string): Promise<string>
  roomTopic(roomId: string, topic: string): Promise<void>
  roomTopic(_roomId: any, _topic?: any): Promise<void> | Promise<string> {
    throw new Error('Method not implemented.')
  }
  protected roomRawPayload(_roomId: string): Promise<any> {
    throw new Error('Method not implemented.')
  }
  protected roomRawPayloadParser(_rawPayload: any): Promise<RoomPayload> {
    throw new Error('Method not implemented.')
  }
  roomAnnounce(roomId: string): Promise<string>
  roomAnnounce(roomId: string, text: string): Promise<void>
  roomAnnounce(_roomId: any, _text?: any): Promise<void> | Promise<string> {
    throw new Error('Method not implemented.')
  }
  roomMemberList(_roomId: string): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  protected roomMemberRawPayload(_roomId: string, _contactId: string): Promise<any> {
    throw new Error('Method not implemented.')
  }
  protected roomMemberRawPayloadParser(_rawPayload: any): Promise<RoomMemberPayload> {
    throw new Error('Method not implemented.')
  }

  static override readonly VERSION = VERSION

  private loopTimer?: NodeJS.Timer
  private oicq_client?: any
  private QQNumber?: String
  messageStore = {} as any

  constructor (
    public override options: PuppetOICQOptions = {},
  ) {
    super(options)
    log.verbose('PuppetOICQ', 'constructor()')
  }


  override async start (): Promise<void> {
    log.verbose('PuppetOICQ', 'start()')

    if (this.state.on()) {
      log.warn('PuppetOICQ', 'start() is called on a ON puppet. await ready(on) and return.')
      await this.state.ready('on')
      return
    }

    this.state.on('pending')
    
    this.QQNumber = '1962099319'
    this.oicq_client = require("oicq").createClient(this.QQNumber)

    this.oicq_client.on("system.login.qrcode", function (this:any) {
      process.stdin.once("data", () => {
        console.log('enter pressed, try to login')
        this.login()
        //this.emit('login', { contactId: this.QQNumber || '' })
      })
    })
    .on("system.login.error", function (this:any, error: any) {
      if (error.code < 0)
        this.login()
    })
    .login()

    let that = this;
    this.oicq_client.on("message", function (oicqMessage: any) {
      that.messageStore[oicqMessage.message_id] = oicqMessage
      console.log(oicqMessage.message_id)
      that.emit('message', {messageId: oicqMessage.message_id})
      // /*if (e.raw_message === "hello") {
      //   e.reply("hello world")
      // }*/
    })
    

    this.state.on(true)
  }

  override async stop (): Promise<void> {
    log.verbose('PuppetOICQ', 'stop()')

    if (this.state.off()) {
      log.warn('PuppetOICQ', 'stop() is called on a OFF puppet. await ready(off) and return.')
      await this.state.ready('off')
      return
    }

    this.state.off('pending')

    if (this.loopTimer) {
      clearInterval(this.loopTimer)
    }


    if (this.logonoff()) {
      await this.logout()
    }

    // await some tasks...
    this.state.off(true)
  }

  override login (contactId: string): Promise<void> {
    log.verbose('PuppetOICQ', 'login()')
    return super.login(contactId)
  }

  override async logout (): Promise<void> {
    log.verbose('PuppetOICQ', 'logout()')

    if (!this.id) {
      throw new Error('logout before login?')
    }

    this.emit('logout', { contactId: this.id, data: 'test' }) // before we will throw above by logonoff() when this.user===undefined
    this.id = undefined

    // TODO: do the logout job
  }

  override ding (data?: string): void {
    log.silly('PuppetOICQ', 'ding(%s)', data || '')
    setTimeout(() => this.emit('dong', { data: data || '' }), 1000)
  }

  override async messageRawPayloadParser (rawPayload: any): Promise<MessagePayload> {
    // OICQ qq message Payload -> Puppet message payload

    const payload: MessagePayload = {
      fromId: rawPayload.sender.user_id,
      id: rawPayload.message_id,
      text: rawPayload.raw_message,
      timestamp: Date.now(),
      toId: rawPayload.user_id,
      type: MessageType.Text, // TODO: need to change if message type changed to image and so on
    }
    return payload
  }
  override async messageRawPayload (oicqMessageId: string): Promise<any> {
    return this.messageStore[oicqMessageId]
  }


  async messageSendText(conversationId: string, text: string, _mentionIdList?: string[]): Promise<string | void> {
    await this.oicq_client.sendPrivateMsg(conversationId, text)
  }

  async messageSendContact(_conversationId: string, _contactId: string): Promise<string | void> {
    throw new Error('Method not implemented.')
  }
  async messageSendFile(_conversationId: string, _file: FileBox): Promise<string | void> {
    throw new Error('Method not implemented.')
  }
  async messageSendMiniProgram(_conversationId: string, _miniProgramPayload: MiniProgramPayload): Promise<string | void> {
    throw new Error('Method not implemented.')
  }
  async messageSendUrl(_conversationId: string, _urlLinkPayload: UrlLinkPayload): Promise<string | void> {
    throw new Error('Method not implemented.')
  }



}

export { PuppetOICQ }
export default PuppetOICQ
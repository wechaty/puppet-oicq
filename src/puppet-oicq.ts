/* eslint-disable no-console */
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
  ContactGender,
  ContactType,
}                           from 'wechaty-puppet'

import oicq from 'oicq'

import {
  VERSION,
}                           from './config.js'

export type PuppetOICQOptions = PuppetOptions & {
  qq?: number
}

class PuppetOICQ extends Puppet {

  static override readonly VERSION = VERSION

  #oicqClient?: oicq.Client
  protected get oicqClient (): oicq.Client {
    if (!this.#oicqClient) {
      throw new Error('no oicq client!')
    }
    return this.#oicqClient
  }

  private messageStore : { [id: string]: oicq.MessageEventData}
  private contactStore : { [id: string]: any }
  private roomStore : { [id: string]: any }
  private loginCheckInterval: any
  qq: number

  constructor (
    public override options: PuppetOICQOptions = {},
  ) {
    super(options)
    log.verbose('PuppetOICQ', 'constructor("%s")', JSON.stringify(options))

    if (options.qq) {
      this.qq = options.qq
    } else {
      const qq = parseInt(process.env['WECHATY_PUPPET_OICQ_QQ'] || '')
      if (isNaN(qq)) {
        throw new Error('WECHATY_PUPPET_OICQ_QQ should be set a qq number')
      }
      this.qq = qq
    }

    this.messageStore = {}
    this.contactStore = {}
    this.roomStore = {}
  }

  override async onStart (): Promise<void> {
    log.verbose('PuppetOICQ', 'onStart()')

    this.#oicqClient = oicq.createClient(this.qq, {
      log_level: 'off',
    })

    const puppetThis = this

    this.oicqClient
      .on('system.login.qrcode', function (
        this,
      ) {
        if (puppetThis.loginCheckInterval === undefined) {
          puppetThis.loginCheckInterval = setInterval(() => {
            this.login()
            log.verbose('check if QR code is scanned (try to login) if not scanned, new QR code will be shown')
          }, 15000)
        }
      })
      .on('system.login.error', function (
        this,
        error,
      ) {
        if (error.code < 0) { this.login() }
      })
      .login()

    this.oicqClient.on('message', function (
      this,
      oicqMessage,
    ) {
      puppetThis.messageStore[oicqMessage.message_id] = oicqMessage

      // Case 1: for group or discuss message
      // Case 2: new friend added after bot start
      // should set unknown contact info
      const senderInfo = oicqMessage.sender
      const senderId = 'qq_' + senderInfo.user_id.toString()

      if (!(senderId in puppetThis.contactStore)) {
        puppetThis.contactStore[senderId] = senderInfo
      }

      if (oicqMessage.message_type === 'group') {
        const groupId = 'group_' + oicqMessage.group_id.toString()
        const groupName = oicqMessage.group_name

        puppetThis.roomStore[groupId] = {
          id: groupId,
          topic: groupName,
        }
      }

      if (oicqMessage.message_type === 'discuss') {
        const discussId = 'group_' + oicqMessage.discuss_id.toString()
        const discussName = oicqMessage.discuss_name

        puppetThis.roomStore[discussId] = {
          id: discussId,
          topic: discussName,
        }
      }

      puppetThis.emit('message', { messageId: oicqMessage.message_id })
    })

    this.oicqClient.on('system.online', function (
      this: oicq.Client,
    ) {
      // puppetThis.state.on(true)
      clearInterval(puppetThis.loginCheckInterval)

      for (const [id, friend] of this.fl.entries()) {
        puppetThis.contactStore['qq_' + id.toString()] = friend
      }
      puppetThis.login('qq_' + puppetThis.qq.toString())
    })
  }

  override async onStop (): Promise<void> {
    log.verbose('PuppetOICQ', 'onStop()')

    // TODO: should we close the oicqClient?
    const oicqClient = this.oicqClient
    this.#oicqClient = undefined
    oicqClient.terminate()
  }

  override ding (data?: string): void {
    log.silly('PuppetOICQ', 'ding(%s)', data || '')
    // FIXME: do the real job
    setTimeout(() => this.emit('dong', { data: data || '' }), 1000)
  }

  override async messageRawPayloadParser (
    rawPayload: oicq.MessageEventData,
  ): Promise<MessagePayload> {
    // OICQ qq message Payload -> Puppet message payload
    let roomId : undefined | string
    let toId   : undefined | string

    if (rawPayload.message_type === 'private') {
      toId = 'qq_' + String(rawPayload.self_id)
    } else if (rawPayload.message_type === 'group') {
      roomId = 'group_' + String(rawPayload.group_id)
    } else { // (rawPayload.message_type === 'discuss') {
      roomId = 'group_' + String(rawPayload.discuss_id)
    }

    const payloadBase = {
      fromId: 'qq_' + String(rawPayload.sender.user_id),
      id: rawPayload.message_id,
      text: rawPayload.raw_message,
      timestamp: Date.now(),
      type: MessageType.Text, // TODO: need to change if message type changed to image and so on
    }

    let payload: MessagePayload

    if (toId) {
      payload = {
        ...payloadBase,
        toId,
      }
    } else if (roomId) {
      payload = {
        ...payloadBase,
        roomId,
      }
    } else {
      throw new Error('neither roomId nor toId')
    }

    return payload
  }

  override async messageRawPayload (oicqMessageId: string): Promise<oicq.MessageEventData> {
    const rawPayload = this.messageStore[oicqMessageId]
    if (!rawPayload) {
      throw new Error('NOPAYLOAD')
    }
    return rawPayload
  }

  override async messageSendText (conversationId: string, text: string, _mentionIdList?: string[]): Promise<string | void> {
    // test if conversationId starts with group_ or qq_
    const isGroupMessage = conversationId.startsWith('group_')
    const isPrivateMessage = conversationId.startsWith('qq_')

    if (isGroupMessage || isPrivateMessage) {
      const conversationNumber = parseInt(conversationId.replace(/^(group_|qq_)/, ''))
      if (isNaN(conversationNumber)) {
        throw new Error('puppet.messageSendText requires number id after group_ or qq_ prefix')
      }
      if (isGroupMessage) {
        await this.oicqClient.sendGroupMsg(conversationNumber, text)
      } else if (isPrivateMessage) {
        await this.oicqClient.sendPrivateMsg(conversationNumber, text)
      }
    } else {
      throw new Error('puppet.messageSendText requires private or group message')
    }
  }

  override async messageSendContact (_conversationId: string, _contactId: string): Promise<string | void> {
    throw new Error('Method not implemented.')
  }

  override async messageSendFile (_conversationId: string, _file: FileBox): Promise<string | void> {
    throw new Error('Method not implemented.')
  }

  override async messageSendMiniProgram (_conversationId: string, _miniProgramPayload: MiniProgramPayload): Promise<string | void> {
    throw new Error('Method not implemented.')
  }

  override async messageSendUrl (_conversationId: string, _urlLinkPayload: UrlLinkPayload): Promise<string | void> {
    throw new Error('Method not implemented.')
  }

  override contactSelfName (_name: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override contactSelfQRCode (): Promise<string> {
    throw new Error('Method not implemented.')
  }

  override contactSelfSignature (_signature: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override tagContactAdd (_tagId: string, _contactId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override tagContactDelete (_tagId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override tagContactList(): Promise<string[]>
  override tagContactList(contactId: string): Promise<string[]>
  override tagContactList (_contactId?: any): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  override tagContactRemove (_tagId: string, _contactId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override contactAlias(contactId: string): Promise<string>
  override contactAlias(contactId: string, alias: string): Promise<void>
  override contactAlias (_contactId: any, _alias?: any): Promise<void> | Promise<string> {
    throw new Error('Method not implemented.')
  }

  override contactAvatar(contactId: string): Promise<FileBox>
  override contactAvatar(contactId: string, file: FileBox): Promise<void>
  override contactAvatar (_contactId: any, _file?: any): Promise<void> | Promise<FileBox> {
    throw new Error('Method not implemented.')
  }

  override contactPhone (_contactId: string, _phoneList: string[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override contactCorporationRemark (_contactId: string, _corporationRemark: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override contactDescription (_contactId: string, _description: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override contactList (): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  override async contactRawPayload (_contactId: string): Promise<any> {
    log.verbose('PuppetOICQ', 'contactRawPayload(%s)', _contactId)
    return this.contactStore[_contactId]!
  }

  override async contactRawPayloadParser (_rawPayload: any): Promise<ContactPayload> {
    const genderStringToType: { [key: string]: ContactGender } = {
      female: ContactGender.Female,
      male: ContactGender.Male,
      unknown: ContactGender.Unknown,
    }

    return {
      avatar : 'unknown',
      gender : genderStringToType[_rawPayload.sex]!,
      id     : _rawPayload.user_id,
      name   : _rawPayload.nickname,
      phone : ['unkown'],
      type   : ContactType.Individual,
    }
  }

  override friendshipAccept (_friendshipId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override friendshipAdd (_contactId: string, _option?: FriendshipAddOptions): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override friendshipSearchPhone (_phone: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  override friendshipSearchWeixin (_weixin: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  override friendshipRawPayload (_friendshipId: string): Promise<any> {
    throw new Error('Method not implemented.')
  }

  override friendshipRawPayloadParser (_rawPayload: any): Promise<FriendshipPayload> {
    throw new Error('Method not implemented.')
  }

  override conversationReadMark (_conversationId: string, _hasRead?: boolean): Promise<boolean | void> {
    throw new Error('Method not implemented.')
  }

  override messageContact (_messageId: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  override messageFile (_messageId: string): Promise<FileBox> {
    throw new Error('Method not implemented.')
  }

  override messageImage (_messageId: string, _imageType: ImageType): Promise<FileBox> {
    throw new Error('Method not implemented.')
  }

  override messageMiniProgram (_messageId: string): Promise<MiniProgramPayload> {
    throw new Error('Method not implemented.')
  }

  override messageUrl (_messageId: string): Promise<UrlLinkPayload> {
    throw new Error('Method not implemented.')
  }

  override messageForward (_conversationId: string, _messageId: string): Promise<string | void> {
    throw new Error('Method not implemented.')
  }

  override messageRecall (_messageId: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  override roomInvitationAccept (_roomInvitationId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override roomInvitationRawPayload (_roomInvitationId: string): Promise<any> {
    throw new Error('Method not implemented.')
  }

  override roomInvitationRawPayloadParser (_rawPayload: any): Promise<RoomInvitationPayload> {
    throw new Error('Method not implemented.')
  }

  override roomAdd (_roomId: string, _contactId: string, _inviteOnly?: boolean): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override roomAvatar (_roomId: string): Promise<FileBox> {
    throw new Error('Method not implemented.')
  }

  override roomCreate (_contactIdList: string[], _topic?: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  override roomDel (_roomId: string, _contactId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override async roomList (): Promise<string[]> {
    log.verbose('PuppetOICQ', 'roomList()')
    // TODO: implement
    return []
  }

  override roomQRCode (_roomId: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  override roomQuit (_roomId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override roomTopic(roomId: string): Promise<string>
  override roomTopic(roomId: string, topic: string): Promise<void>
  override roomTopic (_roomId: any, _topic?: any): Promise<void> | Promise<string> {
    throw new Error('Method not implemented.')
  }

  override roomRawPayload (_roomId: string): Promise<any> {
    log.verbose('PuppetOICQ', 'roomRawPayload(%s)', _roomId)
    return this.roomStore[_roomId]!
  }

  override roomRawPayloadParser (_rawPayload: any): Promise<RoomPayload> {
    log.verbose('PuppetOICQ', 'roomRawPayloadParser(%s)', _rawPayload)
    return _rawPayload
  }

  override roomAnnounce(roomId: string): Promise<string>
  override roomAnnounce(roomId: string, text: string): Promise<void>
  override roomAnnounce (_roomId: any, _text?: any): Promise<void> | Promise<string> {
    throw new Error('Method not implemented.')
  }

  override async roomMemberList (_roomId: string): Promise<string[]> {
    log.verbose('PuppetOICQ', 'roomMemberList(%s)', _roomId)
    return []
  }

  override roomMemberRawPayload (_roomId: string, _contactId: string): Promise<any> {
    throw new Error('Method not implemented.')
  }

  override roomMemberRawPayloadParser (_rawPayload: any): Promise<RoomMemberPayload> {
    throw new Error('Method not implemented.')
  }

}

export { PuppetOICQ }
export default PuppetOICQ

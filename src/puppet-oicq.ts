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

import * as PUPPET from 'wechaty-puppet'
import { log } from 'wechaty-puppet'

import {
  FileBox,
}                       from 'file-box'
import type {
  FileBoxInterface,
}                       from 'file-box'
import oicq from 'oicq'

import {
  VERSION,
}                 from './config.js'
import * as qqId  from './qq-id.js'

/**
 * Skip generate QR Code png file
 *  by disabling the event `system.login.qrcode`
 *
 * use event `internal.qrcode` instead
 */
import './monkey-patch.js'
import type { EventScanPayload } from 'wechaty-puppet/dist/esm/src/schemas/event'

type PuppetOICQOptions = PUPPET.PuppetOptions & {
  qq?: number
}

class PuppetOICQ extends PUPPET.Puppet {

  static override readonly VERSION = VERSION

  protected _oicqClient?: oicq.Client
  protected get oicqClient (): oicq.Client {
    if (!this._oicqClient) {
      throw new Error('no oicq client!')
    }
    return this._oicqClient
  }

  private messageStore : { [id: string]: oicq.PrivateMessageEvent | oicq.GroupMessageEvent | oicq.DiscussMessageEvent}
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

    this._oicqClient = oicq.createClient(this.qq, {
      log_level: 'off',
    })

    const that = this

    /**
     * Huan(202111): emit qrcode event
     * @link https://github.com/takayama-lily/oicq/blob/b4288473745e8a9a50d7f56ab4a03d1df99aa5d6/lib/internal/listeners.ts#L92
     */
    const emitQrCode = this.wrapAsync(async function (
      this  : oicq.Client,
      image : Buffer,
    ) {
      const qrcode = await FileBox.fromBuffer(image).toQRCode()
      const payload: EventScanPayload = {
        qrcode,
        status: PUPPET.types.ScanStatus.Waiting,
      }
      that.emit('scan', payload)
    })
    this.oicqClient.on('internal.qrcode', emitQrCode)

    this.oicqClient
      .on('internal.qrcode', function (
        this: oicq.Client,
      ) {
        if (that.loginCheckInterval === undefined) {
          that.loginCheckInterval = setInterval(() => {
            that.wrapAsync(this.login())
            log.verbose('check if QR code is scanned (try to login) if not scanned, new QR code will be shown')
          }, 15 * 1000)
        }
      })
      .on('system.login.error', function (
        this,
        error,
      ) {
        if (error.code < 0) { that.wrapAsync(this.login()) }
      })
      .login()
      .catch(e => this.emit('error', e))

    this.oicqClient.on('message', function (
      this,
      oicqMessage,
    ) {
      that.messageStore[oicqMessage.message_id] = oicqMessage

      // Case 1: for group or discuss message
      // Case 2: new friend added after bot start
      // should set unknown contact info
      const senderInfo = oicqMessage.sender
      const senderId = qqId.toUserId(senderInfo.user_id)

      if (!(senderId in that.contactStore)) {
        that.contactStore[senderId] = senderInfo
      }

      if (oicqMessage.message_type === 'group') {
        const groupId   = qqId.toGroupId(oicqMessage.group_id)
        const groupName = oicqMessage.group_name

        that.roomStore[groupId] = {
          id: groupId,
          topic: groupName,
        }
      }

      if (oicqMessage.message_type === 'discuss') {
        /**
         * Huan(202110): what is a message_type === 'discuss'?
         */
        const discussId     = qqId.toGroupId(oicqMessage.discuss_id)
        const discussName   = oicqMessage.discuss_name

        that.roomStore[discussId] = {
          id: discussId,
          topic: discussName,
        }
      }

      that.emit('message', { messageId: oicqMessage.message_id })
    })

    this.oicqClient.on('system.online', function (
      this: oicq.Client,
    ) {
      // puppetThis.state.on(true)
      clearInterval(that.loginCheckInterval)

      for (const [id, friend] of this.fl.entries()) {
        that.contactStore[qqId.toUserId(id)] = friend
      }
      that.login(qqId.toUserId(that.qq))
    })
  }

  override async onStop (): Promise<void> {
    log.verbose('PuppetOICQ', 'onStop()')

    // TODO: should we close the oicqClient?
    const oicqClient = this.oicqClient
    this._oicqClient = undefined
    oicqClient.terminate()
  }

  override ding (data?: string): void {
    log.silly('PuppetOICQ', 'ding(%s)', data || '')
    // FIXME: do the real job
    setTimeout(() => this.emit('dong', { data: data || '' }), 1000)
  }

  override async messageRawPayloadParser (
    rawPayload: oicq.PrivateMessageEvent | oicq.GroupMessageEvent | oicq.DiscussMessageEvent,
  ): Promise<PUPPET.payloads.Message> {
    // OICQ qq message Payload -> Puppet message payload
    let roomId : undefined | string
    let toId   : undefined | string

    if (rawPayload.message_type === 'private') {
      toId = qqId.toUserId(rawPayload.to_id)
    } else if (rawPayload.message_type === 'group') {
      roomId = qqId.toGroupId(rawPayload.group_id)
    } else { // (rawPayload.message_type === 'discuss') {
      /**
       * Huan(202110): what is a message_type === 'discuss'?
       */
      roomId = qqId.toGroupId(rawPayload.discuss_id)
    }

    const payloadBase = {
      fromId: qqId.toUserId(rawPayload.sender.user_id),
      id: rawPayload.message_id,
      text: rawPayload.raw_message,
      timestamp: Date.now(),
      type: PUPPET.types.Message.Text, // TODO: need to change if message type changed to image and so on
    }

    let payload: PUPPET.payloads.Message

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

  override async messageRawPayload (oicqMessageId: string): Promise<oicq.PrivateMessageEvent | oicq.GroupMessageEvent | oicq.DiscussMessageEvent> {
    const rawPayload = this.messageStore[oicqMessageId]
    if (!rawPayload) {
      throw new Error('NOPAYLOAD')
    }
    return rawPayload
  }

  override async messageSendText (conversationId: string, text: string, _mentionIdList?: string[]): Promise<string | void> {
    // test if conversationId starts with group_ or qq_

    const conversationNumber = qqId.toQqNumber(conversationId)

    if (qqId.isGroupId(conversationId)) {
      await this.oicqClient.sendGroupMsg(conversationNumber, text)
    } else if (qqId.isUserId(conversationId)) {
      await this.oicqClient.sendPrivateMsg(conversationNumber, text)
    } else {
      throw new Error('conversationId: ' + conversationId + ' is neither QQ_USER_TYPE nor QQ_GROUP_TYPE')
    }
  }

  override async messageSendContact (_conversationId: string, _contactId: string): Promise<string | void> {
    throw new Error('Method not implemented.')
  }

  override async messageSendFile (_conversationId: string, _file: FileBoxInterface): Promise<string | void> {
    throw new Error('Method not implemented.')
  }

  override async messageSendMiniProgram (_conversationId: string, _miniProgramPayload: PUPPET.payloads.MiniProgram): Promise<string | void> {
    throw new Error('Method not implemented.')
  }

  override async messageSendUrl (_conversationId: string, _urlLinkPayload: PUPPET.payloads.UrlLink): Promise<string | void> {
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

  override contactAvatar(contactId: string): Promise<FileBoxInterface>
  override contactAvatar(contactId: string, file: FileBoxInterface): Promise<void>
  override contactAvatar (_contactId: any, _file?: any): Promise<void> | Promise<FileBoxInterface> {
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

  override async contactRawPayloadParser (_rawPayload: any): Promise<PUPPET.payloads.Contact> {
    const genderStringToType: { [key: string]: PUPPET.types.ContactGender } = {
      female: PUPPET.types.ContactGender.Female,
      male: PUPPET.types.ContactGender.Male,
      unknown: PUPPET.types.ContactGender.Unknown,
    }

    return {
      avatar : 'unknown',
      gender : genderStringToType[_rawPayload.sex]!,
      id     : _rawPayload.user_id,
      name   : _rawPayload.nickname,
      phone : ['unkown'],
      type   : PUPPET.types.Contact.Individual,
    }
  }

  override friendshipAccept (_friendshipId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override friendshipAdd (_contactId: string, _option?: PUPPET.types.FriendshipAddOptions): Promise<void> {
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

  override friendshipRawPayloadParser (_rawPayload: any): Promise<PUPPET.payloads.Friendship> {
    throw new Error('Method not implemented.')
  }

  override conversationReadMark (_conversationId: string, _hasRead?: boolean): Promise<boolean | void> {
    throw new Error('Method not implemented.')
  }

  override messageContact (_messageId: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  override messageFile (_messageId: string): Promise<FileBoxInterface> {
    throw new Error('Method not implemented.')
  }

  override messageImage (_messageId: string, _imageType: PUPPET.types.Image): Promise<FileBoxInterface> {
    throw new Error('Method not implemented.')
  }

  override messageMiniProgram (_messageId: string): Promise<PUPPET.payloads.MiniProgram> {
    throw new Error('Method not implemented.')
  }

  override messageUrl (_messageId: string): Promise<PUPPET.payloads.UrlLink> {
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

  override roomInvitationRawPayloadParser (_rawPayload: any): Promise<PUPPET.payloads.RoomInvitation> {
    throw new Error('Method not implemented.')
  }

  override roomAdd (_roomId: string, _contactId: string, _inviteOnly?: boolean): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override roomAvatar (_roomId: string): Promise<FileBoxInterface> {
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

  override roomRawPayloadParser (_rawPayload: any): Promise<PUPPET.payloads.Room> {
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

  override roomMemberRawPayloadParser (_rawPayload: any): Promise<PUPPET.payloads.RoomMember> {
    throw new Error('Method not implemented.')
  }

}

export type {
  PuppetOICQOptions,
}
export { PuppetOICQ }
export default PuppetOICQ

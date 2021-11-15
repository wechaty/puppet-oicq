import type oicq from 'oicq'
import { log } from 'wechaty-puppet'

import { bindInternalListeners } from 'oicq/lib/internal/listeners.js'

;(bindInternalListeners as any).originalCall = bindInternalListeners.call

/**
 * Skip generate QR Code png file
 *  by disabling the event `system.login.qrcode`
 *
 * use event `internal.qrcode` instead
 */
bindInternalListeners.call = ((
  client: oicq.Client,
) => {
  log.verbose('PuppetOICQ', 'monkeyPatch() bindInternalListeners.call()')

  const wrappedClient = {
    on: (eventName: any, callback: any) => {
      if (eventName === 'internal.qrcode') {
        log.verbose('PuppetOICQ', 'monkeyPatch() bindInternalListeners.call() skipped event `internal.qrcode`')
      } else {
        client.on(eventName, callback)
      }
    },
  }

  log.verbose('PuppetOICQ', 'monkeyPatch() bindInternalListeners.call() passing wrapped client to original call')
  ;(bindInternalListeners as any).originalCall(wrappedClient)
}) as any

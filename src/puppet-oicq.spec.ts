#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import { test } from 'tstest'

import { PuppetOICQ } from './puppet-oicq.js'

// TODO: restore perfect restart testing
test.skip('perfect restart', async t => {
  const puppet = new PuppetOICQ({ qq: 918999 })

  for (let n = 0; n < 1; n++) {
    await puppet.start()
    await puppet.stop()
    t.pass('perfect restart succeed at #' + n)
  }
})

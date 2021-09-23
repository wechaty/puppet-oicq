#!/usr/bin/env ts-node

import {
  PuppetOICQ,
  VERSION,
}                 from 'wechaty-puppet-oicq'

async function main () {
  const puppet = new PuppetOICQ({ qq: 12345 })

  if (VERSION === '0.0.0') {
    throw new Error('version should not be 0.0.0 when prepare for publishing')
  }

  console.info(`Puppet v${puppet.version()} smoke testing passed.`)
  return 0
}

main()
  .then(process.exit)
  .catch(e => {
    console.error(e)
    process.exit(1)
  })

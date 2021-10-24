#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import {
  test,
  AssertEqual,
}               from 'tstest'

import {
  QQ_GROUP_ID,
  QQ_USER_ID,
  isQqGroupId,
  isQqUserId,
}                   from './qq-id.js'

test('QQ user id', async t => {
  const QQ_USER_FIXTURES = [
    ['qq_12345678',     true],
    ['group_123456789', false],
    ['1234567890',      false],
  ] as const

  for (const [id, expected] of QQ_USER_FIXTURES) {
    t.equal(isQqUserId(id), expected, `${id} is ${expected ? '' : 'not '}a QQ user id`)
  }
})

test('QQ group id', async t => {
  const QQ_GROUP_FIXTURES = [
    ['group_12345678',  true],
    ['qq_123456789',    false],
    ['1234567890',      false],
  ] as const

  for (const [id, expected] of QQ_GROUP_FIXTURES) {
    t.equal(isQqGroupId(id), expected, `${id} is ${expected ? '' : 'not '}a QQ group id`)
  }
})

test('QQ group id type guard', async t => {
  const qqUserId: QQ_USER_ID   = 'qq_12345678'
  const qqGroupId: QQ_GROUP_ID = 'group_12345678'

  const userTypeTest: AssertEqual<
    typeof qqUserId,
    QQ_USER_ID
  > = true
  t.ok(userTypeTest, 'QQ user id type')

  const groupTypeTest: AssertEqual<
    typeof qqGroupId,
    QQ_GROUP_ID
  > = true
  t.ok(groupTypeTest, 'QQ group id type')
})

#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import {
  test,
  AssertEqual,
}               from 'tstest'

import {
  isGroupId,
  isUserId,
  QQ_GROUP_ID,
  QQ_USER_ID,
  toGroupId,
  toQqNumber,
  toUserId,
}                   from './qq-id.js'

test('QQ user id', async t => {
  const QQ_USER_FIXTURES = [
    ['user_12345678',     true],
    ['group_123456789', false],
    ['1234567890',      false],
  ] as const

  for (const [id, expected] of QQ_USER_FIXTURES) {
    t.equal(isUserId(id), expected, `${id} is ${expected ? '' : 'not '}a QQ user id`)
  }
})

test('QQ group id', async t => {
  const QQ_GROUP_FIXTURES = [
    ['group_12345678',  true],
    ['user_123456789',    false],
    ['1234567890',      false],
  ] as const

  for (const [id, expected] of QQ_GROUP_FIXTURES) {
    t.equal(isGroupId(id), expected, `${id} is ${expected ? '' : 'not '}a QQ group id`)
  }
})

test('QQ group id type guard', async t => {
  const userId: QQ_USER_ID   = 'user_12345678'
  const groupId: QQ_GROUP_ID = 'group_12345678'

  const userTypeTest: AssertEqual<
    typeof userId,
    QQ_USER_ID
  > = true
  t.ok(userTypeTest, 'QQ user id type')

  const groupTypeTest: AssertEqual<
    typeof groupId,
    QQ_GROUP_ID
  > = true
  t.ok(groupTypeTest, 'QQ group id type')
})

test('QQ user id builder', async t => {
  const USER_FIXTURES = [
    [12345678, 'user_12345678'],
  ] as const

  for (const [numId, strId] of USER_FIXTURES) {
    t.equal(toUserId(numId), strId, `${numId} is ${strId}`)
    t.equal(toQqNumber(strId), numId, `${strId} is ${numId}`)
  }
})

test('QQ group id builder', async t => {
  const GROUP_FIXTURES = [
    [12345678, 'group_12345678'],
  ] as const

  for (const [numId, strId] of GROUP_FIXTURES) {
    t.equal(toGroupId(numId), strId, `${numId} is ${strId}`)
    t.equal(toQqNumber(strId), numId, `${strId} is ${numId}`)
  }
})

test('QQ ID invalidation check', async t => {
  const FIXTURE = [
    null,
    undefined,
    '',
    [],
    {},
    0,
  ]

  for (const value of FIXTURE) {
    t.throws(() => toQqNumber(value as any), `should throw for ${typeof value}: "${JSON.stringify(value)}"`)
  }
})

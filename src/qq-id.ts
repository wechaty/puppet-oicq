/**
 * Template Literal Types
 *
 * Template literal types build on string literal types,
 * and have the ability to expand into many strings via unions.
 *
 * They have the same syntax as template literal strings in JavaScript,
 * but are used in type positions. When used with concrete literal types,
 * a template literal produces a new string literal type by concatenating the contents.
 *
 * @see https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
 */
type QQ_USER_ID   = `user_${string}`
type QQ_GROUP_ID  = `group_${string}`

const isGroupId = (id: string): id is QQ_GROUP_ID => id.startsWith('group_')
const isUserId  = (id: string): id is QQ_USER_ID  => id.startsWith('user_')

const toGroupId = (id: number): QQ_GROUP_ID => `group_${id}`
const toUserId  = (id: number): QQ_USER_ID  => `user_${id}`

const toQqNumber = (id: string): number => {
  const num = id.replace(/^[^\d]+/, '')
  if (!num) throw new Error('Invalid QQ ID: ' + id)

  const qq = Number(num)
  if (isNaN(qq))  throw new Error('Invalid QQ ID: ' + id)
  if (qq === 0)   throw new Error('Invalid QQ ID: ' + id)

  return qq
}

export type {
  QQ_USER_ID,
  QQ_GROUP_ID,
}
export {
  toQqNumber,
  isGroupId,
  isUserId,
  toGroupId,
  toUserId,
}

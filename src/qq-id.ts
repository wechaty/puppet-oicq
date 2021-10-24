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
type QQ_USER_ID   = `qq_${string}`
type QQ_GROUP_ID  = `group_${string}`

const isQqUserId  = (id: string): id is QQ_USER_ID  => id.startsWith('qq_')
const isQqGroupId = (id: string): id is QQ_GROUP_ID => id.startsWith('group_')

export type {
  QQ_USER_ID,
  QQ_GROUP_ID,
}
export {
  isQqUserId,
  isQqGroupId,
}

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

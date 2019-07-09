import {countObjectProperties} from '@/utils'

export default {
  authUser (state) {
    return state.users[state.authId]
  },

  userPostsCount: state => userId => countObjectProperties(state.users[userId].posts),
  userThreadsCount: state => userId => countObjectProperties(state.users[userId].threads),
  threadRepliesCount: state => threadId => countObjectProperties(state.threads[threadId].posts) - 1
}

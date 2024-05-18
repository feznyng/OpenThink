import { createSelector } from "@reduxjs/toolkit"
import { throttle } from "lodash"
import store, { RootState } from "../../Store"
import commitUpdatePost from "../../mutations/UpdatePost"
import { getPriorityNum, priorities, translatePriorityNum } from "../../utils/taskutils"
import { editPostById, putPost } from "./TaskSlice"

export const makeSelectGroup = () =>
    createSelector(
    [(state: RootState, postId: string) => state.task.tasks[postId]],
    (post) => {
        if (post && post.postId >= 0) {
            const {color, postId, numPosts, entryIds, selected} = post
            return {
                id: postId.toString(),
                color,
                count: numPosts,
                selected,
                attribute: {
                    id: postId.toString(),
                    name: 'Section',
                    type: 'Select',
                    options: [
                        {
                            value: post.title,
                            color: post.color
                        }
                    ]
                },
                attributeValue: {
                    value: post.title,
                },
                entryIds,
            }
        } else {
            return {
                id: '-1',
                defaultGroup: true,
                selected: false,
                count: post?.numPosts ? post.numPosts : 0,
                attribute: {
                    id: 'default',
                    name: 'Section',
                    type: 'Select',
                    options: [
                        {
                            value: 'Default',
                            color: '#BDBDBD'
                        }
                    ]
                },
                attributeValue: {
                    value: post?.title ? post.title : '',
                },
                entryIds: post?.entryIds ? post.entryIds : []
            }
        }
    }
)

export const makeSelectEntry = () => 
    createSelector(
        [(state: RootState, postId: string) => state.task.tasks[postId]],
        (post) => {
            if (post) {
                const { postId, title, completed, users, dueDate, numCompleted, numPosts, priority, tags, entryIds } = post
                return {
                    id: postId.toString(),
                    numSubEntries: numPosts,
                    numSubEntriesCompleted: numCompleted ? numCompleted : 0,
                    subEntries: entryIds,
                    attributeValues: {
                        "Title": {
                            value: title
                        },
                        "Completed": {
                            value: completed
                        },
                        "Assignees": {
                            value: users
                        },
                        "Due date": {
                            value: dueDate
                        },
                        "Priority": {
                            value: translatePriorityNum(priority)
                        },
                        "Tags": {
                            value: tags
                        }
                    }
                }
            } else {
                return {
                    id: 'Hmm',
                    attributeValues: {
                        "Title": {
                            value: 'title'
                        },
                        "Completed": {
                            value: false
                        },
                        "Assignees": {
                            value: []
                        },
                        "Due date": {
                            value: null
                        },
                        "Priority": {
                            value: translatePriorityNum(-1)
                        },
                        "Tags": {
                            value: []
                        }
                    }
                }
            }
          
        }
    )

export const attributes = [
  {
      name: 'Title',
      type: 'Title', 
      id: 'title',
  },
  {
      name: 'Completed',
      type: 'Checkbox', 
      id: 'completed'
  },
  {
      name: 'Due date',
      type: 'Date', 
      id: 'duedate'
  },
  {
      name: 'Assignees',
      type: 'Person', 
      id: 'assignees'
  },
  {
      name: 'Tags',
      type: 'Tags',
      id: 'tags'
  },
  {
      name: 'Priority',
      type: 'Select',
      options: priorities,
      id: 'priority'
  }
]

export const changeAttributeValue = (entryId: string, attributeName: string, value: any, groupId?: string | null) => {
    let changes: any = { postId: parseInt(entryId) }
    switch (attributeName) {
        case 'Completed': 
            if (groupId) {
                const parentTask = store.getState().task.tasks[groupId]
                if (parentTask) {
                    const numCompleted = parentTask.numCompleted ? parentTask.numCompleted : 0
                    !!value ? store.dispatch(putPost({postId: parseInt(groupId), numCompleted: numCompleted + 1})) : store.dispatch(putPost({postId: parseInt(groupId), numCompleted: numCompleted - 1}))
                }
            }
            changes.completed = value
            break
        case 'Due date':
            changes.dueDate = value
            break
        case 'Priority':
            changes.priority = getPriorityNum(value)
            break
        case 'Assignees':
            changes.assignees = value
            break
        case 'Title':
            changes.title = value
            break
        case 'Tags':
            console.log(value)
            changes.tags = value
            break
    }
    if (Object.keys(changes).length > 1)
        onPostChange(changes)
}

export const debouncedSavePost = throttle((changes) => {
    commitUpdatePost({
        ...changes,
        type: changes.type ? changes.type : "Task",
    })
}, 500)


export const onPostChange = (changes: any) => {
    debouncedSavePost({
        ...changes,
        assignees: changes.assignees ? changes.assignees.map((a: any) => a.userId) : null
    })    
    changes = changes.assignees ? {...changes, users: changes.assignees, assignees: undefined} : changes
    store.dispatch(editPostById({
        post: changes,
        postId: changes.postId.toString()
    }))
}
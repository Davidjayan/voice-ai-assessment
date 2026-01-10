import { gql } from '@apollo/client'
import { TASK_FRAGMENT, TASK_COMMENT_FRAGMENT } from '../../apollo/fragments'

export const CREATE_TASK = gql`
  ${TASK_FRAGMENT}
  mutation CreateTask($projectId: UUID!, $organizationId: UUID!, $input: TaskInput!) {
    createTask(projectId: $projectId, organizationId: $organizationId, input: $input) {
      success
      error
      task {
        ...TaskFields
      }
    }
  }
`

export const UPDATE_TASK = gql`
  ${TASK_FRAGMENT}
  mutation UpdateTask($id: UUID!, $organizationId: UUID!, $input: TaskInput!) {
    updateTask(id: $id, organizationId: $organizationId, input: $input) {
      success
      error
      task {
        ...TaskFields
      }
    }
  }
`

export const ADD_COMMENT = gql`
  ${TASK_COMMENT_FRAGMENT}
  mutation AddTaskComment($taskId: UUID!, $organizationId: UUID!, $input: CommentInput!) {
    addTaskComment(taskId: $taskId, organizationId: $organizationId, input: $input) {
      success
      error
      comment {
        ...TaskCommentFields
      }
    }
  }
`

import { gql } from '@apollo/client'

// Reusable fragments for cache normalization

export const TASK_COMMENT_FRAGMENT = gql`
  fragment TaskCommentFields on TaskCommentType {
    id
    content
    authorName
    createdAt
    updatedAt
  }
`

export const TASK_FRAGMENT = gql`
  fragment TaskFields on TaskType {
    id
    title
    description
    status
    priority
    dueDate
    order
    createdAt
    updatedAt
  }
`

export const TASK_WITH_COMMENTS_FRAGMENT = gql`
  ${TASK_COMMENT_FRAGMENT}
  fragment TaskWithComments on TaskType {
    id
    title
    description
    status
    priority
    dueDate
    order
    createdAt
    updatedAt
    comments {
      ...TaskCommentFields
    }
  }
`

export const PROJECT_STATISTICS_FRAGMENT = gql`
  fragment ProjectStatisticsFields on ProjectStatisticsType {
    totalTasks
    completedTasks
    pendingTasks
    completionPercentage
  }
`

export const PROJECT_FRAGMENT = gql`
  fragment ProjectFields on ProjectType {
    id
    name
    description
    status
    dueDate
    createdAt
    updatedAt
  }
`

export const PROJECT_WITH_TASKS_FRAGMENT = gql`
  ${PROJECT_FRAGMENT}
  ${TASK_WITH_COMMENTS_FRAGMENT}
  ${PROJECT_STATISTICS_FRAGMENT}
  fragment ProjectWithTasks on ProjectType {
    ...ProjectFields
    tasks {
      ...TaskWithComments
    }
    statistics {
      ...ProjectStatisticsFields
    }
  }
`

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFields on OrganizationType {
    id
    name
    slug
    description
    isActive
    createdAt
  }
`

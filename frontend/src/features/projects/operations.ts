import { gql } from '@apollo/client'
import { PROJECT_FRAGMENT, PROJECT_WITH_TASKS_FRAGMENT } from '../../apollo/fragments'

export const GET_PROJECTS = gql`
  ${PROJECT_FRAGMENT}
  query GetProjects($organizationId: UUID!) {
    projects(organizationId: $organizationId) {
      ...ProjectFields
      statistics {
        totalTasks
        completedTasks
        completionPercentage
      }
    }
  }
`

export const GET_PROJECT = gql`
  ${PROJECT_WITH_TASKS_FRAGMENT}
  query GetProject($id: UUID!, $organizationId: UUID!) {
    project(id: $id, organizationId: $organizationId) {
      ...ProjectWithTasks
    }
  }
`

export const CREATE_PROJECT = gql`
  ${PROJECT_FRAGMENT}
  mutation CreateProject($organizationId: UUID!, $input: ProjectInput!) {
    createProject(organizationId: $organizationId, input: $input) {
      success
      error
      project {
        ...ProjectFields
      }
    }
  }
`

export const UPDATE_PROJECT = gql`
  ${PROJECT_FRAGMENT}
  mutation UpdateProject($id: UUID!, $organizationId: UUID!, $input: ProjectInput!) {
    updateProject(id: $id, organizationId: $organizationId, input: $input) {
      success
      error
      project {
        ...ProjectFields
      }
    }
  }
`

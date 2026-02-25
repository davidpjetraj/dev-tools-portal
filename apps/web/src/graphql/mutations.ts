import { gql } from '@apollo/client/core'

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      username
    }
  }
`

export const CREATE_LINK = gql`
  mutation CreateLink($input: LinkInput!) {
    createLink(input: $input) {
      id
      title
      url
      icon
      description
      category
      order
    }
  }
`

export const UPDATE_LINK = gql`
  mutation UpdateLink($id: ID!, $input: LinkInput!) {
    updateLink(id: $id, input: $input) {
      id
      title
      url
      icon
      description
      category
      order
    }
  }
`

export const DELETE_LINK = gql`
  mutation DeleteLink($id: ID!) {
    deleteLink(id: $id)
  }
`

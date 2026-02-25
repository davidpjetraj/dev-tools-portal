import { gql } from '@apollo/client/core'

export const LOGIN = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      access_token
      refresh_token
    }
  }
`

export const CREATE_LINK = gql`
  mutation CreateLink($input: CreateLinkInput!) {
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
  mutation UpdateLink($id: ID!, $input: UpdateLinkInput!) {
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

import { gql } from '@apollo/client/core'

export const GET_LINKS = gql`
  query GetLinks($category: String) {
    links(category: $category) {
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

export const GET_LINK = gql`
  query GetLink($id: ID!) {
    link(id: $id) {
      id
      title
      url
      icon
      description
      category
      order
      createdAt
      updatedAt
    }
  }
`

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories
  }
`

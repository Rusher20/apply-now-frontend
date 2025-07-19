import { gql } from "@apollo/client";

export const GET_POSITION = gql`
query GetPositions {
  positions {
    id
    title
    description
    isActive
    value
    createdAt
    updatedAt
    questions {
      id
      type
      label
      placeholder
      required
      options {
        id
        value
        requiresInput
        inputLabel
      }
    }
  }
}
`
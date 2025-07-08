import { gql } from "@apollo/client";

export const CREATE_POSITION = gql`
  mutation CreatePosition($data: CreatePositionInput!) {
    createPosition(data: $data) {
      id
      title
      description
      icon
      isActive
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
        }
      }
    }
  }
`;
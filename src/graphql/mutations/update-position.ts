import { gql } from "@apollo/client";

export const UPDATE_POSITION = gql`
  mutation UpdatePosition($id: Int!, $data: CreatePositionInput!) {
    updatePosition(id: $id, data: $data) {
      id
      title
      description
      isActive
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
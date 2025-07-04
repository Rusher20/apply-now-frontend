import { gql } from "@apollo/client";

export const DELETE_JOB_APPLICATION = gql`
  mutation DeleteJobApplication($id: Int!) {
    deleteApplication(id: $id) {
      id
    }
  }
`;

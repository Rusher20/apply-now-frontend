import { gql } from "@apollo/client";

export const UPDATE_JOB_APPLICATION_STATUS = gql`
  mutation UpdateJobApplicationStatus($id: Int!, $status: String!) {
    updateApplicationStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

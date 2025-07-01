import { gql } from "@apollo/client";

export const SUBMIT_APPLICATION = gql`
  mutation SubmitApplication($input: CreateApplicationInput!, $file: Upload!) {
  submitApplication(input: $input, file: $file)
}`;

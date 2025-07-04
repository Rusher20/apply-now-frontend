import { gql } from '@apollo/client';

export const GET_JOB_APPLICATIONS = gql`
  query GetJobApplications {
    jobApplications {
      id
      name
      email
      gender
      contactNumber
      address
      position
      city
      province
      region
      expectedSalary
      applicationLetter
      resumeUrl
      createdAt
      status
    }
  }
`;

import { gql } from '@apollo/client';

export const GET_JOB_APPLICATIONS = gql`
  query GetJobApplications {
    jobApplications {
      id
      createdAt
      confidentialityAgreed
      name
      age
      gender
      email
      contactNumber
      address
      city
      province
      education
      applicationSource
      referralName
      hasStableInternet
      internetProvider
      position
      roleSpecific
      resumeUrl
      status
    }
  }
`;

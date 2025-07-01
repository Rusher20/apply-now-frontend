declare module 'apollo-upload-client' {
  import { HttpOptions } from '@apollo/client/link/http';
  import { ApolloLink } from '@apollo/client';

  export interface UploadLinkOptions extends HttpOptions {}

  export function createUploadLink(options: UploadLinkOptions): ApolloLink;
}

import { ApolloClient, InMemoryCache} from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client';

const client = new ApolloClient({
  link: createUploadLink({
    uri: 'https://apply-now-backend-production.up.railway.app/graphql', 
  }),
  cache: new InMemoryCache(),
})

export default client;
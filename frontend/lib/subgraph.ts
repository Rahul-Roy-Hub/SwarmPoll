import { ApolloClient, InMemoryCache, HttpLink, gql } from "@apollo/client"

// Initialize Apollo Client for subgraph queries
const subgraphUri =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
  "https://api.studio.thegraph.com/query/your-subgraph"

const httpLink = new HttpLink({
  uri: subgraphUri,
  // Ensure fetch is available in all environments (Next.js/SSR)
  fetch: typeof fetch !== "undefined" ? fetch : undefined,
})

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

// GraphQL queries
export const GET_ACTIVE_POLLS = gql`
  query GetActivePolls {
    polls(where: { isEnded: false }, orderBy: endTime, orderDirection: asc) {
      id
      question
      endTime
      totalStaked
      options {
        id
        label
        totalStaked
      }
    }
  }
`

export const GET_POLL_BY_ID = gql`
  query GetPollById($id: ID!) {
    poll(id: $id) {
      id
      question
      endTime
      totalStaked
      winningOption
      isEnded
      options {
        id
        label
        totalStaked
      }
      stakes(where: { user: $userAddress }) {
        id
        amount
        option {
          id
        }
      }
    }
  }
`

export const GET_USER_STAKES = gql`
  query GetUserStakes($userAddress: Bytes!) {
    stakes(where: { user: $userAddress }) {
      id
      amount
      poll {
        id
        question
        isEnded
        winningOption
      }
      option {
        id
        label
      }
    }
  }
`

export const GET_USER_CLAIMS = gql`
  query GetUserClaims($userAddress: Bytes!) {
    claims(where: { user: $userAddress }) {
      id
      amount
      poll {
        id
        question
      }
    }
  }
`

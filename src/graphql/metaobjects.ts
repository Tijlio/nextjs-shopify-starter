import { gql } from "graphql-tag";

export const GET_META_OBJECTS_BY_TYPENAME = gql`
  query getMetaObject($type: String!) {
    metaobjects(type: $type, first: 250) {
      edges {
        node {
          id
          handle
          fields {
            key
            value
          }
        }
      }
    }
  }
`;

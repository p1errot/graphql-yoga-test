import dotenv from 'dotenv';
import { GraphQLServer } from 'graphql-yoga';
import mongoose from 'mongoose';
import userModel from './user.model';

dotenv.config();

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const models = {
  User: userModel
};

const typeDefs = `
type User {
  id: ID!
  name: String!
  email: String!
}
type Query {
  hello(name: String): String!
  user: User!
  users: [User]!
}
type Mutation {
  hello(name: String!): Boolean
  createUser(name: String!, email: String!): User!
}
`

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    user: () => {
      console.log('USER RESOLVER');
      
      return {
        id: 456,
        email: 'mono@zemoga.com',
      };
    },
    users: async (_, __, ctx) => {
      const users = await ctx.models.User.find({});

      return users;
    },
  },
  Mutation: {
    hello: (root, args, ctx) => true,
    createUser: async (_, args, ctx) => {
      const alreadyCreated = await ctx.models.User.exists({ email: args.email });

      if (alreadyCreated) {
        throw new Error('Email already exists');
      }

      const userCreated = await ctx.models.User.create(args);

      return userCreated;
    }
  },
  User: {
    id: (root) => {
      return root._id;
    }
  }
}

mongoose
  .connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@workshop-cb7vf.mongodb.net/workshop`)
  .then((db) => {
    const server = new GraphQLServer({
      typeDefs,
      resolvers,
      context: {
        models,
        db
      }
    });

    server.start(() => console.log('Server is running on localhost:4000'));
  })
  .catch((error) => {
    console.log('ERROR?', error);
  });
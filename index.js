const { ApolloServer, gql } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { loadSchemaSync } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { addResolversToSchema } = require('@graphql-tools/schema');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Hello } = require('./src/resolvers/Hello');
require('dotenv').config();

const schema = loadSchemaSync('./src/**/*.graphql', {
	loaders: [new GraphQLFileLoader()],
});

const resolvers = {
	...Hello,
};

const schemaWithResolvers = addResolversToSchema({
	schema,
	resolvers,
});

async function startApolloServer(schema) {
	const app = express();
	const httpServer = http.createServer(app);

	const server = new ApolloServer({
		schema,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	await mongoose.connect(process.env.MONGODB, { useNewUrlParser: true });

	await server.start();
	server.applyMiddleware({
		app,
		path: '/',
	});

	await httpServer.listen({ port: 4000 });
	console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer(schemaWithResolvers);

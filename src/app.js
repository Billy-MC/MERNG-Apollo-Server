const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const express = require('express');
const http = require('http');

require('dotenv').config();

const connectToMongoDB = require('./database/mongodb');
const logger = require('./config/logger');

async function startApolloServer(schema) {
	const app = express();
	const httpServer = http.createServer(app);

	const server = new ApolloServer({
		schema,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	connectToMongoDB();

	await server.start();
	server.applyMiddleware({
		app,
		path: '/',
	});

	await httpServer.listen({ port: 4000 });
	logger.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

module.exports = startApolloServer;

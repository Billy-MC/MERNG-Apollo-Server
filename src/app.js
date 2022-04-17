const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { PubSub } = require('graphql-subscriptions');
const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
require('dotenv').config();

const connectToMongoDB = require('./database/mongodb');
const logger = require('./config/logger');

async function startApolloServer(schema) {
	const app = express();
	const httpServer = createServer(app);
	const PORT = 4000;

	const pubSub = new PubSub();

	// Create a WebSocketServer to use as your subscription server.
	const wsServer = new WebSocketServer({
		server: httpServer,
	});

	const serverCleanup = useServer({ schema }, wsServer);

	const server = new ApolloServer({
		schema,
		// Add plugins to your ApolloServer constructor to shutdown both the HTTP server and the WebSocketServer
		plugins: [
			// Proper shutdown for the HTTP server.
			ApolloServerPluginDrainHttpServer({ httpServer }),
			{
				// Proper shutdown for the WebSocket server.
				serverWillStart: async () => ({
					drainServer: async () => {
						await serverCleanup.dispose();
					},
				}),
			},
		],
		cors: true,
		introspection: true,
		tracing: true,
		context: ({ req }) => ({ req, pubSub }),
	});

	connectToMongoDB();

	await server.start();
	server.applyMiddleware({
		app,
		path: '/',
		cors: true,
	});

	await httpServer.listen(PORT, () => {
		logger.info(
			`🚀 Apollo Server ready at http://localhost:${PORT}${server.graphqlPath}`
		);
	});
}

module.exports = startApolloServer;

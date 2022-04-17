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

const pubSub = new PubSub();

async function startApolloServer(schema) {
	const app = express();
	const httpServer = createServer(app);

	const wsServer = new WebSocketServer({
		server: httpServer,
	});

	const serverCleanup = useServer({ schema }, wsServer);

	const server = new ApolloServer({
		schema,
		plugins: [
			ApolloServerPluginDrainHttpServer({ httpServer }),
			{
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

	const PORT = 4000;

	await httpServer.listen({ port: PORT });
	logger.info(
		`🚀 Apollo Server ready at http://localhost:${PORT}${server.graphqlPath}`
	);
}

module.exports = startApolloServer;

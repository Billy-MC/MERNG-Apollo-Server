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
		path: '/',
	});

	const serverCleanup = useServer({ schema }, wsServer);

	const server = new ApolloServer({
		schema,
		plugins: [
			ApolloServerPluginDrainHttpServer({ httpServer }),
			{
				async serverWillStart() {
					return {
						async drainServer() {
							await serverCleanup.dispose();
						},
					};
				},
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
		cors: true,
	});

	await httpServer.listen({ port: 4000 });
	logger.info(
		`🚀 Apollo Server ready at http://localhost:4000${server.graphqlPath}`
	);
}

module.exports = startApolloServer;

module.exports = {
  apps: [
    {
      name: 'aalrt',
      script: './src/index.ts', // Path to your TypeScript entry file
      interpreter: 'ts-node', // Use ts-node as the interpreter
      node_args: '-r tsconfig-paths/register', // Register tsconfig paths
    },
  ],
};

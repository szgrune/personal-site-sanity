import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '3scwu6mf',
    dataset: 'production',
  },
  deployment: {
    appId: 'odu9h2cz63vchmhqx1cbpcah',
  },
  typegen: {
    enabled: true,
    path: '../web/src/**/*.{ts,tsx,js,jsx}',
    schema: 'schema.json',
    generates: '../web/src/sanity/types.ts',
    overloadClientMethods: true,
  },
})

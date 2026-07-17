import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'f5bbxrks',
    dataset: 'production',
  },
  studioHost: 'szgrune-personal-site',
  deployment: {
    appId: 'fzjnrzrtd110572zbvkcrnrm',
  },
  autoUpdates: true,
})

import { PluginManager, Profile } from '@remixproject/engine';

export class VscodeManager extends PluginManager {
  async canDeactivate(from: Profile, to: Profile) {
    if (from.name === 'manager' || from.name === to.name) {
      return true
    }
    return false
  }
}
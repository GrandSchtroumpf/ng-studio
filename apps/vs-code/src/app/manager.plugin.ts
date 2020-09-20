import { PluginManager } from '@remixproject/engine';
import { Profile } from '@remixproject/plugin-utils';

export class VscodeManager extends PluginManager {
  async updateProfile(to: Partial<Profile>) {
    if (!to) return
    if (!this.profiles[to.name]) {
      throw new Error(`Plugin ${to.name} is not register, you cannot update it's profile.`)
    }
    const from = await this.getProfile(this.requestFrom)
    await this.canUpdateProfile(from, to)
    this.profiles[to.name] = {
      ...this.profiles[to.name],
      ...to
    }
    this.emit('profileUpdated', this.profiles[to.name])
  }

  async canDeactivate(from: Profile, to: Profile) {
    if (from.name === 'manager' || from.name === to.name) {
      return true
    }
    return false
  }
}
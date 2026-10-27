import { SettingsForm } from '@/components/admin/SimpleForms'
import { getStoredSettings } from '@/lib/admin/data'
import { currentSettings, settingsFormValues } from '@/lib/admin/settings'
import { requireUser } from '@/lib/auth/dal'

// Private, per-request page (reads the session): navigation waits for the server by design.
export const instant = false

export const metadata = { title: 'Site settings' }

export default async function SettingsPage() {
  await requireUser()
  const site = currentSettings(await getStoredSettings())
  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Site settings</h1>
          <p className="admin-lead">
            Contact details and links used in the header and footer of every page.
          </p>
        </div>
      </header>
      <div className="admin-card">
        <SettingsForm initial={settingsFormValues(site)} />
      </div>
    </>
  )
}

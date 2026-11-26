import { useEffect, useState } from 'react'
import { LockKeyhole, ShieldQuestion, UserRound } from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import ErrorState from '../components/ui/ErrorState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { authService } from '../services/authService'
import { getErrorMessage } from '../services/http'

export default function ProfilePage() {
  useDocumentTitle('Profile')
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState({ revision: -1, profile: null, error: null })
  const loading = result.revision !== revision

  useEffect(() => {
    let active = true
    authService.me()
      .then((profile) => {
        if (active) setResult({ revision, profile, error: null })
      })
      .catch((error) => {
        if (active) setResult({ revision, profile: null, error: getErrorMessage(error, 'Unable to load your profile.') })
      })
    return () => { active = false }
  }, [revision])

  const profile = result.profile
  const fields = [
    ['User ID', profile?.id],
    ['Username', profile?.username],
    ['Email', profile?.email],
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">View the details associated with your account.</p>
      </div>

      {loading ? (
        <div className="card p-6 text-sm text-slate-500" role="status">Loading your profile...</div>
      ) : result.error ? (
        <div role="alert"><ErrorState message={result.error} onRetry={() => setRevision((value) => value + 1)} /></div>
      ) : (
        <section className="card overflow-hidden" aria-labelledby="account-details-heading">
          <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <Avatar name={profile?.username || profile?.email || 'User'} size="lg" />
            <div className="min-w-0">
              <h3 id="account-details-heading" className="text-base font-semibold text-slate-900">Account details</h3>
              <p className="mt-1 text-sm text-slate-500">Read-only information from your account.</p>
            </div>
          </div>
          <dl className="divide-y divide-slate-100 px-5 sm:px-6">
            {fields.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">{label}</dt>
                <dd className="min-w-0 break-words text-sm text-slate-900 sm:col-span-2">
                  {value === null || value === undefined || value === '' ? 'Not provided' : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-5 card p-5 sm:p-6" aria-labelledby="account-options-heading">
        <h3 id="account-options-heading" className="text-base font-semibold text-slate-900">Account options</h3>
        <ul className="mt-4 space-y-4">
          <li className="flex gap-3"><UserRound className="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden="true" /><div><p className="text-sm font-medium text-slate-800">Edit profile</p><p className="mt-1 text-sm text-slate-500">Profile changes are not available in this application.</p></div></li>
          <li className="flex gap-3"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden="true" /><div><p className="text-sm font-medium text-slate-800">Change password</p><p className="mt-1 text-sm text-slate-500">Password changes are not available in this application.</p></div></li>
          <li className="flex gap-3"><ShieldQuestion className="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden="true" /><div><p className="text-sm font-medium text-slate-800">Roles and permissions</p><p className="mt-1 text-sm text-slate-500">Role and permission information is not available.</p></div></li>
        </ul>
      </section>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { studentService } from '../../services/studentService'
import { getErrorMessage } from '../../services/http'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/format'
import Button from '../ui/Button'
import ErrorState from '../ui/ErrorState'
import Modal from '../ui/Modal'
import StudentForm from './StudentForm'

export default function StudentDialog({ mode, selected, onClose, onSaved }) {
  const toast = useToast()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(mode === 'view' || mode === 'edit')
  const [loadError, setLoadError] = useState(null)
  const [revision, setRevision] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [actionError, setActionError] = useState(null)
  const close = useCallback(() => { if (!submitting) onClose() }, [onClose, submitting])

  useEffect(() => {
    if (mode !== 'view' && mode !== 'edit') return
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const result = await studentService.get(selected.id, controller.signal)
        if (!controller.signal.aborted) setStudent(result)
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(getErrorMessage(error, 'Unable to load student.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [mode, selected?.id, revision])

  async function save(values) {
    setSubmitting(true)
    setServerErrors({})
    setActionError(null)
    try {
      if (mode === 'edit') await studentService.update(selected.id, values)
      else await studentService.create(values)
      toast.success(mode === 'edit' ? 'Student updated.' : 'Student added.')
      onSaved(false)
    } catch (error) {
      const response = error.response?.data
      if (error.response?.status === 400 && response && typeof response === 'object' && !Array.isArray(response)) {
        setServerErrors({ ...response, non_field_errors: response.non_field_errors ?? response.detail })
      } else {
        setActionError(getErrorMessage(error, 'Unable to save student.'))
      }
      toast.error('Unable to save student. Please check the form.')
    } finally {
      setSubmitting(false)
    }
  }

  async function remove() {
    setSubmitting(true)
    setActionError(null)
    try {
      await studentService.remove(selected.id)
      toast.success('Student deleted.')
      onSaved(true)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to delete student.')
      setActionError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const title = { create: 'Add student', view: 'Student details', edit: 'Edit student', delete: 'Delete student' }[mode]
  const details = student && [
    ['Name', student.full_name], ['Email', student.email], ['Phone', student.phone],
    ['Age', student.age], ['Gender', student.gender], ['Course', student.course],
    ['Date of birth', formatDate(student.date_of_birth)], ['Enrolled', formatDate(student.enrollment_date)],
    ['Address', student.address],
  ]

  return (
    <Modal title={title} onClose={close}>
      {loading ? <p role="status" className="py-6 text-center text-sm text-slate-500">Loading student...</p> : loadError ? (
        <ErrorState message={loadError} onRetry={() => setRevision((value) => value + 1)} />
      ) : mode === 'view' && student ? (
        <dl className="grid gap-4 sm:grid-cols-2">
          {details.map(([label, value]) => <div key={label} className={label === 'Address' ? 'sm:col-span-2' : ''}><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words text-sm text-slate-800">{value ?? '—'}</dd></div>)}
        </dl>
      ) : mode === 'delete' ? (
        <>
          <p className="text-sm text-slate-700">Delete <strong>{selected.full_name}</strong>? This action cannot be undone.</p>
          {actionError && <p role="alert" className="mt-4 text-sm text-red-700">{actionError}</p>}
          <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={close} disabled={submitting}>Cancel</Button><Button variant="danger" onClick={remove} loading={submitting}>Delete student</Button></div>
        </>
      ) : mode === 'create' || student ? (
        <>
          {actionError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
          <StudentForm student={student} onSubmit={save} onCancel={close} submitting={submitting} serverErrors={serverErrors} onFieldChange={(name) => setServerErrors((errors) => ({ ...errors, [name]: undefined }))} />
        </>
      ) : null}
    </Modal>
  )
}

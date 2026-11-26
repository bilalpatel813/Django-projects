import { useState } from 'react'
import Button from '../ui/Button'

const fields = [
  { name: 'first_name', label: 'First name', maxLength: 50 },
  { name: 'last_name', label: 'Last name', maxLength: 50 },
  { name: 'email', label: 'Email', type: 'email', maxLength: 254 },
  { name: 'phone', label: 'Phone', type: 'tel', maxLength: 15 },
  { name: 'age', label: 'Age', type: 'number', min: 0, step: 1 },
  { name: 'gender', label: 'Gender', type: 'select' },
  { name: 'course', label: 'Course', maxLength: 100 },
  { name: 'date_of_birth', label: 'Date of birth', type: 'date' },
  { name: 'address', label: 'Address', type: 'textarea' },
]

export default function StudentForm({ student, onSubmit, onCancel, submitting, serverErrors }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(({ name }) => [name, student?.[name] ?? ''])))
  const [errors, setErrors] = useState({})

  function handleSubmit(event) {
    event.preventDefault()
    const next = {}
    for (const field of fields) {
      if (String(values[field.name]).trim() === '') next[field.name] = 'This field is required.'
    }
    if (values.age !== '' && (!Number.isInteger(Number(values.age)) || Number(values.age) < 0)) next.age = 'Enter a non-negative whole number.'
    setErrors(next)
    if (Object.keys(next).length) return
    const payload = Object.fromEntries(fields.map(({ name }) => [name, typeof values[name] === 'string' ? values[name].trim() : values[name]]))
    payload.age = Number(payload.age)
    onSubmit(payload)
  }

  const fieldClass = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100'
  return (
    <form onSubmit={handleSubmit}>
      {serverErrors?.non_field_errors && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{[].concat(serverErrors.non_field_errors).join(' ')}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ name, label, type, ...constraints }) => {
          const message = errors[name] || (serverErrors?.[name] && [].concat(serverErrors[name]).join(' '))
          const props = { id: `student-${name}`, name, value: values[name], required: true, ...constraints, 'aria-invalid': Boolean(message), 'aria-describedby': message ? `error-${name}` : undefined, className: fieldClass, onChange: (event) => { setValues({ ...values, [name]: event.target.value }); setErrors({ ...errors, [name]: undefined }) } }
          return (
            <div key={name} className={type === 'textarea' ? 'sm:col-span-2' : ''}>
              <label htmlFor={props.id} className="text-sm font-medium text-slate-700">{label}</label>
              {type === 'select' ? <select {...props}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select> : type === 'textarea' ? <textarea {...props} rows={3} /> : <input {...props} type={type || 'text'} />}
              {message && <p id={`error-${name}`} className="mt-1 text-xs text-red-600">{message}</p>}
            </div>
          )
        })}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" loading={submitting}>{student ? 'Save changes' : 'Add student'}</Button>
      </div>
    </form>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitLead } from '../lib/api'

const COMPANY_SIZES = ['Under $100k ARR', '$100k-$1M ARR', '$1M-$10M ARR', '$10M-$50M ARR', '$50M+ ARR']
const EMPLOYEE_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']
const BUDGETS = ['Under $1k/mo', '$1k-$5k/mo', '$5k-$10k/mo', '$10k-$25k/mo', '$25k+/mo']
const INDUSTRIES = ['SaaS', 'E-commerce', 'Agency', 'Healthcare', 'Finance', 'Education', 'Real Estate', 'Other']

const FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe', required: true },
  { name: 'email', label: 'Work Email', type: 'email', placeholder: 'jane@acme.com', required: true },
  { name: 'company_name', label: 'Company Name', type: 'text', placeholder: 'Acme Inc', required: true },
]

const initial = {
  name: '', email: '', company_name: '',
  company_size: '', employee_size: '', marketing_budget: '',
  industry: '', company_needs: '',
}

export default function LeadForm() {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.company_name.trim()) e.company_name = 'Required'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        company_size: form.company_size || undefined,
        employee_size: form.employee_size || undefined,
        marketing_budget: form.marketing_budget || undefined,
        industry: form.industry || undefined,
        company_needs: form.company_needs || undefined,
      }
      const { id } = await submitLead(payload)
      navigate(`/report/${id}`)
    } catch (err) {
      setErrors({ submit: err?.response?.data?.detail || 'Something went wrong. Please try again.' })
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Text fields */}
      {FIELDS.map(({ name, label, type, placeholder, required }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={type}
            value={form[name]}
            onChange={e => set(name, e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[name] ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
        </div>
      ))}

      {/* Select fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { name: 'company_size', label: 'Company Revenue', opts: COMPANY_SIZES },
          { name: 'employee_size', label: 'Team Size', opts: EMPLOYEE_SIZES },
          { name: 'marketing_budget', label: 'Marketing Budget', opts: BUDGETS },
          { name: 'industry', label: 'Industry', opts: INDUSTRIES },
        ].map(({ name, label, opts }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
              value={form[name]}
              onChange={e => set(name, e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select…</option>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Needs textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What does your company need most right now?
        </label>
        <textarea
          value={form.company_needs}
          onChange={e => set('company_needs', e.target.value)}
          rows={4}
          placeholder="e.g. We need help with paid acquisition, SEO, and growing our email list…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {errors.submit && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errors.submit}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Submitting…' : 'Score My Lead →'}
      </button>
    </form>
  )
}

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Text fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FIELDS.map(({ name, label, type, placeholder, required }) => (
          <div key={name} className={name === 'company_name' ? 'md:col-span-2' : ''}>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {label} {required && <span className="text-indigo-400">*</span>}
            </label>
            <input
              type={type}
              value={form[name]}
              onChange={e => set(name, e.target.value)}
              placeholder={placeholder}
              className={`input-field ${errors[name] ? 'border-red-500/50 ring-red-500/10' : ''}`}
            />
            {errors[name] && <p className="mt-2 text-xs text-red-400">{errors[name]}</p>}
          </div>
        ))}
      </div>

      {/* Select fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { name: 'company_size', label: 'Company Revenue', opts: COMPANY_SIZES },
          { name: 'employee_size', label: 'Team Size', opts: EMPLOYEE_SIZES },
          { name: 'marketing_budget', label: 'Marketing Budget', opts: BUDGETS },
          { name: 'industry', label: 'Industry', opts: INDUSTRIES },
        ].map(({ name, label, opts }) => (
          <div key={name}>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
            <select
              value={form[name]}
              onChange={e => set(name, e.target.value)}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">Select...</option>
              {opts.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Needs textarea */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          What does your company need most right now?
        </label>
        <textarea
          value={form.company_needs}
          onChange={e => set('company_needs', e.target.value)}
          rows={4}
          placeholder="e.g. We need help with paid acquisition, SEO, and growing our email list..."
          className="input-field resize-none"
        />
      </div>

      {errors.submit && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full py-4 text-lg"
      >
        {submitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing Lead...
          </span>
        ) : 'Score My Lead →'}
      </button>
    </form>
  )
}

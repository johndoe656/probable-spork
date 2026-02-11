import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const submitApplication = async (formData) => {
  const { data, error } = await supabase
    .from('applications')
    .insert([
      {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        experience: formData.experience,
        employment_type: formData.employmentType,
        start_date: formData.startDate,
        resume_link: formData.resumeLink,
        work_authorization: formData.workAuthorization,
        selected_shift: formData.selectedShift,
        source_campaign: 'tiktok',
        source_url: window.location.href,
        user_agent: navigator.userAgent,
        submission_status: 'pending'
      }
    ])

  if (error) {
    console.error('Application submission error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export const getApplicationMetrics = async () => {
  const { data, error } = await supabase
    .from('application_metrics')
    .select('*')
    .order('metric_date', { ascending: false })

  if (error) {
    console.error('Metrics fetch error:', error)
    return []
  }

  return data || []
}

export const getContentPrompts = async (category = null) => {
  let query = supabase
    .from('content_prompts')
    .select('*')
    .eq('content_status', 'active')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query.order('authenticity_score', { ascending: false })

  if (error) {
    console.error('Content prompts fetch error:', error)
    return []
  }

  return data || []
}

export const updatePromptMetrics = async (promptId, views = 0, clicks = 0, conversions = 0) => {
  const { data, error } = await supabase
    .from('content_prompts')
    .update({
      views: views + 1,
      clicks,
      conversions
    })
    .eq('id', promptId)

  if (error) {
    console.error('Metrics update error:', error)
    return false
  }

  return true
}

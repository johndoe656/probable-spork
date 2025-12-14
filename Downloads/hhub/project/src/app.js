import { submitApplication, getApplicationMetrics, getContentPrompts } from './supabase.js'
import { Analytics } from './analytics.js'
import { contentPrompts, getRandomPrompt, getAllCategories } from './contentPrompts.js'

export const initializeApp = () => {
  const applicationForm = document.getElementById('application-form')

  if (applicationForm) {
    applicationForm.addEventListener('submit', handleFormSubmit)
  }

  initializeEventListeners()
}

const handleFormSubmit = async (e) => {
  e.preventDefault()

  const form = e.target
  const submitButton = form.querySelector('#submit-button')
  const statusMessage = form.querySelector('#status-message')
  const originalText = submitButton.textContent

  submitButton.disabled = true
  submitButton.textContent = 'Submitting...'

  try {
    const formData = new FormData(form)
    const data = {
      fullName: formData.get('fullName'),
      email: formData.get('_replyto'),
      phone: formData.get('phone'),
      city: formData.get('city'),
      state: formData.get('state'),
      experience: formData.get('experience'),
      employmentType: formData.get('employmentType'),
      startDate: formData.get('startDate'),
      resumeLink: formData.get('resumeLink'),
      workAuthorization: formData.get('workAuthorization') === 'on',
      selectedShift: formData.get('selectedShift')
    }

    const result = await submitApplication(data)

    if (result.success) {
      statusMessage.textContent = '✅ Application submitted successfully! Check your email within 24-48 hours.'
      statusMessage.classList.add('text-green-500')
      statusMessage.classList.remove('text-red-500', 'hidden')
      form.reset()

      setTimeout(() => {
        window.closeApplicationModal?.()
      }, 2000)
    } else {
      statusMessage.textContent = `❌ Error: ${result.error}`
      statusMessage.classList.add('text-red-500')
      statusMessage.classList.remove('text-green-500', 'hidden')
    }
  } catch (error) {
    statusMessage.textContent = '❌ An error occurred. Please try again.'
    statusMessage.classList.add('text-red-500')
    statusMessage.classList.remove('text-green-500', 'hidden')
    console.error('Form submission error:', error)
  } finally {
    submitButton.disabled = false
    submitButton.textContent = originalText
  }
}

const initializeEventListeners = () => {
  const modal = document.getElementById('applicationModal')
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.closeApplicationModal?.()
      }
    })
  }
}

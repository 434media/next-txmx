'use server'

export async function submitCustomPackageInquiry(formData: {
  name: string
  company: string
  email: string
  phone: string
  message: string
}) {
  // In a real application, this would save to a database or send an email
  console.log('Custom package inquiry received:', formData)
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return { success: true }
}

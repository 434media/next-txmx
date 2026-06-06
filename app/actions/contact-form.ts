'use server'

import { firestore } from '../../lib/firebase-admin'

export async function submitCustomPackageInquiry(formData: {
  name: string
  company: string
  email: string
  phone: string
  message: string
}) {
  await firestore.collection('customPackageInquiries').add({
    name: formData.name || '',
    company: formData.company || '',
    email: (formData.email || '').trim().toLowerCase(),
    phone: formData.phone || '',
    message: formData.message || '',
    createdAt: new Date().toISOString(),
  })

  return { success: true }
}

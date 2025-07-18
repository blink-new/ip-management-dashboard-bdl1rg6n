import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { FilingsList } from '@/components/filings/FilingsList'
import { FilingForm } from '@/components/filings/FilingForm'
import { FilingDetail } from '@/components/filings/FilingDetail'

export function FilingsModule() {
  return (
    <Routes>
      <Route index element={<FilingsList />} />
      <Route path="new" element={<FilingForm />} />
      <Route path=":id" element={<FilingDetail />} />
      <Route path=":id/edit" element={<FilingForm />} />
    </Routes>
  )
}
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FilingsList } from '../filings/FilingsList';
import { FilingForm } from '../filings/FilingForm';
import { FilingDetail } from '../filings/FilingDetail';

export function FilingsModule() {
  return (
    <Routes>
      <Route index element={<FilingsList />} />
      <Route path="new" element={<FilingForm />} />
      <Route path=":id" element={<FilingDetail />} />
    </Routes>
  );
}
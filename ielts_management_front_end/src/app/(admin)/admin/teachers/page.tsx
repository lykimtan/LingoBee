"use client";

import React, { useState } from 'react';
import { TeachersHeader } from '@/components/admin/teachers/TeachersHeader';
import { TeachersStats } from '@/components/admin/teachers/TeachersStats';
import { TeachersFilter } from '@/components/admin/teachers/TeachersFilter';
import { TeachersTable } from '@/components/admin/teachers/TeachersTable';

export default function TeachersManagementPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    courseId: "all"
  });

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <TeachersHeader />
      <TeachersStats />
      <TeachersFilter filters={filters} setFilters={setFilters} />
      <TeachersTable filters={filters} />
    </div>
  );
}

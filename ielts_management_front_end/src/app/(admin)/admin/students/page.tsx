"use client";

import React, { useState } from 'react';
import { StudentsHeader } from '@/components/admin/students/StudentsHeader';
import { StudentsStats } from '@/components/admin/students/StudentsStats';
import { StudentsFilter } from '@/components/admin/students/StudentsFilter';
import { StudentsTable } from '@/components/admin/students/StudentsTable';

export default function StudentsManagementPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    courseId: "all"
  });

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      <StudentsHeader />
      <StudentsStats />
      <StudentsFilter filters={filters} setFilters={setFilters} />
      <StudentsTable filters={filters} />
    </div>
  );
}

import React from 'react';
import { PaymentsManager } from '@/components/admin/payments/PaymentsManager';

export default function AdminPaymentsPage() {
  return (
    <div className="flex flex-col h-full bg-[#0a1a1c] min-h-screen">
      <PaymentsManager />
    </div>
  );
}

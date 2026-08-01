import React from 'react';
import { PaymentsManager } from '@/components/admin/payments/PaymentsManager';

export default function AdminPaymentsPage() {
  return (
    <div className="flex flex-col h-full">
      <PaymentsManager />
    </div>
  );
}

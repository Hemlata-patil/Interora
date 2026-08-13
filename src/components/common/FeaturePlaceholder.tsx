import React from 'react';
import { PageHeader, Card, Alert } from '@/components';

export const FeaturePlaceholder: React.FC<{ title: string; category: string }> = ({ title, category }) => {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={`Module: ${category}`} />
      <Alert type="info" title="Feature Module Foundation">
        The route and modular folder for <strong>{title}</strong> are established. Feature logic will be implemented by the assigned team member in upcoming branch sprints.
      </Alert>
      <Card title={`${title} Overview`}>
        <div className="p-8 text-center text-slate-400 text-sm">
          Placeholder module view ready for feature development.
        </div>
      </Card>
    </div>
  );
};

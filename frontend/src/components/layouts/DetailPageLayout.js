import React from 'react';
import PageLayout from '../ui/PageLayout';

const DetailPageLayout = ({
  breadcrumb,
  actions,
  loading,
  error,
  onRetry,
  children,
  container = 'narrow',
}) => (
  <PageLayout>
    <PageLayout.Header>
      <PageLayout.Header.TitleRow breadcrumb={breadcrumb} actions={actions} />
    </PageLayout.Header>

    {loading ? (
      <PageLayout.Loading />
    ) : error ? (
      <PageLayout.Error message={error} onRetry={onRetry} />
    ) : (
      <PageLayout.Content container={container}>{children}</PageLayout.Content>
    )}
  </PageLayout>
);

export default DetailPageLayout;

import React from 'react';
import PageLayout from '../ui/PageLayout';
import Button from '../ui/Button';

const ListPageLayout = ({
  title,
  icon,
  actions,
  tabs,
  activeTab,
  onTabChange,
  tabActions,
  filters,
  loading,
  empty,
  emptyMessage,
  children,
}) => (
  <PageLayout>
    <PageLayout.Header>
      <PageLayout.Header.TitleRow icon={icon} title={title} actions={actions} />
      {tabs && (
        <PageLayout.Header.TabRow actions={tabActions}>
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="secondary"
              size="sm"
              className={
                activeTab === tab.id ? 'border-accent bg-background-tertiary text-text-primary' : ''
              }
              onClick={() => onTabChange(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </PageLayout.Header.TabRow>
      )}
      {filters && <PageLayout.Header.FilterRow>{filters}</PageLayout.Header.FilterRow>}
    </PageLayout.Header>

    {loading ? (
      <PageLayout.Loading />
    ) : empty ? (
      <PageLayout.Empty message={emptyMessage} />
    ) : (
      <PageLayout.Content container="default">{children}</PageLayout.Content>
    )}
  </PageLayout>
);

export default ListPageLayout;

import React from 'react';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Specific schema components
export function WebsiteSchema({ data }: { data: Record<string, unknown> }) {
  return <JsonLd data={data} />;
}

export function ArticleSchema({ data }: { data: Record<string, unknown> }) {
  return <JsonLd data={data} />;
}

export function BreadcrumbSchema({ data }: { data: Record<string, unknown> }) {
  return <JsonLd data={data} />;
}

export function PersonSchema({ data }: { data: Record<string, unknown> }) {
  return <JsonLd data={data} />;
}

export function ResearchProjectSchema({
  data,
}: {
  data: Record<string, unknown>;
}) {
  return <JsonLd data={data} />;
}

export function ScholarlyArticleSchema({
  data,
}: {
  data: Record<string, unknown>;
}) {
  return <JsonLd data={data} />;
}

export function FAQSchema({ data }: { data: Record<string, unknown> }) {
  return <JsonLd data={data} />;
}

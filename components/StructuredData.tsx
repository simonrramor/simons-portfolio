type Schema = { '@type': string; '@id': string; [key: string]: unknown };

// Keep each entity explicit for consumers that read only top-level schema types.
export default function StructuredData({ schemas }: { schemas: Schema[] }) {
  return schemas.map(schema => (
    <script
      key={schema['@id']}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...schema }).replace(/</g, '\u003c') }}
    />
  ));
}

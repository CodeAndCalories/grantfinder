import Link from 'next/link';
export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">About Grant Locate</h1>
      <p className="text-xl text-gray-600 mb-8">
        Finding Opportunities. Empowering Growth.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Why Grant Locate?</h2>
          <p className="mb-4">
            GrantLocate.com was founded in 2026 to bring transparency to the grant discovery process.
            We believe that finding funding shouldn't be a gatekept secret.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Developer-Led:</strong> Our search logic is hand-coded for speed and precision.</li>
            <li><strong>Privacy-First:</strong> We don't require accounts. Your search for funding is your business.</li>
            <li><strong>Educational:</strong> We provide guides to help you write better proposals, not just find links.</li>
          </ul>
        </section>
        <section className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="font-bold mb-2">Our Disclaimer</h3>
          <p className="text-sm text-gray-600">
            GrantLocate.com is an independent platform. We are not a government agency and we do not
            provide funding. All eligibility is determined by the granting organization.
          </p>
        </section>
      </div>
    </div>
  );
}

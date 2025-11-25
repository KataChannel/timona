export function Features() {
  const features = [
    {
      name: 'Modern Stack',
      description: 'Built with the latest technologies including Next.js 15, NestJS, and TypeScript.',
      icon: '🚀',
    },
    {
      name: 'GraphQL API',
      description: 'Type-safe API with GraphQL, Apollo Server, and code generation.',
      icon: '📊',
    },
    {
      name: 'Database Ready',
      description: 'PostgreSQL with Prisma ORM for type-safe database operations.',
      icon: '🗄️',
    },
    {
      name: 'Caching & Storage',
      description: 'Redis for caching and Minio for S3-compatible object storage.',
      icon: '⚡',
    },
    {
      name: 'Authentication',
      description: 'JWT-based authentication with Passport.js and secure session management.',
      icon: '🔐',
    },
    {
      name: 'Docker Ready',
      description: 'Multi-stage Dockerfiles and Docker Compose for easy deployment.',
      icon: '🐳',
    },
  ];

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to build modern apps
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            A comprehensive starter kit with all the tools and best practices you need to build scalable enterprise applications.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-2xl">
                    {feature.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

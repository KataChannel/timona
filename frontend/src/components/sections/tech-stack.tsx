export function TechStack() {
  const technologies = [
    { name: 'Next.js', description: 'React framework for production', icon: '⚛️' },
    { name: 'NestJS', description: 'Progressive Node.js framework', icon: '🪶' },
    { name: 'TypeScript', description: 'Type-safe JavaScript', icon: '📘' },
    { name: 'GraphQL', description: 'Query language for APIs', icon: '🔗' },
    { name: 'Prisma', description: 'Next-generation ORM', icon: '💎' },
    { name: 'PostgreSQL', description: 'Advanced open-source database', icon: '🐘' },
    { name: 'Redis', description: 'In-memory data structure store', icon: '🔥' },
    { name: 'Minio', description: 'S3-compatible object storage', icon: '☁️' },
    { name: 'Docker', description: 'Containerization platform', icon: '🐳' },
    { name: 'Bun', description: 'Fast JavaScript runtime', icon: '🥟' },
    { name: 'TailwindCSS', description: 'Utility-first CSS framework', icon: '🎨' },
    { name: 'Apollo', description: 'GraphQL implementation', icon: '🚀' },
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Tech Stack</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Built with modern technologies
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Carefully selected technologies that work together to provide the best developer experience and production performance.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
            {technologies.map((tech) => (
              <div key={tech.name} className="col-span-1 flex flex-col items-center justify-center">
                <div className="text-4xl mb-2">{tech.icon}</div>
                <h3 className="text-lg font-medium text-gray-900 text-center">{tech.name}</h3>
                <p className="text-sm text-gray-500 text-center">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

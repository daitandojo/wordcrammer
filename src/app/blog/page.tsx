import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'

const posts = [
  {
    slug: 'atomic-phrases-vs-single-words',
    title: 'Atomic Phrases vs Single Words — Why Phrases Win',
    excerpt: 'Research shows that learning atomic phrases ("the cat sleeps") rather than isolated words ("sleep") improves recall by up to 60%. Here\'s why WordCrammer uses phrases.',
    date: '2026-05-10',
    readTime: '4 min',
  },
  {
    slug: '200-minutes-to-fluency',
    title: 'Can You Really Learn a Language in 200 Minutes?',
    excerpt: 'The 1,200 most common atomic phrases cover ~85% of daily conversation. At 40 phrases per 20-minute session, basic fluency is 30 sessions — about 10 hours of focused study.',
    date: '2026-05-08',
    readTime: '5 min',
  },
  {
    slug: 'spaced-repetition-vocabulary',
    title: 'The Science of Spaced Repetition for Vocabulary',
    excerpt: 'Why getting it right twice at spaced intervals beats cramming 10 times in one sitting. The cognitive science behind WordCrammer\'s 2-correct rule.',
    date: '2026-05-05',
    readTime: '6 min',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen px-4 py-24 relative overflow-hidden bg-mesh">
      <div className="deco-blob deco-blob-1 animate-float" style={{ top: '10%', left: '-5%' }} />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            WordCrammer <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-slate-400 text-sm">Language learning insights, science, and tips.</p>
        </div>
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block glass rounded-2xl p-6 border border-white/10 hover:bg-white/[0.06] transition-all group">
              <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-2">
                <Calendar className="w-3 h-3" />
                <span>{post.date}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span>{post.readTime}</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{post.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center gap-1 text-xs text-blue-400 mt-3 group-hover:gap-2 transition-all">
                Read more <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

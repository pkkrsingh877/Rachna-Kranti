'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { PenLine, BookOpen, Drama, Sparkles, Wand2, ArrowRight, Quote } from 'lucide-react';
import { useContents } from '@/hooks/use-content';

import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/Avatar';
import { RevealSection } from '@/components/landing/RevealSection';

const writingModes = [
  {
    icon: PenLine,
    label: 'Poems',
    description: 'Verses, rhymes, and free verse. Let the words flow.',
    color: 'from-brand-600/20 to-transparent',
    iconColor: 'text-brand-600',
    bgColor: 'bg-brand-600/10',
    href: '/content/write',
  },
  {
    icon: BookOpen,
    label: 'Stories',
    description: 'Short stories, flash fiction, and serialized narratives.',
    color: 'from-secondary/20 to-transparent',
    iconColor: 'text-secondary-foreground',
    bgColor: 'bg-secondary/20',
    href: '/content/write',
  },
  {
    icon: Drama,
    label: 'Dramas',
    description: 'Scripts, scenes, and acts. Full playwriting tools.',
    color: 'from-amber-500/20 to-transparent',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    href: '/dramas/create',
  },
  {
    icon: BookOpen,
    label: 'Books',
    description: 'Chapter-by-chapter. From outline to publication.',
    color: 'from-emerald-500/20 to-transparent',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    href: '/books/create',
  },
];

function WritingModeTile({
  mode,
  index,
}: {
  mode: typeof writingModes[0];
  index: number;
}) {
  const router = useRouter();
  const Icon = mode.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      onClick={() => router.push(mode.href)}
      className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-brand-600/30"
    >
      <div className={`w-10 h-10 rounded-xl ${mode.bgColor} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${mode.iconColor}`} />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{mode.label}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{mode.description}</p>
      <span className="text-xs text-brand-600 font-medium mt-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Start writing <ArrowRight className="w-3 h-3" />
      </span>
    </motion.button>
  );
}

export default function Home() {
  const router = useRouter();
  const { data: poems } = useContents({ type: 'poem', limit: 4, sort: 'recent' });
  const { data: stories } = useContents({ type: 'story', limit: 4, sort: 'recent' });

  const featuredPoems = poems?.results?.slice(0, 4) ?? [];
  const featuredStories = stories?.results?.slice(0, 4) ?? [];

  const allFeatured = [...featuredPoems, ...featuredStories].slice(0, 5);

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[90dvh] flex items-center border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/[0.03] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto w-full px-6 md:px-10 py-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-600/10 text-brand-600 text-xs font-medium mb-6">
                <Sparkles className="w-3 h-3" />
                AI-powered creative writing
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]"
            >
              Where your stories
              <br />
              <span className="text-brand-600">find their voice</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              Rachna Kranti is a creative writing platform with AI-powered assistance. Write poems, stories, dramas, and books — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-3 mt-8"
            >
              <Button size="lg" onClick={() => router.push('/content/write')}>
                <PenLine className="w-4 h-4" />
                Start writing
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/content')}>
                Browse writing
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <RevealSection>
        <section className="py-20 md:py-28 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="max-w-xl mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Four ways to write
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Whether you write poetry, prose, plays, or full-length books, Rachna Kranti has tools designed for each form.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {writingModes.map((mode, i) => (
                <WritingModeTile key={mode.label} mode={mode} index={i} />
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="py-20 md:py-28 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Write with AI by your side
                </h2>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  Stuck on a line? Need to expand an idea? Our AI assistant helps you generate content, refine your prose, and overcome writer&apos;s block — without taking over your voice.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    'Generate poetry and prose from prompts',
                    'Expand scenes and chapters with context-aware suggestions',
                    'Refine your writing while keeping your unique style',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                      <Wand2 className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="mt-6" onClick={() => router.push('/content/generate')}>
                  Try AI generation <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl border border-border bg-muted/50 flex items-center justify-center p-8">
                  <div className="text-center">
                    <Wand2 className="w-8 h-8 text-brand-600/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground italic">
                      &ldquo;Write a poem about autumn in the style of Robert Frost&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {allFeatured.length > 0 && (
        <RevealSection>
          <section className="py-20 md:py-28 border-b border-border">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
              <div className="flex items-end justify-between mb-10">
                <div className="max-w-xl">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Recent writing
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    What the community is creating
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => router.push('/content')}>
                  View all <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <div className="divide-y divide-border">
                {allFeatured.slice(0, 4).map((item, i) => (
                  <motion.button
                    key={item._id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    onClick={() => router.push(`/content/${item._id}`)}
                    className="group flex items-start gap-4 py-5 w-full text-left transition-colors hover:bg-muted/30 -mx-4 px-4 rounded-lg"
                  >
                    {item.authorId && (
                      <Avatar src={item.authorId.image} name={item.authorId.name} size="sm" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.authorId?.name ?? 'Unknown'} · {item.likesCount} likes
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </motion.button>
                ))}
              </div>
              <div className="mt-6 text-center sm:hidden">
                <Button variant="ghost" size="sm" onClick={() => router.push('/content')}>
                  View all <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      <RevealSection>
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
            <div className="max-w-lg mx-auto">
              <Quote className="w-8 h-8 text-brand-600/30 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Ready to share your voice?
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Join a community of writers using AI to push their craft further. No gatekeepers, just creativity.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <Button size="lg" onClick={() => router.push('/register')}>
                  <PenLine className="w-4 h-4" />
                  Start writing free
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push('/content')}>
                  Browse gallery
                </Button>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>
    </div>
  );
}

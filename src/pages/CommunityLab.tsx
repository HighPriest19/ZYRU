import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, MessageSquare, Share2, Timer, CheckCircle2, TrendingUp, Award, Trophy, Coins, Users, Send, Image as ImageIcon } from 'lucide-react';
import { getActivePolls, voteInPoll, getUserProfile, getActiveChallenges } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Poll, Challenge, UserProfile } from '../types';

interface SQLPost {
  id: number;
  userId: string;
  content: string;
  imageUrl: string | null;
  likes: number;
  createdAt: string;
}

export function CommunityLab() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [votedPolls, setVotedPolls] = useState<string[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [sqlPosts, setSqlPosts] = useState<SQLPost[]>([]);
  const [isSqlActive, setIsSqlActive] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [pollsData, challengesData, postsRes] = await Promise.all([
          getActivePolls(),
          getActiveChallenges(),
          fetch('/api/posts').then(async res => {
            if (res.status === 503) {
              setIsSqlActive(false);
              return [];
            }
            return res.json();
          })
        ]);
        setPolls(pollsData as Poll[]);
        setChallenges(challengesData as Challenge[]);
        setSqlPosts(postsRes);

        if (user) {
          const up = await getUserProfile(user.uid);
          setProfile(up);
        }
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostContent.trim()) return;

    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newPostContent })
      });

      if (response.ok) {
        const newPost = await response.json();
        setSqlPosts([newPost, ...sqlPosts]);
        setNewPostContent('');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) {
      alert('Please sign in to vote and earn impact points.');
      return;
    }
    if (votedPolls.includes(pollId)) return;

    try {
      await voteInPoll(pollId, optionId, user.uid);
      setVotedPolls([...votedPolls, pollId]);
      
      // Update local state for immediate feedback
      setPolls(prev => prev.map(p => {
        if (p.id === pollId) {
          return {
            ...p,
            options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o)
          };
        }
        return p;
      }));

      // Refresh profile to show new points
      const up = await getUserProfile(user.uid);
      setProfile(up);
    } catch (error) {
      console.error('Voting failed:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-editorial-bg min-h-screen">
      <header className="mb-20 border-b border-editorial-text pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Award size={18} className="text-editorial-text" />
              <span className="label-text opacity-40 uppercase tracking-[0.3em] font-bold">Community Lab // Alpha Phase</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif leading-none tracking-tighter">THE <span className="italic">VOICE</span> OF ZYRU™</h1>
            <p className="text-lg text-editorial-text/70 mt-8 font-light leading-relaxed max-w-2xl">
              Participation is production. Vote on concepts, enter challenges, and earn ZYRU™ loyalty points. 
              Your vision directly influences which designs enter the official archive.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-editorial-text text-white p-8 min-w-[200px] border border-white/5 relative overflow-hidden group">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50 mb-2 relative z-10">Loyalty Points</p>
              <p className="text-4xl font-mono font-bold relative z-10 flex items-center gap-3">
                {profile?.loyaltyPoints || 0} <Coins size={24} className="opacity-40" />
              </p>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Trophy size={80} />
              </div>
            </div>
            {!user && (
              <p className="text-[10px] text-center italic opacity-40 uppercase tracking-widest">Sign in to earn rewards</p>
            )}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {[1, 2].map(i => <div key={i} className="animate-pulse bg-editorial-accent/30 h-80 border border-editorial-text/10" />)}
          </div>
          <div className="space-y-12">
            <div className="animate-pulse bg-editorial-accent/30 h-96 border border-editorial-text/10" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Feed: Polls & Concepts */}
          <div className="lg:col-span-2 space-y-24">
            {polls.length > 0 ? polls.map((poll) => {
              const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
              const hasVoted = votedPolls.includes(poll.id);

              return (
                <motion.section 
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3 text-editorial-text">
                      <div className="p-2 bg-editorial-accent rounded-full"><Timer size={14} /></div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Decision Pending</span>
                    </div>
                    <div className="flex items-center space-x-6 text-editorial-text/40 text-[10px] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Users size={12} /> {totalVotes} Contributions</span>
                      <span className="opacity-20">//</span>
                      <span>Ends: {new Date(poll.endsAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <h2 className="text-4xl font-serif mb-6 italic tracking-tight">{poll.title}</h2>
                  <p className="text-editorial-text/60 mb-12 font-light text-base leading-relaxed max-w-xl">{poll.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {poll.options.map((option) => (
                      <button 
                        key={option.id}
                        disabled={hasVoted}
                        onClick={() => handleVote(poll.id, option.id)}
                        className={`group relative p-6 border transition-all text-left flex flex-col ${
                          hasVoted && option.votes === Math.max(...poll.options.map(o => o.votes))
                            ? 'border-editorial-text bg-editorial-accent' 
                            : hasVoted ? 'opacity-40 border-editorial-text/5' : 'border-editorial-text/10 hover:border-editorial-text'
                        }`}
                      >
                        {option.image && (
                          <div className="aspect-square bg-editorial-muted overflow-hidden mb-6 border border-editorial-text/5">
                            <img 
                              src={option.image} 
                              alt={option.label}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>
                        )}
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-6">
                            <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-[70%]">{option.label}</p>
                            {hasVoted && (
                              <span className="text-[11px] font-mono font-bold italic">
                                {Math.round((option.votes / (totalVotes || 1)) * 100)}%
                              </span>
                            )}
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="relative h-[1px] bg-editorial-text/10 w-full mb-6 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: hasVoted ? `${(option.votes / (totalVotes || 1)) * 100}%` : 0 }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="absolute inset-y-0 left-0 bg-editorial-text"
                            />
                          </div>
                          
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">
                            <span>{option.votes} Votes</span>
                            {hasVoted && (
                              <span className="flex items-center text-editorial-text">
                                <CheckCircle2 size={10} className="mr-2" /> Recorded
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.section>
              );
            }) : (
              <div className="py-32 border border-dashed border-editorial-text/10 bg-editorial-accent/20 text-center">
                <p className="text-xl font-serif italic opacity-40 mb-4">No active design polls yet.</p>
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-20">Monitoring Next Collection Cycle</p>
                <p className="text-[9px] mt-8 uppercase tracking-widest opacity-40 leading-relaxed max-w-xs mx-auto">This lab activates when the ZYRU™ design team uploads new official concepts for community review.</p>
              </div>
            )}

            {/* Community Feed (SQL Backed) */}
            <section className="pt-24 border-t border-editorial-text/10">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-serif italic mb-4">Community Vision Feed</h2>
                  <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-bold">Relational Database // Real-time SQL Sync</p>
                </div>
              </div>

              {!isSqlActive ? (
                <div className="py-32 border border-dashed border-editorial-text/10 bg-editorial-accent/20 flex flex-col items-center justify-center text-center p-12">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 mb-6">Network Service Required</span>
                  <h3 className="text-2xl font-serif italic mb-4">Relational Feed Offline</h3>
                  <p className="max-w-md text-[11px] leading-relaxed opacity-60 uppercase tracking-widest">
                    The Cloud SQL database is not currently active for this environment. 
                    Main store features remain functional via the primary Firebase registry.
                  </p>
                </div>
              ) : (
                <>
                  {user && (
                    <form onSubmit={handleCreatePost} className="mb-20 bg-white border border-editorial-text/10 p-8">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 bg-editorial-accent flex items-center justify-center font-serif italic text-xl border border-editorial-text/5">
                          {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-grow">
                          <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Describe your vision for the next ZYRU™ drop..."
                            className="w-full bg-transparent border-none focus:ring-0 text-lg font-light resize-none min-h-[120px]"
                          />
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-editorial-text/5">
                            <button type="button" className="text-editorial-text/40 hover:text-editorial-text transition-colors">
                              <ImageIcon size={18} />
                            </button>
                            <button 
                              type="submit" 
                              disabled={submitting || !newPostContent.trim()}
                              className="bg-editorial-text text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 hover:bg-gray-800 disabled:opacity-30 transition-all"
                            >
                              {submitting ? 'Transmitting...' : (
                                <>Transmit <Send size={12} /></>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="space-y-16">
                    <AnimatePresence mode="popLayout">
                      {sqlPosts.map((post) => (
                        <motion.div 
                          key={post.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="group"
                        >
                          <div className="flex items-start gap-8">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-1px h-12 bg-editorial-text/10" />
                              <div className="p-3 border border-editorial-text/10 rounded-full group-hover:bg-editorial-accent transition-colors">
                                <Users size={14} className="opacity-40" />
                              </div>
                            </div>
                            <div className="flex-grow pt-12 pb-12 border-b border-editorial-text/5">
                              <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
                                  UID: {post.userId.substring(0, 8)}...
                                </span>
                                <span className="text-[9px] font-mono opacity-20">
                                  {new Date(post.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xl font-light leading-relaxed mb-8">{post.content}</p>
                              <div className="flex items-center gap-8">
                                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                                  <ThumbsUp size={14} /> {post.likes} Impact
                                </button>
                                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                                  <MessageSquare size={14} /> Respond
                                </button>
                                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                                  <Share2 size={14} /> Extract
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {sqlPosts.length === 0 && (
                      <div className="py-20 text-center border border-dashed border-editorial-text/5 opacity-40 italic">
                        The vision feed is currently silent. Be the first to transmit.
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-16">
            <section className="bg-editorial-text text-white p-10 border border-white/5 relative overflow-hidden group">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-12 border-b border-white/10 pb-6 flex items-center justify-between">
                <span>Leaderboard</span>
                <TrendingUp size={14} className="opacity-40" />
              </h3>
              <div className="py-12 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 italic">Calculating Rankings...</p>
                <p className="text-[9px] mt-4 uppercase tracking-widest opacity-20">Points from polls and challenges appear here.</p>
              </div>
            </section>

            <section className="border border-editorial-text/10 p-10 bg-white">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Monthly Challenge</h3>
                <span className="p-2 bg-editorial-accent rounded-full"><Trophy size={14} /></span>
              </div>
              
              {challenges.length > 0 ? (
                <div className="space-y-8">
                  {challenges.map(c => (
                    <div key={c.id}>
                      <div className="aspect-[4/5] bg-editorial-accent mb-6 overflow-hidden border border-editorial-text/5 group">
                        {c.thumbnail ? (
                          <img src={c.thumbnail} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] opacity-20 uppercase tracking-[0.4em]">Asset Preview</div>
                        )}
                      </div>
                      <h4 className="text-xl font-serif italic mb-3">{c.title}</h4>
                      <p className="text-[11px] text-editorial-text/50 mb-8 font-light leading-relaxed uppercase tracking-widest">{c.description}</p>
                      <div className="flex justify-between items-center mb-8 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <span className="opacity-40">Reward</span>
                        <span className="text-editorial-text">{c.reward}</span>
                      </div>
                      <button className="w-full bg-editorial-text text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all">
                        Enter Challenge
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                   <p className="text-[10px] opacity-40 uppercase tracking-[0.4em] italic mb-2">No Active Challenge</p>
                   <p className="text-[9px] opacity-20 uppercase tracking-widest">Resets in 4 days</p>
                </div>
              )}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

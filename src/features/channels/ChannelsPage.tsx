import { useQuery } from '@tanstack/react-query';
import { loadChannelProfile } from '../../lib/parsers/channels';
import { loadComments } from '../../lib/parsers/comments';
import { loadLiveChats } from '../../lib/parsers/liveChats';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { Tv, ExternalLink, ShieldCheck, MessageSquare, MessageCircle, User } from 'lucide-react';

export function ChannelsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['channel-profile-data'],
    queryFn: async () => {
      const [profile, comments, liveChats] = await Promise.all([
        loadChannelProfile(),
        loadComments().catch(() => []),
        loadLiveChats().catch(() => []),
      ]);

      return { profile, commentsCount: comments.length, liveChatsCount: liveChats.length };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return <ErrorFallback onRetry={() => refetch()} />;
  }

  if (!data?.profile) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/15 shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight">
                Channel Profile
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Exported settings, account identity, and creator configuration.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center mx-auto text-neutral-400">
            <Tv className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            Channel Profile Not Included
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            Channel settings and profile data were not detected in this Takeout export. When requesting your Google Takeout archive, ensure YouTube channel settings are checked.
          </p>
        </div>
      </div>
    );
  }

  const { profile, commentsCount, liveChatsCount } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/15 shrink-0">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight">
              Channel Profile
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Exported settings, account identity, and creator configuration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <span className="font-semibold text-neutral-900 dark:text-white">Active Channel</span>
          </div>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/6 dark:border-white/8">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 border border-black/5 dark:border-white/5">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
                {profile.channelTitle}
              </h3>
              {profile.vanityUrl && (
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  @{profile.vanityUrl}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="emerald">{profile.visibility}</Badge>
            <a
              href={`https://www.youtube.com/channel/${profile.channelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>View Channel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Activity Summary Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-xs text-slate-400">Total Video Comments</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{commentsCount}</div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            <div>
              <div className="text-xs text-slate-400">Live Chat Messages</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{liveChatsCount}</div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Channel Configuration & Default Settings
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Channel ID</span>
              <span className="font-mono text-slate-900 dark:text-white">{profile.channelId}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Auto Moderation (Live Chat)</span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {profile.autoModeration ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Default Comment Type</span>
              <span className="font-semibold text-slate-900 dark:text-white">{profile.defaultAllowedCommentsType}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Targeted Audience</span>
              <span className="font-semibold text-slate-900 dark:text-white">{profile.defaultTargetedAudience}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

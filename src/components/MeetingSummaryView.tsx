import React, { useState } from 'react';
import type { MeetingSummary, TaskNode } from '../types';
import * as Progress from '@radix-ui/react-progress';
import { SAMPLE_MEETING_AUDIO } from '../engine/demoScenarios';
import { Mic, CheckCircle2, Play, Pause, Sparkles, Plus } from 'lucide-react';

interface MeetingSummaryViewProps {
  onMergeMeetingTasks?: (tasks: TaskNode[]) => void;
}

export const MeetingSummaryView: React.FC<MeetingSummaryViewProps> = ({
  onMergeMeetingTasks,
}) => {
  const [meeting] = useState<MeetingSummary>(SAMPLE_MEETING_AUDIO);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress] = useState(35);
  const [merged, setMerged] = useState(false);

  const handleMerge = () => {
    if (onMergeMeetingTasks) {
      onMergeMeetingTasks(meeting.extractedTasks);
      setMerged(true);
    }
  };

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Meeting Title Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-medium" style={{ fontSize: '0.62rem' }}>
            <Mic size={10} /> Whisper Speech Audio
          </span>
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{meeting.date}</span>
        </div>

        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
          {meeting.title}
        </div>

        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
          Duration: <strong style={{ color: '#0f172a' }}>{meeting.duration}</strong> • Participants:{' '}
          <strong style={{ color: '#0284c7' }}>{meeting.participants.length}</strong>
        </div>

        {/* Audio Player Scrubber with Radix Progress */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '4px',
          }}
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: '#ea580c',
              border: 'none',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: '2px' }} />}
          </button>

          {/* Radix Progress bar */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Progress.Root className="ProgressRoot" value={playbackProgress}>
              <Progress.Indicator
                className="ProgressIndicator"
                style={{ transform: `translateX(-${100 - playbackProgress}%)` }}
              />
            </Progress.Root>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#94a3b8' }}>
              <span>04:15</span>
              <span>14:20</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Decisions Box */}
      <div
        style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Sparkles size={11} />
          <span>Extracted Key Decisions</span>
        </div>
        {meeting.keyDecisions.map((dec, idx) => (
          <div key={idx} style={{ fontSize: '0.68rem', color: '#78350f', display: 'flex', gap: '6px' }}>
            <span style={{ color: '#ea580c', fontWeight: 700 }}>•</span>
            <span>{dec}</span>
          </div>
        ))}
      </div>

      {/* Extracted Action Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a' }}>
            Extracted Action Items ({meeting.extractedTasks.length})
          </span>
          {!merged && onMergeMeetingTasks && (
            <button
              onClick={handleMerge}
              className="btn-primary"
              style={{ fontSize: '0.66rem', padding: '3px 8px', gap: '4px' }}
            >
              <Plus size={11} /> Merge to Kanban
            </button>
          )}
          {merged && (
            <span style={{ fontSize: '0.64rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
              <CheckCircle2 size={11} /> Merged to Board
            </span>
          )}
        </div>

        {meeting.extractedTasks.map((task) => (
          <div
            key={task.id}
            className="glass-panel-subtle"
            style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px', background: '#ffffff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                {task.id}
              </span>
              <span className={`badge badge-${task.priority}`} style={{ fontSize: '0.55rem' }}>
                {task.priority}
              </span>
            </div>

            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>
              {task.title}
            </div>

            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
              Assignee: <strong style={{ color: '#0f172a' }}>{task.assignee}</strong> • SLA: <strong style={{ color: '#0f172a' }}>{task.deadline}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Transcript Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Transcript Timeline</span>
        {meeting.rawTranscript.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '6px 10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b' }}>
              <strong style={{ color: '#0284c7' }}>{item.speaker}</strong>
              <span>{item.timestamp}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#334155' }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

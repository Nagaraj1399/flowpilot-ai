import React, { useState, useRef, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Camera, Mic, Clipboard, Sparkles, Play, Square, RefreshCw, Cpu, Image as ImageIcon } from 'lucide-react';
import { AIProcessor } from '../engine/AIProcessor';
import type { TaskNode, CaptureItem } from '../types';
import { SAMPLE_WHITEBOARD_SNIPPET } from '../engine/demoScenarios';

interface CaptureHubProps {
  onTasksExtracted: (newTasks: TaskNode[], capture: CaptureItem) => void;
  defaultTab?: string;
}

export const CaptureHub: React.FC<CaptureHubProps> = ({ onTasksExtracted, defaultTab }) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || 'camera');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInferenceLog, setLastInferenceLog] = useState<string | null>(null);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedWhiteboardSample, setSelectedWhiteboardSample] = useState(0);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcriptText, setTranscriptText] = useState('');
  const timerRef = useRef<any>(null);

  // Clipboard text state
  const [customText, setCustomText] = useState(SAMPLE_WHITEBOARD_SNIPPET);

  const sampleWhiteboards = [
    {
      title: 'Sprint 24 Standup Whiteboard',
      notes: SAMPLE_WHITEBOARD_SNIPPET,
      previewDesc: '4 tasks with deadlines & assignees',
    },
    {
      title: 'Architecture & NPU Model Review',
      notes: `
[ ] Profile INT4 weights memory footprint on Adreno GPU @Sarah due:2026-09-09 urgent
[ ] Implement zero-copy buffer transfer for Camera OCR @Alex due:2026-09-08 high
[ ] Add automated fallback when NPU thermal throttle triggers @David due:2026-09-10 medium
      `.trim(),
      previewDesc: '3 engineering tasks with high urgency',
    },
  ];

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const toggleLiveCamera = async () => {
    if (cameraActive) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
          audio: false,
        });
        setCameraStream(stream);
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access unavailable, defaulting to simulated whiteboard', err);
        setCameraActive(true);
      }
    }
  };

  const handleProcessWhiteboard = async () => {
    setIsProcessing(true);
    setLastInferenceLog('Running on-device PaddleOCR & Phi-3 on Snapdragon NPU...');

    try {
      const rawText = sampleWhiteboards[selectedWhiteboardSample].notes;
      const res = await AIProcessor.processText(rawText, 'whiteboard_ocr');

      const capture: CaptureItem = {
        id: `CAP_${Date.now()}`,
        type: 'camera',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rawContent: rawText,
        extractedTaskIds: res.tasks.map((t) => t.id),
        status: 'extracted',
        deviceModel: 'iQOO 12 (Snapdragon 8 Gen 3)',
        npuInferenceTimeMs: res.inferenceTimeMs,
      };

      onTasksExtracted(res.tasks, capture);
      setLastInferenceLog(`Extracted ${res.tasks.length} tasks in ${res.inferenceTimeMs}ms via NPU (INT4)`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartVoice = () => {
    setIsRecording(true);
    setTranscriptText('Listening... (Transcribing via on-device Whisper model on NPU)');

    setTimeout(() => {
      setTranscriptText('Meeting audio: "Sarah will bundle the Whisper base weights directly by tomorrow evening."');
    }, 1500);

    setTimeout(() => {
      setTranscriptText(
        'Meeting audio: "Sarah will bundle the Whisper base weights directly by tomorrow evening. Also, Elena will record a 60-second backup video of the camera OCR due Sep 9."'
      );
    }, 3200);
  };

  const handleStopVoice = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    setLastInferenceLog('Running Whisper.cpp + Phi-3 extraction on NPU...');

    try {
      const textToParse =
        transcriptText ||
        'Sarah will bundle the Whisper base weights directly by tomorrow evening. Elena will record a 60-second backup video of the camera OCR due Sep 9.';
      const res = await AIProcessor.processText(textToParse, 'whisper_voice');

      const capture: CaptureItem = {
        id: `CAP_VOICE_${Date.now()}`,
        type: 'voice',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rawContent: textToParse,
        audioDurationSeconds: Math.max(recordingSeconds, 6),
        extractedTaskIds: res.tasks.map((t) => t.id),
        status: 'extracted',
        deviceModel: 'iQOO 12 (Snapdragon 8 Gen 3)',
        npuInferenceTimeMs: res.inferenceTimeMs,
      };

      onTasksExtracted(res.tasks, capture);
      setLastInferenceLog(`Whisper transcribed & extracted ${res.tasks.length} tasks in ${res.inferenceTimeMs}ms`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessClipboard = async () => {
    setIsProcessing(true);
    setLastInferenceLog('Parsing text entities via on-device LLM...');

    try {
      const res = await AIProcessor.processText(customText, 'clipboard');
      const capture: CaptureItem = {
        id: `CAP_CLIP_${Date.now()}`,
        type: 'clipboard',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rawContent: customText,
        extractedTaskIds: res.tasks.map((t) => t.id),
        status: 'extracted',
        deviceModel: 'iQOO 12 (Snapdragon 8 Gen 3)',
        npuInferenceTimeMs: res.inferenceTimeMs,
      };

      onTasksExtracted(res.tasks, capture);
      setLastInferenceLog(`Extracted ${res.tasks.length} tasks from clipboard in ${res.inferenceTimeMs}ms`);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFromSystemClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip && clip.trim().length > 0) {
        setCustomText(clip);
      }
    } catch {
      setCustomText(SAMPLE_WHITEBOARD_SNIPPET);
    }
  };

  return (
    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Radix UI Tabs Root */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="TabsRoot">
        <Tabs.List className="TabsList" aria-label="Capture Mode Selector">
          <Tabs.Trigger value="camera" className="TabsTrigger">
            <Camera size={13} />
            <span>Camera OCR</span>
          </Tabs.Trigger>
          <Tabs.Trigger value="voice" className="TabsTrigger">
            <Mic size={13} />
            <span>Voice Whisper</span>
          </Tabs.Trigger>
          <Tabs.Trigger value="clipboard" className="TabsTrigger">
            <Clipboard size={13} />
            <span>Clipboard</span>
          </Tabs.Trigger>
        </Tabs.List>

        {/* TAB 1: CAMERA OCR */}
        <Tabs.Content value="camera" className="TabsContent">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                height: '210px',
                background: '#0f172a',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
              }}
            >
              {cameraActive && cameraStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: '16px',
                    background: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '8px',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', top: '8px', left: '10px', display: 'flex', gap: '6px' }}>
                    <span className="badge badge-medium" style={{ fontSize: '0.62rem' }}>
                      <Cpu size={10} /> Snapdragon NPU Active
                    </span>
                    <span className="badge badge-urgent" style={{ fontSize: '0.62rem' }}>
                      PaddleOCR-Lite
                    </span>
                  </div>

                  <div
                    style={{
                      border: '1.5px dashed #ea580c',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      background: 'rgba(234, 88, 12, 0.15)',
                      fontSize: '0.72rem',
                      color: '#f8fafc',
                      marginTop: '20px',
                    }}
                  >
                    <div style={{ fontSize: '0.6rem', color: '#fb923c', fontWeight: 700 }}>[OCR BOX 01 · Conf: 98.4%]</div>
                    <code>{sampleWhiteboards[selectedWhiteboardSample].notes.split('\n')[0]}</code>
                  </div>

                  <div
                    style={{
                      border: '1.5px dashed #0284c7',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      background: 'rgba(2, 132, 199, 0.15)',
                      fontSize: '0.72rem',
                      color: '#f8fafc',
                    }}
                  >
                    <div style={{ fontSize: '0.6rem', color: '#38bdf8', fontWeight: 700 }}>[OCR BOX 02 · Conf: 96.1%]</div>
                    <code>{sampleWhiteboards[selectedWhiteboardSample].notes.split('\n')[1]}</code>
                  </div>
                </div>
              )}

              <div className="scanner-laser" />

              <div style={{ position: 'absolute', top: 10, left: 10, width: 14, height: 14, borderTop: '2px solid #ea580c', borderLeft: '2px solid #ea580c' }} />
              <div style={{ position: 'absolute', top: 10, right: 10, width: 14, height: 14, borderTop: '2px solid #ea580c', borderRight: '2px solid #ea580c' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 10, width: 14, height: 14, borderBottom: '2px solid #ea580c', borderLeft: '2px solid #ea580c' }} />
              <div style={{ position: 'absolute', bottom: 10, right: 10, width: 14, height: 14, borderBottom: '2px solid #ea580c', borderRight: '2px solid #ea580c' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {sampleWhiteboards.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedWhiteboardSample(idx)}
                    className="btn-secondary"
                    style={{
                      fontSize: '0.66rem',
                      padding: '4px 8px',
                      borderColor: selectedWhiteboardSample === idx ? '#ea580c' : '#e2e8f0',
                      color: selectedWhiteboardSample === idx ? '#ea580c' : '#475569',
                      background: selectedWhiteboardSample === idx ? '#fff7ed' : '#ffffff',
                    }}
                  >
                    <ImageIcon size={11} /> Sample {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={toggleLiveCamera}
                className="btn-secondary"
                style={{ fontSize: '0.66rem', padding: '4px 8px' }}
              >
                <Camera size={11} /> {cameraActive ? 'Stop Cam' : 'Live Camera'}
              </button>
            </div>

            <button
              onClick={handleProcessWhiteboard}
              disabled={isProcessing}
              className="btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>NPU Extracting Tasks...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Scan Whiteboard & Extract Tasks</span>
                </>
              )}
            </button>
          </div>
        </Tabs.Content>

        {/* TAB 2: VOICE WHISPER */}
        <Tabs.Content value="voice" className="TabsContent">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                padding: '18px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '40px' }}>
                {[12, 24, 32, 16, 28, 38, 20, 30, 14, 26, 36, 18].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      height: isRecording ? `${h}px` : '6px',
                      background: isRecording
                        ? 'linear-gradient(180deg, #ea580c, #f59e0b)'
                        : '#cbd5e1',
                      borderRadius: '2px',
                      transition: 'height 0.15s ease',
                    }}
                  />
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isRecording ? '#dc2626' : '#0f172a' }}>
                  00:{recordingSeconds.toString().padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {isRecording ? '🎙️ Listening via Snapdragon Audio Engine...' : 'Ready to record simulated call or meeting'}
                </div>
              </div>

              <div
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '10px 12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.74rem',
                  color: transcriptText ? '#0f172a' : '#94a3b8',
                  fontStyle: transcriptText ? 'normal' : 'italic',
                }}
              >
                {transcriptText || 'Transcript will stream in real-time on NPU...'}
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                {!isRecording ? (
                  <button
                    onClick={handleStartVoice}
                    className="btn-primary"
                    style={{ flex: 1, padding: '9px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
                  >
                    <Play size={14} /> Start Voice Meeting
                  </button>
                ) : (
                  <button
                    onClick={handleStopVoice}
                    className="btn-autofix"
                    style={{ flex: 1, padding: '9px' }}
                  >
                    <Square size={14} /> Stop & Extract Actions
                  </button>
                )}
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* TAB 3: CLIPBOARD */}
        <Tabs.Content value="clipboard" className="TabsContent">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700 }}>Unstructured Text Input</span>
              <button
                onClick={readFromSystemClipboard}
                className="btn-secondary"
                style={{ fontSize: '0.66rem', padding: '3px 8px' }}
              >
                <Clipboard size={11} /> Read Clipboard
              </button>
            </div>

            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '10px',
                color: '#0f172a',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                resize: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
              placeholder="Paste meeting notes, emails, or to-do lists here..."
            />

            <button
              onClick={handleProcessClipboard}
              disabled={isProcessing}
              className="btn-primary"
              style={{ padding: '9px' }}
            >
              {isProcessing ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>Parse & Auto-Categorize</span>
            </button>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* NPU Inference Status Banner */}
      {lastInferenceLog && (
        <div
          style={{
            padding: '8px 12px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            fontSize: '0.68rem',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600,
          }}
        >
          <Cpu size={12} color="#0284c7" />
          <span>{lastInferenceLog}</span>
        </div>
      )}
    </div>
  );
};

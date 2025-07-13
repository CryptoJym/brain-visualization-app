import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Mic, 
  MicOff,
  Save,
  Download,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit3,
  Hash,
  Calendar,
  User,
  Brain,
  Heart,
  Shield,
  Lightbulb,
  BookOpen,
  Copy
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SessionNotes = ({ sessionId, clientId, metrics, transcript, onTranscriptUpdate }) => {
  const [notes, setNotes] = useState({
    summary: '',
    keyThemes: [],
    interventionsUsed: [],
    clientInsights: [],
    homework: '',
    nextSessionFocus: '',
    riskAssessment: '',
    supervisorNotes: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeSection, setActiveSection] = useState('summary');
  const [tagInput, setTagInput] = useState('');
  const recognitionRef = useRef(null);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    // Load existing notes
    loadSessionNotes();
    
    // Setup speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
          onTranscriptUpdate(prev => prev + ' ' + transcript);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [sessionId]);

  useEffect(() => {
    // Auto-save functionality
    if (autoSave && notes.summary) {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      
      autoSaveRef.current = setTimeout(() => {
        saveNotes();
      }, 3000); // Save after 3 seconds of inactivity
    }

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [notes, autoSave]);

  useEffect(() => {
    // Generate AI suggestions based on metrics
    if (metrics.breakthroughMoments.length > 0) {
      const insights = metrics.breakthroughMoments.map(moment => ({
        id: Date.now() + Math.random(),
        text: moment,
        timestamp: new Date().toLocaleTimeString()
      }));
      
      setNotes(prev => ({
        ...prev,
        clientInsights: [...prev.clientInsights, ...insights]
      }));
    }
  }, [metrics.breakthroughMoments]);

  const loadSessionNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('therapy_notes')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (data) {
        setNotes(data.notes);
        setLastSaved(new Date(data.updated_at));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async () => {
    try {
      const { error } = await supabase
        .from('therapy_notes')
        .upsert({
          session_id: sessionId,
          client_id: clientId,
          notes: notes,
          metrics: metrics,
          updated_at: new Date()
        });

      if (!error) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const addTag = (category) => {
    if (tagInput.trim()) {
      setNotes(prev => ({
        ...prev,
        keyThemes: [...prev.keyThemes, { category, text: tagInput.trim() }]
      }));
      setTagInput('');
    }
  };

  const generateSessionSummary = () => {
    const summary = `
Session Date: ${new Date().toLocaleDateString()}
Emotional State: ${metrics.emotionalState}
Engagement Level: ${metrics.engagementLevel}%
Therapeutic Alliance: ${metrics.therapeuticAlliance}%

Key Themes:
${notes.keyThemes.map(theme => `- ${theme.text}`).join('\n')}

Interventions Used:
${notes.interventionsUsed.map(intervention => `- ${intervention}`).join('\n')}

Client Insights:
${notes.clientInsights.map(insight => `- ${insight.text}`).join('\n')}

Risk Assessment: ${notes.riskAssessment || 'No immediate concerns'}

Next Session Focus: ${notes.nextSessionFocus}

Homework: ${notes.homework}
    `;
    
    return summary.trim();
  };

  const exportNotes = () => {
    const summary = generateSessionSummary();
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_notes_${sessionId}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const sections = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'themes', label: 'Key Themes', icon: Tag },
    { id: 'interventions', label: 'Interventions', icon: Shield },
    { id: 'insights', label: 'Client Insights', icon: Lightbulb },
    { id: 'homework', label: 'Homework', icon: BookOpen },
    { id: 'risk', label: 'Risk Assessment', icon: AlertCircle }
  ];

  const tagCategories = [
    { id: 'emotion', label: 'Emotion', icon: Heart, color: 'bg-pink-500/20 text-pink-300' },
    { id: 'cognition', label: 'Cognition', icon: Brain, color: 'bg-blue-500/20 text-blue-300' },
    { id: 'behavior', label: 'Behavior', icon: User, color: 'bg-green-500/20 text-green-300' },
    { id: 'trauma', label: 'Trauma', icon: Shield, color: 'bg-red-500/20 text-red-300' }
  ];

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className={`p-3 rounded-lg transition-all ${
              isRecording 
                ? 'bg-red-500/20 text-red-300 animate-pulse' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </motion.button>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              {lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="rounded"
            />
            Auto-save
          </label>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveNotes}
            className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            <Save className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportNotes}
            className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            <Download className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{section.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/5 rounded-xl p-4"
        >
          {/* Summary Section */}
          {activeSection === 'summary' && (
            <div className="space-y-4">
              <textarea
                value={notes.summary}
                onChange={(e) => setNotes(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Session summary..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50"
              />
              
              {/* Quick Templates */}
              <div className="flex gap-2">
                <button
                  onClick={() => setNotes(prev => ({ 
                    ...prev, 
                    summary: `Client presented with ${metrics.emotionalState} affect. Engagement was ${metrics.engagementLevel > 70 ? 'high' : metrics.engagementLevel > 40 ? 'moderate' : 'low'}. ${prev.summary}`
                  }))}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Add opening template
                </button>
                <button
                  onClick={() => setNotes(prev => ({ 
                    ...prev, 
                    summary: `${prev.summary} Plan for next session: Continue exploring...`
                  }))}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Add closing template
                </button>
              </div>
            </div>
          )}

          {/* Key Themes Section */}
          {activeSection === 'themes' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a theme..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  onKeyPress={(e) => e.key === 'Enter' && addTag('general')}
                />
              </div>
              
              <div className="flex gap-2">
                {tagCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => addTag(category.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${category.color} hover:opacity-80 transition-opacity`}
                    >
                      <Icon className="w-3 h-3" />
                      {category.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {notes.keyThemes.map((theme, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg"
                  >
                    <Hash className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-300">{theme.text}</span>
                    <button
                      onClick={() => setNotes(prev => ({
                        ...prev,
                        keyThemes: prev.keyThemes.filter((_, i) => i !== index)
                      }))}
                      className="text-gray-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Interventions Section */}
          {activeSection === 'interventions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Active Listening',
                  'Validation',
                  'Cognitive Restructuring',
                  'Grounding Exercise',
                  'EMDR',
                  'Psychoeducation',
                  'Role Play',
                  'Empty Chair'
                ].map((intervention) => (
                  <label key={intervention} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={notes.interventionsUsed.includes(intervention)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNotes(prev => ({
                            ...prev,
                            interventionsUsed: [...prev.interventionsUsed, intervention]
                          }));
                        } else {
                          setNotes(prev => ({
                            ...prev,
                            interventionsUsed: prev.interventionsUsed.filter(i => i !== intervention)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-gray-300">{intervention}</span>
                  </label>
                ))}
              </div>
              
              <textarea
                placeholder="Additional intervention notes..."
                className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50"
              />
            </div>
          )}

          {/* Client Insights Section */}
          {activeSection === 'insights' && (
            <div className="space-y-4">
              {notes.clientInsights.map((insight, index) => (
                <div key={insight.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-yellow-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{insight.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{insight.timestamp}</p>
                  </div>
                </div>
              ))}
              
              <textarea
                placeholder="Add additional insights..."
                className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const text = e.target.value.trim();
                    if (text) {
                      setNotes(prev => ({
                        ...prev,
                        clientInsights: [...prev.clientInsights, {
                          id: Date.now(),
                          text,
                          timestamp: new Date().toLocaleTimeString()
                        }]
                      }));
                      e.target.value = '';
                    }
                  }
                }}
              />
            </div>
          )}

          {/* Homework Section */}
          {activeSection === 'homework' && (
            <div className="space-y-4">
              <textarea
                value={notes.homework}
                onChange={(e) => setNotes(prev => ({ ...prev, homework: e.target.value }))}
                placeholder="Homework assignments..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50"
              />
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Thought diary',
                  'Grounding practice daily',
                  'Sleep hygiene log',
                  'Gratitude journal',
                  'Exposure exercise',
                  'Communication practice'
                ].map((assignment) => (
                  <button
                    key={assignment}
                    onClick={() => setNotes(prev => ({ 
                      ...prev, 
                      homework: prev.homework + (prev.homework ? '\n' : '') + `• ${assignment}`
                    }))}
                    className="text-xs text-left p-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    + {assignment}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Risk Assessment Section */}
          {activeSection === 'risk' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-300">Risk Assessment</span>
                </div>
                <textarea
                  value={notes.riskAssessment}
                  onChange={(e) => setNotes(prev => ({ ...prev, riskAssessment: e.target.value }))}
                  placeholder="Document any safety concerns, suicidal ideation, self-harm risks..."
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-red-500/50"
                />
              </div>
              
              {metrics.riskIndicators.length > 0 && (
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <p className="text-sm text-yellow-300 font-medium mb-2">
                    AI-Detected Risk Indicators:
                  </p>
                  {metrics.riskIndicators.map((risk, index) => (
                    <div key={index} className="text-sm text-gray-300 mb-1">
                      • {risk.indicator}: "{risk.context}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* AI Transcript */}
      {transcript && (
        <div className="mt-4 p-4 bg-white/5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-400">Session Transcript</h4>
            <button
              onClick={() => navigator.clipboard.writeText(transcript)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          </div>
          <p className="text-sm text-gray-300 max-h-32 overflow-y-auto">
            {transcript}
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionNotes;
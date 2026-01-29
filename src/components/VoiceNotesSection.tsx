import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Pause, Upload, User, StopCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface VoiceNote {
  id: string;
  sender_name: string;
  audio_url: string;
  duration_seconds: number | null;
  created_at: string;
}

const CLOUDINARY_UPLOAD_PRESET = "birthday_uploads";
const CLOUDINARY_CLOUD_NAME = "dlasynehg";

const AudioCard = ({ note }: { note: VoiceNote }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(note.audio_url);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <Card className="bg-gradient-to-br from-baby-lavender/50 to-baby-pink/30 border-2 border-baby-lavender/30 hover:border-baby-pink/50 transition-all">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-baby-pink flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-fredoka font-semibold text-foreground truncate">
              {note.sender_name}
            </p>
            {note.duration_seconds && (
              <p className="text-xs text-muted-foreground">
                {note.duration_seconds}s
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-baby-coral hover:bg-baby-coral/80"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-foreground" />
            ) : (
              <Play className="w-5 h-5 text-foreground ml-0.5" />
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const VoiceNotesSection = () => {
  const [senderName, setSenderName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: voiceNotes, isLoading } = useQuery({
    queryKey: ["voice-notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_notes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as VoiceNote[];
    },
  });

  const addVoiceNoteMutation = useMutation({
    mutationFn: async ({ audioUrl, duration }: { audioUrl: string; duration: number }) => {
      const { error } = await supabase
        .from("voice_notes")
        .insert({
          sender_name: senderName,
          audio_url: audioUrl,
          duration_seconds: Math.round(duration),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-notes"] });
      setSenderName("");
      toast({ title: "Voice note added!", description: "Thank you for your message 💕" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save voice note", variant: "destructive" });
    },
  });

  const uploadToCloudinary = async (blob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("resource_type", "auto");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.secure_url;
  };

  const startRecording = async () => {
    if (!senderName.trim()) {
      toast({ title: "Please enter your name first", variant: "destructive" });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        
        setIsUploading(true);
        try {
          const audioUrl = await uploadToCloudinary(blob);
          const audio = new Audio(URL.createObjectURL(blob));
          audio.onloadedmetadata = () => {
            addVoiceNoteMutation.mutate({ audioUrl, duration: audio.duration });
          };
        } catch {
          toast({ title: "Upload failed", variant: "destructive" });
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 30000);
    } catch {
      toast({ title: "Microphone access denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !senderName.trim()) {
      toast({ title: "Please enter your name first", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const audioUrl = await uploadToCloudinary(file);
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        const duration = Math.min(audio.duration, 30);
        addVoiceNoteMutation.mutate({ audioUrl, duration });
      };
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section id="voice-notes" className="py-20 px-4 bg-gradient-to-b from-baby-lavender/10 to-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-baby-lavender mb-4">
            <Mic className="w-8 h-8 text-foreground" />
          </div>
          <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-gradient mb-4">
            Voice Notes from Family
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Leave a special audio message for Ridhan (10-30 seconds)
          </p>
        </motion.div>

        {/* Recording Section */}
        <Card className="mb-8 bg-card/50 backdrop-blur border-2 border-baby-lavender/30">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Input
                placeholder="Your name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="flex-1"
                disabled={isRecording || isUploading}
              />
              <div className="flex gap-2">
                {isRecording ? (
                  <Button
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={startRecording}
                      disabled={isUploading || !senderName.trim()}
                      className="bg-baby-coral hover:bg-baby-coral/80"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Record
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || !senderName.trim()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            {(isRecording || isUploading) && (
              <p className="text-sm text-muted-foreground mt-3 text-center animate-pulse">
                {isRecording ? "🎙️ Recording... (max 30 seconds)" : "📤 Uploading..."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Voice Notes Grid */}
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading voice notes...</div>
        ) : voiceNotes && voiceNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {voiceNotes.map((note) => (
              <AudioCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Be the first to leave a voice note! 🎤
          </p>
        )}
      </div>
    </section>
  );
};

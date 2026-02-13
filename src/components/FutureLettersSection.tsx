import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Send, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SealedEnvelope = ({ index }: { index: number }) => {
  const colors = ["bg-baby-pink", "bg-baby-blue", "bg-baby-lavender", "bg-baby-mint", "bg-baby-coral"];
  const color = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
      transition={{ duration: 0.3 }}
      className={`relative ${color} rounded-lg p-6 shadow-baby-card cursor-pointer group`}
    >
      {/* Envelope flap */}
      <div className={`absolute top-0 left-0 right-0 h-12 ${color} rounded-t-lg overflow-hidden`}>
        <div 
          className="absolute inset-0"
          style={{
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
            background: "rgba(0,0,0,0.05)",
          }}
        />
      </div>
      
      {/* Seal */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-baby-coral flex items-center justify-center shadow-md z-10">
        <Heart className="w-5 h-5 text-white fill-white" />
      </div>

      {/* Content */}
      <div className="pt-12 text-center">
        <Lock className="w-8 h-8 mx-auto text-foreground/40 mb-2" />
        <p className="text-sm text-foreground/60 font-medium">
          A message of love
        </p>
        <p className="text-xs text-foreground/40 mt-1">
          To be opened on Feb 17, 2043
        </p>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <p className="text-white font-fredoka text-sm">🔒 Sealed with love</p>
      </div>
    </motion.div>
  );
};

export const FutureLettersSection = () => {
  const [senderName, setSenderName] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Get count of letters (not the content) via secure RPC
  const { data: letterCount } = useQuery({
    queryKey: ["future-letters-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_future_letters_count");
      
      if (error) throw error;
      return data || 0;
    },
  });

  const submitLetterMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("future_letters")
        .insert({
          sender_name: senderName,
          letter_content: letterContent,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["future-letters-count"] });
      setSenderName("");
      setLetterContent("");
      toast({ 
        title: "Letter sealed! 💌", 
        description: "Your message will be waiting for Ridhan in 2043" 
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save letter", variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !letterContent.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    await submitLetterMutation.mutateAsync();
    setIsSubmitting(false);
  };

  return (
    <section id="future-letters" className="py-20 px-4 bg-gradient-to-b from-background to-baby-blue/10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-baby-blue mb-4">
            <Mail className="w-8 h-8 text-foreground" />
          </div>
          <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-gradient mb-4">
            A Letter for When You Turn 18
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Write a heartfelt message for Ridhan to read on their 18th birthday
          </p>
          <p className="text-sm text-baby-coral mt-2 font-medium">
            🔒 Letters are sealed and hidden until February 17, 2043
          </p>
        </motion.div>

        {/* Sealed Envelopes Display */}
        {letterCount && letterCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-center text-muted-foreground mb-6">
              💌 {letterCount} letter{letterCount > 1 ? "s" : ""} sealed and waiting...
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: Math.min(letterCount, 10) }).map((_, i) => (
                <SealedEnvelope key={i} index={i} />
              ))}
              {letterCount > 10 && (
                <div className="flex items-center justify-center text-muted-foreground">
                  +{letterCount - 10} more
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Letter Form */}
        <Card className="bg-card/50 backdrop-blur border-2 border-baby-blue/30">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Your name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                disabled={isSubmitting}
              />
              <Textarea
                placeholder="Write your message for 18-year-old Ridhan... What wisdom, memories, or wishes would you like to share?"
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                rows={6}
                disabled={isSubmitting}
              />
              <Button 
                type="submit" 
                disabled={isSubmitting || !senderName.trim() || !letterContent.trim()}
                className="w-full bg-baby-blue hover:bg-baby-blue/80"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Sealing..." : "Seal This Letter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

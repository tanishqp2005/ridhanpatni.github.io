import { motion } from "framer-motion";
import { Heart, Send, Loader2, Quote } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CARD_COLORS = [
  "bg-baby-pink",
  "bg-baby-blue",
  "bg-baby-yellow",
  "bg-baby-mint",
  "bg-baby-lavender",
  "bg-baby-coral",
];

export const WishesSection = () => {
  const [guestName, setGuestName] = useState("");
  const [wishMessage, setWishMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: wishes } = useQuery({
    queryKey: ["wishes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guest_wishes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const wishMutation = useMutation({
    mutationFn: async () => {
      if (!guestName.trim() || !wishMessage.trim()) {
        throw new Error("Please enter your name and a message");
      }

      const { error } = await supabase
        .from("guest_wishes")
        .insert({
          guest_name: guestName.trim(),
          message: wishMessage.trim(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thank you for your beautiful wish! 🎉");
      setGuestName("");
      setWishMessage("");
      queryClient.invalidateQueries({ queryKey: ["wishes"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send wish. Please try again.");
    },
  });

  return (
    <section id="wishes" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-baby-coral rounded-full shadow-baby">
            <Heart size={32} className="text-primary-foreground fill-primary-foreground" />
          </div>
          <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-foreground mb-4">
            Birthday Wishes
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Leave a special message for the little one
          </p>
        </motion.div>

        {/* Wish Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-baby max-w-xl mx-auto mb-16"
        >
          <div className="space-y-4">
            <div>
              <label className="block font-fredoka font-medium text-foreground mb-2">
                Your Name *
              </label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
                className="rounded-xl border-border bg-background"
              />
            </div>
            <div>
              <label className="block font-fredoka font-medium text-foreground mb-2">
                Your Birthday Wish *
              </label>
              <Textarea
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                placeholder="Write a beautiful birthday message..."
                className="rounded-xl border-border bg-background resize-none"
                rows={4}
              />
            </div>
            <Button
              onClick={() => wishMutation.mutate()}
              disabled={wishMutation.isPending || !guestName.trim() || !wishMessage.trim()}
              className="w-full btn-baby text-primary-foreground"
            >
              {wishMutation.isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  Send Wish
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Wishes Grid */}
        {wishes && wishes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishes.map((wish, index) => (
              <motion.div
                key={wish.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, rotate: index % 2 === 0 ? 1 : -1 }}
                className={`${CARD_COLORS[index % CARD_COLORS.length]} rounded-3xl p-6 shadow-baby-card relative overflow-hidden`}
              >
                <Quote size={40} className="absolute top-3 right-3 text-foreground/10" />
                <p className="text-foreground font-nunito mb-4 relative z-10 leading-relaxed">
                  "{wish.message}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-background/50 rounded-full flex items-center justify-center">
                    <Heart size={14} className="text-primary fill-primary" />
                  </div>
                  <span className="font-fredoka font-medium text-foreground">
                    {wish.guest_name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {wishes && wishes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              Be the first to leave a birthday wish! 💕
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

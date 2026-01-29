import { motion } from "framer-motion";
import { Heart, Camera, Smile, MessageCircle, Footprints, Bath, PartyPopper, Plane } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MILESTONE_ICONS: Record<string, React.ElementType> = {
  first_smile: Smile,
  first_word: MessageCircle,
  first_step: Footprints,
  first_bath: Bath,
  first_festival: PartyPopper,
  first_trip: Plane,
};

const MILESTONE_COLORS: Record<string, string> = {
  first_smile: "bg-baby-pink",
  first_word: "bg-baby-blue",
  first_step: "bg-baby-mint",
  first_bath: "bg-baby-lavender",
  first_festival: "bg-baby-yellow",
  first_trip: "bg-baby-coral",
};

export const TheFirstsSection = () => {
  const { data: firsts, isLoading } = useQuery({
    queryKey: ["baby-firsts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("baby_firsts")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-background to-baby-pink/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">Loading milestones...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="firsts" className="py-20 px-4 bg-gradient-to-b from-background to-baby-pink/10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-baby-coral fill-baby-coral" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Precious Moments
            </span>
            <Heart className="w-6 h-6 text-baby-coral fill-baby-coral" />
          </div>
          <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-gradient mb-4">
            The Firsts
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every first is a celebration of growth and love
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {firsts?.map((first, index) => {
            const IconComponent = MILESTONE_ICONS[first.milestone_key] || Heart;
            const bgColor = MILESTONE_COLORS[first.milestone_key] || "bg-baby-pink";

            return (
              <motion.div
                key={first.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden border-2 border-transparent hover:border-baby-pink/50 transition-all duration-300 shadow-baby-card hover:shadow-baby-float">
                  <CardContent className="p-0">
                    <div className={`relative aspect-square ${bgColor} overflow-hidden`}>
                      {first.photo_url ? (
                        <img
                          src={first.photo_url}
                          alt={first.milestone_title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                          <IconComponent className="w-16 h-16 text-foreground/40" />
                          <div className="flex items-center gap-2 text-foreground/40">
                            <Camera className="w-5 h-5" />
                            <span className="text-sm">Photo coming soon</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4 text-center">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${bgColor} mb-3`}>
                        <IconComponent className="w-5 h-5 text-foreground" />
                      </div>
                      <h3 className="font-fredoka text-xl font-semibold text-foreground mb-2">
                        {first.milestone_title}
                      </h3>
                      {first.caption && (
                        <p className="text-sm text-muted-foreground italic">
                          "{first.caption}"
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

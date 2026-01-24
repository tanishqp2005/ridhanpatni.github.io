import { motion } from "framer-motion";
import { Calendar, Image, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MONTH_COLORS = [
  "bg-baby-pink",
  "bg-baby-blue",
  "bg-baby-yellow",
  "bg-baby-mint",
  "bg-baby-lavender",
  "bg-baby-coral",
  "bg-baby-pink",
  "bg-baby-blue",
  "bg-baby-yellow",
  "bg-baby-mint",
  "bg-baby-lavender",
  "bg-baby-coral",
];

const MONTH_ICONS = ["🍼", "👶", "🌸", "🌈", "☀️", "🌻", "🍂", "🎃", "🦃", "🎄", "⛄", "🎂"];

export const MilestoneTimeline = () => {
  const { data: milestones } = useQuery({
    queryKey: ["milestones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*, milestone_media(*)")
        .order("month_number", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="milestones" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-baby-blue rounded-full shadow-baby">
            <Calendar size={32} className="text-secondary-foreground" />
          </div>
          <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-foreground mb-4">
            12-Month Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Watch our little one grow through each precious month
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-baby-pink via-baby-blue to-baby-mint rounded-full hidden md:block" />

          {/* Milestone cards */}
          <div className="space-y-8 md:space-y-12">
            {milestones?.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex items-center gap-4 md:gap-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Card */}
                <div className="flex-1">
                  <div className="card-baby relative overflow-hidden">
                    {/* Month badge */}
                    <div className={`absolute top-0 right-0 ${MONTH_COLORS[index]} px-4 py-2 rounded-bl-2xl`}>
                      <span className="text-2xl">{MONTH_ICONS[index]}</span>
                    </div>

                    <div className="pr-16">
                      <h3 className="text-2xl font-fredoka font-semibold text-foreground mb-1">
                        Month {milestone.month_number}
                      </h3>
                      <p className="text-muted-foreground font-medium mb-4">
                        {milestone.month_label}
                      </p>
                      
                      {milestone.caption && (
                        <p className="text-foreground mb-4">{milestone.caption}</p>
                      )}

                      {/* Media preview */}
                      {milestone.milestone_media && milestone.milestone_media.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {milestone.milestone_media.slice(0, 4).map((media: any) => (
                            <div
                              key={media.id}
                              className="aspect-square rounded-xl overflow-hidden bg-muted"
                            >
                              {media.file_type === "image" ? (
                                <img
                                  src={media.file_url}
                                  alt="Milestone memory"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <video
                                  src={media.file_url}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                          <Image size={24} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Memories coming soon...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline dot - desktop only */}
                <div className="hidden md:flex items-center justify-center">
                  <div className={`timeline-dot ${MONTH_COLORS[index]}`} />
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

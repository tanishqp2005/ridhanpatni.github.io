import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Image, Video, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { FloatingBalls } from "@/components/FloatingBalls";
import { FloatingBabyElements } from "@/components/FloatingBabyElements";

const Gallery = () => {
  const { data: uploads, isLoading } = useQuery({
    queryKey: ["gallery-uploads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_uploads")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { photos, videos } = useMemo(() => {
    if (!uploads) return { photos: [], videos: [] };
    return {
      photos: uploads.filter((u) => u.file_type === "image"),
      videos: uploads.filter((u) => u.file_type === "video"),
    };
  }, [uploads]);

  return (
    <div className="min-h-screen relative overflow-x-hidden py-8 px-4" style={{ background: "var(--gradient-hero)", backgroundAttachment: "fixed" }}>
      <FloatingBalls />
      <FloatingBabyElements />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-baby-pink rounded-full shadow-baby">
              <Image size={32} className="text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-foreground mb-4">
              Family Gallery 📸
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Precious memories shared by family and friends
            </p>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!uploads || uploads.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Image size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-fredoka font-semibold text-foreground mb-2">
              No memories yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share a special moment!
            </p>
            <Link
              to="/#upload"
              className="inline-flex items-center gap-2 btn-baby text-primary-foreground px-6 py-3 rounded-full"
            >
              Upload Memories
            </Link>
          </motion.div>
        )}

        {/* Photos Section */}
        {photos.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-baby-pink rounded-full flex items-center justify-center">
                <Image size={20} className="text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-foreground">
                Photos ({photos.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((upload, index) => (
                <motion.div
                  key={upload.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-card shadow-baby-card group"
                >
                  <img
                    src={upload.file_url}
                    alt={`Memory from ${upload.uploader_name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white font-medium truncate">
                      {upload.uploader_name}
                    </p>
                    {upload.memory_message && (
                      <p className="text-white/80 text-sm truncate">
                        {upload.memory_message}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-baby-blue rounded-full flex items-center justify-center">
                <Video size={20} className="text-secondary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-foreground">
                Videos ({videos.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {videos.map((upload, index) => (
                <motion.div
                  key={upload.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative aspect-video rounded-2xl overflow-hidden bg-card shadow-baby-card"
                >
                  <video
                    src={upload.file_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pointer-events-none">
                    <p className="text-white font-medium truncate">
                      {upload.uploader_name}
                    </p>
                    {upload.memory_message && (
                      <p className="text-white/80 text-sm truncate">
                        {upload.memory_message}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default Gallery;

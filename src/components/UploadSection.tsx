import { motion } from "framer-motion";
import { Upload, Image, Video, X, Check, Loader2 } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DomeGallery } from "@/components/DomeGallery";

export const UploadSection = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: approvedUploads } = useQuery({
    queryKey: ["family-uploads"],
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

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!files.length || !name.trim()) {
        throw new Error("Please add files and your name");
      }

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `family/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("birthday-uploads")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("birthday-uploads")
          .getPublicUrl(filePath);

        const fileType = file.type.startsWith("video/") ? "video" : "image";

        const { error: dbError } = await supabase
          .from("family_uploads")
          .insert({
            uploader_name: name.trim(),
            memory_message: message.trim() || null,
            file_url: publicUrl,
            file_type: fileType,
            approved: true,
          });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);
    },
    onSuccess: () => {
      toast.success("Thank you for sharing your memories! 💕");
      setFiles([]);
      setPreviews([]);
      setName("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["family-uploads"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload. Please try again.");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 10) {
      toast.error("Maximum 10 files allowed");
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section id="upload" className="py-20 px-4 bg-baby-lavender/30">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-baby-mint rounded-full shadow-baby">
            <Upload size={32} className="text-accent-foreground" />
          </div>
          <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-foreground mb-4">
            Share Your Memories
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload your favorite photos and videos to celebrate this special milestone
          </p>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-baby max-w-xl mx-auto mb-16"
        >
          {/* File drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/40 rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-colors mb-6"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-baby-pink rounded-full flex items-center justify-center">
                <Image size={24} className="text-primary" />
              </div>
              <div className="w-12 h-12 bg-baby-blue rounded-full flex items-center justify-center">
                <Video size={24} className="text-secondary-foreground" />
              </div>
            </div>
            <p className="font-fredoka text-lg text-foreground mb-1">
              Click to upload photos or videos
            </p>
            <p className="text-sm text-muted-foreground">
              Maximum 10 files
            </p>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-6">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                  {files[index]?.type.startsWith("video/") ? (
                    <video src={preview} className="w-full h-full object-cover" />
                  ) : (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                  >
                    <X size={14} className="text-destructive-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="block font-fredoka font-medium text-foreground mb-2">
                Your Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="rounded-xl border-border bg-background"
              />
            </div>
            <div>
              <label className="block font-fredoka font-medium text-foreground mb-2">
                Memory Message
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share a sweet memory or message..."
                className="rounded-xl border-border bg-background resize-none"
                rows={3}
              />
            </div>
            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={uploadMutation.isPending || !files.length || !name.trim()}
              className="w-full btn-baby text-primary-foreground"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check size={20} className="mr-2" />
                  Share Memories
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Dome Gallery */}
        {approvedUploads && approvedUploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-fredoka font-semibold text-foreground text-center mb-8">
              Family Gallery 📸
            </h3>
            <div className="w-full h-[500px] md:h-[600px] lg:h-[700px] rounded-3xl overflow-hidden bg-gradient-to-b from-baby-pink/20 to-baby-blue/20">
              <DomeGallery
                images={approvedUploads
                  .filter((upload) => upload.file_type === "image")
                  .map((upload) => ({
                    src: upload.file_url,
                    alt: `Memory from ${upload.uploader_name}`
                  }))}
                overlayBlurColor="hsl(350, 60%, 95%)"
                imageBorderRadius="20px"
                openedImageBorderRadius="24px"
                openedImageWidth="300px"
                openedImageHeight="400px"
                grayscale={false}
                fit={0.6}
                minRadius={400}
                segments={25}
              />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

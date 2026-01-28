import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, X, Trash2, Loader2, Image, Video, Calendar, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Upload {
  id: string;
  uploader_name: string;
  memory_message: string | null;
  file_url: string;
  file_type: string;
  approved: boolean;
  created_at: string;
}

interface MilestoneMedia {
  id: string;
  file_url: string;
  file_type: string;
  milestone_id: string;
  created_at: string;
}

interface Milestone {
  id: string;
  month_number: number;
  month_label: string;
  caption: string | null;
  milestone_media: MilestoneMedia[];
}

const MONTH_ICONS = ["🍼", "👶", "🌸", "🌈", "☀️", "🌻", "🍂", "🎃", "🦃", "🎄", "⛄", "🎂"];

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [uploadingMilestone, setUploadingMilestone] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "verify", password },
      });

      if (error || data?.error) {
        toast.error("Invalid password");
        return;
      }

      setIsAuthenticated(true);
      toast.success("Welcome, Admin! 🎉");
      fetchUploads();
      fetchMilestones();
    } catch {
      toast.error("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "list", password },
      });

      if (error || data?.error) throw new Error(data?.error || "Failed to fetch");
      setUploads(data.uploads || []);
    } catch {
      toast.error("Failed to fetch uploads");
    }
  };

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "list_milestones", password },
      });

      if (error || data?.error) throw new Error(data?.error || "Failed to fetch");
      setMilestones(data.milestones || []);
    } catch {
      toast.error("Failed to fetch milestones");
    }
  };

  const handleAction = async (action: "approve" | "reject" | "delete", uploadId: string) => {
    setActionLoading(uploadId);
    try {
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: { action, password, uploadId },
      });

      if (error || data?.error) throw new Error(data?.error || "Action failed");

      if (action === "delete") {
        setUploads((prev) => prev.filter((u) => u.id !== uploadId));
        toast.success("Upload deleted");
      } else {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId ? { ...u, approved: action === "approve" } : u
          )
        );
        toast.success(action === "approve" ? "Upload approved" : "Upload rejected");
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMilestoneUpload = async (milestoneId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingMilestone(milestoneId);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `milestones/${milestoneId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("birthday-uploads")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("birthday-uploads")
          .getPublicUrl(filePath);

        const fileType = file.type.startsWith("video/") ? "video" : "image";

        const { data, error } = await supabase.functions.invoke("admin-auth", {
          body: {
            action: "add_milestone_media",
            password,
            milestoneId,
            fileUrl: publicUrl,
            fileType,
          },
        });

        if (error || data?.error) throw new Error(data?.error || "Failed to add media");
      }

      toast.success("Media uploaded successfully! 🎉");
      fetchMilestones();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload media");
    } finally {
      setUploadingMilestone(null);
    }
  };

  const handleDeleteMilestoneMedia = async (mediaId: string) => {
    setActionLoading(mediaId);
    try {
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "delete_milestone_media", password, uploadId: mediaId },
      });

      if (error || data?.error) throw new Error(data?.error || "Delete failed");

      setMilestones((prev) =>
        prev.map((m) => ({
          ...m,
          milestone_media: m.milestone_media.filter((media) => media.id !== mediaId),
        }))
      );
      toast.success("Media deleted");
    } catch {
      toast.error("Failed to delete media");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-baby-pink via-background to-baby-blue flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-baby-card border-0 bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-fredoka text-2xl text-foreground">
                Admin Access
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-2">
                Enter password to manage uploads
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="pr-10 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full btn-baby"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Verifying...
                    </>
                  ) : (
                    "Access Admin Panel"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-baby-pink via-background to-baby-blue p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-fredoka text-3xl md:text-4xl font-bold text-foreground mb-2">
            🎀 Admin Panel
          </h1>
        </motion.div>

        <Tabs defaultValue="uploads" className="space-y-6">
          <TabsList className="bg-card/80 backdrop-blur p-1 rounded-xl">
            <TabsTrigger value="uploads" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Image size={18} className="mr-2" />
              Gallery Uploads
            </TabsTrigger>
            <TabsTrigger value="milestones" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar size={18} className="mr-2" />
              Milestones
            </TabsTrigger>
          </TabsList>

          {/* Gallery Uploads Tab */}
          <TabsContent value="uploads">
            <div className="mb-4">
              <p className="text-muted-foreground">
                {uploads.length} total uploads • {uploads.filter((u) => u.approved).length} approved
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {uploads.map((upload, index) => (
                <motion.div
                  key={upload.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`overflow-hidden border-2 transition-colors ${
                      upload.approved
                        ? "border-green-300 bg-green-50/50"
                        : "border-orange-300 bg-orange-50/50"
                    }`}
                  >
                    <div className="aspect-video relative bg-muted">
                      {upload.file_type === "video" ? (
                        <video
                          src={upload.file_url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={upload.file_url}
                          alt={`Upload by ${upload.uploader_name}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2">
                        {upload.file_type === "video" ? (
                          <Video className="w-5 h-5 text-white drop-shadow-md" />
                        ) : (
                          <Image className="w-5 h-5 text-white drop-shadow-md" />
                        )}
                      </div>
                      <div
                        className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                          upload.approved
                            ? "bg-green-500 text-white"
                            : "bg-orange-500 text-white"
                        }`}
                      >
                        {upload.approved ? "Approved" : "Pending"}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <p className="font-fredoka font-semibold text-foreground">
                          {upload.uploader_name}
                        </p>
                        {upload.memory_message && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {upload.memory_message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(upload.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!upload.approved && (
                          <Button
                            size="sm"
                            onClick={() => handleAction("approve", upload.id)}
                            disabled={actionLoading === upload.id}
                            className="flex-1 bg-accent hover:bg-accent/80"
                          >
                            {actionLoading === upload.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <>
                                <Check size={16} className="mr-1" /> Approve
                              </>
                            )}
                          </Button>
                        )}
                        {upload.approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction("reject", upload.id)}
                            disabled={actionLoading === upload.id}
                            className="flex-1 border-secondary text-secondary-foreground hover:bg-secondary/50"
                          >
                            {actionLoading === upload.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <>
                                <X size={16} className="mr-1" /> Reject
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction("delete", upload.id)}
                          disabled={actionLoading === upload.id}
                        >
                          {actionLoading === upload.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {uploads.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Image className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-fredoka text-lg">
                  No uploads yet
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones">
            <div className="mb-4">
              <p className="text-muted-foreground">
                Manage photos and videos for each month milestone
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden border-2 border-baby-blue/50 bg-card/80">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{MONTH_ICONS[index]}</span>
                        <div>
                          <CardTitle className="font-fredoka text-lg">
                            Month {milestone.month_number}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {milestone.month_label}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Media grid */}
                      {milestone.milestone_media.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {milestone.milestone_media.map((media) => (
                            <div key={media.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
                              {media.file_type === "video" ? (
                                <video
                                  src={media.file_url}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src={media.file_url}
                                  alt="Milestone"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <div className="absolute top-1 right-1">
                                {media.file_type === "video" ? (
                                  <Video className="w-4 h-4 text-white drop-shadow-md" />
                                ) : null}
                              </div>
                              <button
                                onClick={() => handleDeleteMilestoneMedia(media.id)}
                                disabled={actionLoading === media.id}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                {actionLoading === media.id ? (
                                  <Loader2 className="animate-spin text-white" size={24} />
                                ) : (
                                  <Trash2 className="text-white" size={24} />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {milestone.milestone_media.length === 0 && (
                        <div className="text-center py-6 bg-muted/30 rounded-xl">
                          <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No media yet</p>
                        </div>
                      )}

                      {/* Upload button */}
                      <input
                        ref={(el) => (fileInputRefs.current[milestone.id] = el)}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={(e) => handleMilestoneUpload(milestone.id, e.target.files)}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-dashed border-2"
                        onClick={() => fileInputRefs.current[milestone.id]?.click()}
                        disabled={uploadingMilestone === milestone.id}
                      >
                        {uploadingMilestone === milestone.id ? (
                          <>
                            <Loader2 className="animate-spin mr-2" size={18} />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Plus size={18} className="mr-2" />
                            Add Photos/Videos
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {milestones.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-fredoka text-lg">
                  Loading milestones...
                </p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

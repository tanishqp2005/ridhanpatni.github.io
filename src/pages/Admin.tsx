import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, X, Trash2, Loader2, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
            📸 Upload Manager
          </h1>
          <p className="text-muted-foreground">
            {uploads.length} total uploads • {uploads.filter((u) => u.approved).length} approved
          </p>
        </motion.div>

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
      </div>
    </div>
  );
}

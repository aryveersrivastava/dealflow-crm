"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Building2, 
  ArrowRightLeft, 
  MessageSquare, 
  Check, 
  X, 
  Plus, 
  Loader2, 
  Send,
  UserCheck,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn, formatPrice, formatRelativeTime, getInitials } from "@/lib/utils";

type UserBasic = {
  id: string;
  fullName: string;
  avatar?: string;
  email: string;
};

type Collaboration = {
  id: string;
  type: "SHARED_LISTING" | "SHARED_REQUIREMENT" | "CO_BROKE" | "NOTE";
  isAccepted: boolean | null;
  fromUserId: string;
  toUserId: string;
  fromUser: UserBasic;
  toUser: UserBasic;
  message?: string;
  createdAt: string;
  property?: {
    id: string;
    title: string;
    city: string;
    price: number;
  };
  requirement?: {
    id: string;
    title: string;
    city: string;
    budgetMin: number;
    budgetMax: number;
  };
};

const typeIcons = {
  SHARED_LISTING: Building2,
  SHARED_REQUIREMENT: MessageSquare,
  CO_BROKE: ArrowRightLeft,
  NOTE: MessageSquare,
};

const typeColors = {
  SHARED_LISTING: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/10",
  SHARED_REQUIREMENT: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/10",
  CO_BROKE: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10",
  NOTE: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/10",
};

const typeLabels = {
  SHARED_LISTING: "Shared Listing",
  SHARED_REQUIREMENT: "Shared Requirement",
  CO_BROKE: "Co-Broke Request",
  NOTE: "Internal Note",
};

export default function CollaborationPage() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal share states
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [collabType, setCollabType] = useState<"SHARED_LISTING" | "SHARED_REQUIREMENT" | "CO_BROKE">("SHARED_LISTING");
  const [selectedPropertyId, setSelectedPropertyId] = useState("none");
  const [selectedRequirementId, setSelectedRequirementId] = useState("none");
  const [collabMessage, setCollabMessage] = useState("");

  // Options fetched from APIs
  const [agents, setAgents] = useState<UserBasic[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  
  // Current user ID to determine action permissions (can only accept if they are the recipient)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchCollaborations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/collaborations");
      if (!res.ok) throw new Error("Failed to fetch collaborations");
      const json = await res.json();
      setCollaborations(json.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load collaborations");
    } finally {
      setLoading(false);
    }
  };

  const fetchShareData = async () => {
    try {
      const [usersRes, propRes, reqRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/properties?limit=100"),
        fetch("/api/requirements?limit=100"),
      ]);

      if (usersRes.ok) {
        const json = await usersRes.json();
        setAgents(json.data || []);
      }
      if (propRes.ok) {
        const json = await propRes.json();
        setProperties(json.data || []);
      }
      if (reqRes.ok) {
        const json = await reqRes.json();
        setRequirements(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load share option data", err);
    }
  };

  // Determine current user from active collaborations or profile
  useEffect(() => {
    fetchCollaborations();
    fetchShareData();

    // Quick fetch user profile for current ID mapping
    fetch("/api/auth/callback") // or a simple /api/users endpoint that retrieves self
      .then(async () => {
        // Fallback: we'll check session info if needed, but we can match user emails
      })
      .catch(() => {});
  }, []);

  const handleAction = async (id: string, action: "ACCEPT" | "DECLINE") => {
    try {
      const res = await fetch(`/api/collaborations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error(`Failed to ${action.toLowerCase()} request`);
      const json = await res.json();

      toast.success(action === "ACCEPT" ? "Co-broking request accepted!" : "Co-broking request declined.");
      
      // Update local state
      setCollaborations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isAccepted: action === "ACCEPT" } : c))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update collaboration");
    }
  };

  const handleSendCollaboration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId) {
      toast.error("Please select a recipient");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        toUserId: recipientId,
        type: collabType,
        message: collabMessage.trim() || undefined,
      };

      if ((collabType === "SHARED_LISTING" || collabType === "CO_BROKE") && selectedPropertyId !== "none") {
        payload.propertyId = selectedPropertyId;
      }

      if (collabType === "SHARED_REQUIREMENT" && selectedRequirementId !== "none") {
        payload.requirementId = selectedRequirementId;
      }

      const res = await fetch("/api/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to send collaboration request");
      
      toast.success("Collaboration request sent!");
      setIsOpen(false);
      
      // Reset form fields
      setRecipientId("");
      setCollabType("SHARED_LISTING");
      setSelectedPropertyId("none");
      setSelectedRequirementId("none");
      setCollabMessage("");

      // Refresh list
      fetchCollaborations();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit collaboration request");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to filter items in tabs
  const getFilteredCollabs = (tab: string) => {
    if (tab === "all") return collaborations;
    if (tab === "listings") return collaborations.filter((c) => c.type === "SHARED_LISTING");
    if (tab === "requirements") return collaborations.filter((c) => c.type === "SHARED_REQUIREMENT");
    if (tab === "cobroke") return collaborations.filter((c) => c.type === "CO_BROKE");
    return collaborations;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collaboration Hub"
        description="Co-broke listings, share buyer requirements, and collaborate securely with agents inside your brokerage firm."
        action={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={
              <Button className="gap-2 shadow-sm font-semibold">
                <Plus className="h-4 w-4" /> Share Listing / Requirement
              </Button>
            } />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Share & Collaborate</DialogTitle>
                <DialogDescription>
                  Send properties, buyer requirements, or co-broking requests to your brokerage colleagues.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendCollaboration} className="space-y-4 py-2">
                
                {/* Recipient select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recipient Agent *</label>
                  <Select value={recipientId} onValueChange={(val) => setRecipientId(val || "")} required>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select brokerage agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.fullName} ({agent.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Collaboration Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Collaboration Type *</label>
                  <Select 
                    value={collabType} 
                    onValueChange={(val: any) => {
                      setCollabType(val);
                      setSelectedPropertyId("none");
                      setSelectedRequirementId("none");
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHARED_LISTING">Share Property Listing</SelectItem>
                      <SelectItem value="SHARED_REQUIREMENT">Share Buyer Requirement</SelectItem>
                      <SelectItem value="CO_BROKE">Co-Broker Request (Deal Proposal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Select (conditional) */}
                {(collabType === "SHARED_LISTING" || collabType === "CO_BROKE") && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Property *</label>
                    <Select value={selectedPropertyId} onValueChange={(val) => setSelectedPropertyId(val || "")} required>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select active property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" disabled>Choose property...</SelectItem>
                        {properties.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title} · {p.locality} (₹{Number(p.price).toLocaleString("en-IN")})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Requirement Select (conditional) */}
                {collabType === "SHARED_REQUIREMENT" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Buyer Requirement *</label>
                    <Select value={selectedRequirementId} onValueChange={(val) => setSelectedRequirementId(val || "")} required>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select buyer requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" disabled>Choose requirement...</SelectItem>
                        {requirements.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.title} · {r.buyerName} (₹{Number(r.budgetMin).toLocaleString("en-IN")} - ₹{Number(r.budgetMax).toLocaleString("en-IN")})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Notes/Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message / Offer Note</label>
                  <Textarea
                    placeholder="Provide details or offer notes to your partner agent..."
                    value={collabMessage}
                    onChange={(e) => setCollabMessage(e.target.value)}
                    className="h-24 bg-background/50"
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting || !recipientId}>
                    {submitting ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-1.5 h-4 w-4" />
                    )}
                    Send Proposal
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/40 p-1 rounded-xl">
          <TabsTrigger value="all" className="font-semibold text-xs px-4">All Proposals</TabsTrigger>
          <TabsTrigger value="listings" className="font-semibold text-xs px-4">Shared Listings</TabsTrigger>
          <TabsTrigger value="requirements" className="font-semibold text-xs px-4">Shared Requirements</TabsTrigger>
          <TabsTrigger value="cobroke" className="font-semibold text-xs px-4">Co-Broke Requests</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-semibold">Loading collaboration feed...</p>
          </div>
        ) : (
          ["all", "listings", "requirements", "cobroke"].map((tab) => {
            const items = getFilteredCollabs(tab);
            return (
              <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
                {items.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground border border-dashed rounded-2xl bg-muted/5">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                    <h3 className="font-bold text-sm text-foreground">No collaboration proposals</h3>
                    <p className="text-xs text-muted-foreground/80 mt-1">Start by clicking the "Share Listing / Requirement" button to invite colleagues.</p>
                  </div>
                ) : (
                  items.map((collab) => {
                    const Icon = typeIcons[collab.type] || Users;
                    const colorClass = typeColors[collab.type] || "bg-gray-500/10 text-gray-500";
                    const isPending = collab.isAccepted === null;
                    const isApproved = collab.isAccepted === true;
                    const isDeclined = collab.isAccepted === false;

                    return (
                      <Card key={collab.id} className="glass-panel border-none rounded-2xl overflow-hidden hover:shadow-xs transition-shadow duration-200">
                        <CardContent className="p-5 flex flex-col md:flex-row items-start gap-4">
                          {/* Left icon wrapper */}
                          <div className={cn("rounded-xl p-3 shrink-0 border", colorClass)}>
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Middle contents */}
                          <div className="flex-1 space-y-3 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                                {typeLabels[collab.type]}
                              </Badge>
                              {isPending && collab.type === "CO_BROKE" && (
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border-amber-500/30 bg-amber-500/5 text-amber-600">
                                  Pending Review
                                </Badge>
                              )}
                              {isApproved && (
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border-emerald-500/30 bg-emerald-500/5 text-emerald-600 flex items-center gap-1">
                                  <UserCheck className="h-3 w-3" /> Accepted
                                </Badge>
                              )}
                              {isDeclined && (
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border-rose-500/30 bg-rose-500/5 text-rose-600">
                                  Declined
                                </Badge>
                              )}
                            </div>

                            {/* Connection Details */}
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                              <Avatar className="h-5 w-5 shrink-0">
                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-black">
                                  {getInitials(collab.fromUser.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-foreground/80">{collab.fromUser.fullName}</span>
                              <span>→</span>
                              <Avatar className="h-5 w-5 shrink-0">
                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-black">
                                  {getInitials(collab.toUser.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-foreground/80">{collab.toUser.fullName}</span>
                            </div>

                            {/* Property Details */}
                            {collab.property && (
                              <div className="p-3 rounded-xl border border-border/40 bg-muted/10 max-w-lg">
                                <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Property listing</span>
                                <h4 className="text-xs font-bold text-foreground line-clamp-1">{collab.property.title}</h4>
                                <div className="flex items-center justify-between gap-4 mt-2">
                                  <span className="text-[10px] text-muted-foreground">{collab.property.city}</span>
                                  <span className="text-xs font-black text-primary">{formatPrice(collab.property.price)}</span>
                                </div>
                              </div>
                            )}

                            {/* Requirement Details */}
                            {collab.requirement && (
                              <div className="p-3 rounded-xl border border-border/40 bg-muted/10 max-w-lg">
                                <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Buyer Requirement</span>
                                <h4 className="text-xs font-bold text-foreground line-clamp-1">{collab.requirement.title}</h4>
                                <div className="flex items-center justify-between gap-4 mt-2">
                                  <span className="text-[10px] text-muted-foreground">{collab.requirement.city}</span>
                                  <span className="text-xs font-black text-primary">
                                    {formatPrice(collab.requirement.budgetMin)} - {formatPrice(collab.requirement.budgetMax)}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Optional message */}
                            {collab.message && (
                              <p className="text-xs italic text-muted-foreground leading-relaxed pl-1 max-w-xl">
                                &ldquo;{collab.message}&rdquo;
                              </p>
                            )}

                            {/* Bottom timestamp */}
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold pt-1">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span>Sent {formatRelativeTime(collab.createdAt)}</span>
                            </div>
                          </div>

                          {/* Action panel (Accept/Decline) */}
                          {isPending && collab.type === "CO_BROKE" && (
                            <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 md:pl-4 border-border/10">
                              <Button 
                                size="sm" 
                                className="flex-1 md:w-28 gap-1.5 h-8 font-bold" 
                                onClick={() => handleAction(collab.id, "ACCEPT")}
                              >
                                <Check className="h-3.5 w-3.5" /> Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 md:w-28 gap-1.5 h-8 font-semibold text-muted-foreground hover:text-destructive"
                                onClick={() => handleAction(collab.id, "DECLINE")}
                              >
                                <X className="h-3.5 w-3.5" /> Decline
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            );
          })
        )}
      </Tabs>
    </div>
  );
}

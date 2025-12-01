"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Sprout, Plus, Ticket, TreePine, Share2, Download } from "lucide-react";
import { useGamification } from "@/context/GamificationContext";
import { getUserPlants, plantSeed, waterPlant, DbPlant } from "@/lib/gamified-service";
import PixelPlant from "@/components/gamified-hub/PixelPlant";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";

export default function GardenPage() {
  const { appState, addPoints } = useGamification();
  const [plants, setPlants] = useState<DbPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { playSound } = useSoundEffects();

  // Animation State
  const [wateringPlantId, setWateringPlantId] = useState<string | null>(null);

  // Naming Dialog State
  const [isNamingOpen, setIsNamingOpen] = useState(false);
  const [newPlantName, setNewPlantName] = useState("");

  // Share Dialog State
  const [sharingPlant, setSharingPlant] = useState<DbPlant | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const fetchPlants = async () => {
    if (appState.user?.id) {
      const data = await getUserPlants(appState.user.id);
      setPlants(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, [appState.user?.id]);

  const openPlantDialog = () => {
      setNewPlantName(`Plant #${plants.length + 1}`);
      setIsNamingOpen(true);
  };

  const handlePlantSeed = async () => {
    if (!appState.user?.id) return;
    
    const isFirstPlant = plants.length === 0;
    const cost = isFirstPlant ? 0 : 50;

    if (!isFirstPlant && appState.points < cost) {
        toast({ variant: "destructive", title: "Not enough points", description: `Need ${cost} points to plant a new seed.` });
        return;
    }

    try {
        playSound("click");
        await plantSeed(appState.user.id, newPlantName);
        setIsNamingOpen(false);
        
        if (!isFirstPlant) {
            addPoints(-cost, "Planted new seed");
        }
        toast({ title: "Seed Planted!", description: isFirstPlant ? "Your first plant is on us! Water it to help it grow." : "Water it to help it grow." });
        fetchPlants();
    } catch (err) {
        console.error(err);
    }
  };

  const handleWater = async (plant: DbPlant) => {
    if (plant.stage >= 5) return;
    
    const waterCost = 10;
    
    if (appState.points < waterCost) {
        toast({ variant: "destructive", title: "Not enough points", description: "Need 10 points to water." });
        return;
    }

    // Start animation
    setWateringPlantId(plant.id);
    playSound("water");

    try {
        const updated = await waterPlant(plant.id);
        
        setPlants(prev => prev.map(p => p.id === plant.id ? updated : p));
        addPoints(-10, "Watering Plant"); 

        if (updated.stage > plant.stage) {
            setTimeout(() => playSound("success"), 200); // Delay success sound slightly
            if (updated.stage === 5) {
                toast({ title: "🌸 FULL BLOOM! 🌸", description: "You've unlocked a special reward!" });
            } else {
                toast({ title: "Plant Leveled Up!", description: "Your plant has grown to the next stage!" });
            }
        } else {
            toast({ title: "Watered!", description: "Your plant looks refreshed." });
        }
    } catch (err) {
        console.error(err);
    } finally {
        // Stop animation after a fixed duration
        setTimeout(() => setWateringPlantId(null), 200);
    }
  };

  const handleDownloadImage = async () => {
    if (shareRef.current) {
      try {
        const canvas = await html2canvas(shareRef.current, {
            backgroundColor: null,
            scale: 2, // Higher resolution
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `mamaearth-garden-${sharingPlant?.name || 'plant'}.png`;
        link.click();
        toast({ title: "Image Saved!", description: "Share it with your friends!" });
        setSharingPlant(null);
      } catch (e) {
        console.error("Screenshot failed", e);
        toast({ variant: "destructive", title: "Error", description: "Could not generate image." });
      }
    }
  };

  if (loading) return <div className="text-center py-10">Loading your garden...</div>;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-headline">My Personal Garden</h1>
        <p className="text-xl text-muted-foreground">Plant seeds, water them with your points, and watch them bloom!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plants.map((plant) => {
            const progress = (plant.water_count / plant.max_water_for_stage) * 100;
            const isFullyGrown = plant.stage >= 5;

            return (
                <Card key={plant.id} className="border-4 border-black shadow-neo overflow-hidden flex flex-col">
                    <CardHeader className="bg-primary/10 border-b-2 border-black pb-2">
                        <CardTitle className="flex justify-between items-center">
                            <span className="truncate max-w-[150px]" title={plant.name}>{plant.name}</span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSharingPlant(plant)}>
                                    <Share2 className="h-4 w-4" />
                                </Button>
                                <span className="text-xs bg-white px-2 py-1 rounded border border-black">Stage {plant.stage}/5</span>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col items-center justify-center p-6 bg-sky-50/50 relative overflow-hidden">
                        <PixelPlant seed={plant.seed} stage={plant.stage} scale={8} className="mb-4 drop-shadow-md" />
                        
                        {/* Watering Animation Overlay */}
                        <AnimatePresence>
                            {wateringPlantId === plant.id && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-20 bg-sky-200/20 flex flex-col items-center justify-center pointer-events-none"
                                >
                                    <motion.div
                                        initial={{ y: -50, scale: 0.5, opacity: 0 }}
                                        animate={{ y: -30, scale: 1.2, opacity: 1 }}
                                        exit={{ y: -50, scale: 0.5, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "backOut" }}
                                        className="text-7xl filter drop-shadow-lg"
                                    >
                                        ☁️
                                    </motion.div>
                                    <div className="w-full h-full absolute top-0 left-0">
                                        {[...Array(12)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ y: -10, x: 0, opacity: 0 }}
                                                animate={{ 
                                                    y: 120, 
                                                    x: (Math.random() - 0.5) * 50, 
                                                    opacity: [0, 1, 0] 
                                                }}
                                                transition={{ 
                                                    duration: 0.3, 
                                                    repeat: Infinity, 
                                                    delay: Math.random() * 0.1,
                                                    ease: "easeIn"
                                                }}
                                                className="absolute top-1/2 left-1/2 text-blue-500 text-lg font-bold"
                                                style={{ marginLeft: '-6px', marginTop: '-30px' }}
                                            >
                                                💧
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isFullyGrown && (
                            <div className="w-full space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>Growth</span>
                                    <span>{plant.water_count}/{plant.max_water_for_stage} Drops</span>
                                </div>
                                <Progress value={progress} className="h-3 border border-black" />
                            </div>
                        )}
                        {isFullyGrown && (
                            <div className="text-center space-y-2 animate-in fade-in zoom-in duration-500">
                                <div className="text-primary font-bold text-lg">
                                    🌸 Fully Bloomed! 🌸
                                </div>
                                {plant.coupon_code && (
                                    <div className="bg-yellow-100 border-2 border-black p-2 rounded-md transform rotate-[-2deg]">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Reward Unlocked</p>
                                        <p className="text-xl font-black text-primary">{plant.coupon_value}% OFF</p>
                                        <div className="flex items-center justify-center gap-1 bg-white border border-black rounded px-2 py-1 mt-1">
                                            <Ticket className="w-3 h-3" />
                                            <code className="text-sm font-mono">{plant.coupon_code}</code>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-center gap-2 text-xs text-green-800 font-bold bg-green-100 p-2 rounded border border-green-300">
                                    <TreePine className="w-4 h-4" />
                                    <span>Mamaearth planted 5 real trees!</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t-2 border-black p-4 bg-white">
                        <Button 
                            onClick={() => handleWater(plant)} 
                            disabled={isFullyGrown || wateringPlantId === plant.id}
                            className="w-full font-bold shadow-neo-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            <Droplets className="mr-2 h-4 w-4" />
                            {isFullyGrown ? "Completed" : (wateringPlantId === plant.id ? "Watering..." : "Water (-10 pts)")}
                        </Button>
                    </CardFooter>
                </Card>
            );
        })}

        {/* Add New Plant Card */}
        <Card className="border-4 border-dashed border-gray-300 shadow-none flex flex-col items-center justify-center p-10 min-h-[300px] hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors" onClick={openPlantDialog}>
            <div className="bg-white p-4 rounded-full border-2 border-gray-300 mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-500">Plant New Seed</h3>
            <p className="text-sm text-gray-400 mt-2">Cost: 50 Points</p>
        </Card>
      </div>

      {/* Naming Dialog */}
      <Dialog open={isNamingOpen} onOpenChange={setIsNamingOpen}>
        <DialogContent className="sm:max-w-[425px] border-2 border-black shadow-neo">
          <DialogHeader>
            <DialogTitle>Name Your Plant</DialogTitle>
            <DialogDescription>
              Give your new green friend a name before planting it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="plantName" className="mb-2 block">Plant Name</Label>
            <Input 
                id="plantName" 
                value={newPlantName}
                onChange={(e) => setNewPlantName(e.target.value)}
                className="font-bold"
            />
          </div>
          <DialogFooter>
            <Button onClick={handlePlantSeed}>Plant Seed (50 pts)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={!!sharingPlant} onOpenChange={(open) => !open && setSharingPlant(null)}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-transparent border-none shadow-none">
            <div className="flex flex-col items-center gap-4">
                {/* Capture Area */}
                <div 
                    ref={shareRef} 
                    className="w-full bg-gradient-to-br from-sky-100 to-green-100 p-6 rounded-xl border-4 border-white shadow-2xl flex flex-col items-center text-center space-y-4 relative overflow-hidden"
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-20px] left-[-20px] w-24 h-24 bg-yellow-300 rounded-full blur-xl"></div>
                        <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-green-300 rounded-full blur-xl"></div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full border border-green-200 shadow-sm z-10">
                        <span className="text-xs font-bold text-green-800 tracking-wider uppercase">Mamaearth Growth Garden</span>
                    </div>

                    <div className="relative z-10 transform scale-110 my-4">
                        {sharingPlant && <PixelPlant seed={sharingPlant.seed} stage={sharingPlant.stage} scale={6} />}
                    </div>

                    <div className="z-10 space-y-1">
                        <h3 className="text-2xl font-black font-headline text-gray-800">{sharingPlant?.name}</h3>
                        <p className="text-sm font-medium text-gray-600">Grown by {appState.user?.username || "Gardener"}</p>
                    </div>

                    <div className="z-10 w-full bg-white/50 rounded-lg p-3 flex justify-between items-center border border-white/60">
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Stage</span>
                            <span className="font-bold text-green-700">{sharingPlant?.stage}/5</span>
                        </div>
                        <div className="h-8 w-[1px] bg-gray-300"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Watered</span>
                            <span className="font-bold text-blue-600">{sharingPlant?.water_count} times</span>
                        </div>
                    </div>
                    
                    <div className="z-10 pt-2">
                        <p className="text-[10px] text-gray-400 font-mono">Join me & plant real trees!</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full">
                    <Button className="flex-1 bg-white text-black border-2 border-black hover:bg-gray-100" onClick={() => setSharingPlant(null)}>
                        Close
                    </Button>
                    <Button className="flex-1" onClick={handleDownloadImage}>
                        <Download className="w-4 h-4 mr-2" />
                        Save Image
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Sprout, Plus, Ticket, TreePine } from "lucide-react";
import { useGamification } from "@/context/GamificationContext";
import { getUserPlants, plantSeed, waterPlant, DbPlant } from "@/lib/gamified-service";
import PixelPlant from "@/components/gamified-hub/PixelPlant";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { motion, AnimatePresence } from "framer-motion";

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
    
    const cost = 50;
    if (appState.points < cost && plants.length > 0) {
        toast({ variant: "destructive", title: "Not enough points", description: `Need ${cost} points to plant a new seed.` });
        return;
    }

    try {
        playSound("click");
        await plantSeed(appState.user.id, newPlantName);
        setIsNamingOpen(false);
        
        if (plants.length > 0) {
            // Deduct points logic would go here
        }
        toast({ title: "Seed Planted!", description: "Water it to help it grow." });
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
            setTimeout(() => playSound("success"), 1000); // Delay success sound slightly
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
        setTimeout(() => setWateringPlantId(null), 500);
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
                            <span className="text-xs bg-white px-2 py-1 rounded border border-black">Stage {plant.stage}/5</span>
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
    </div>
  );
}

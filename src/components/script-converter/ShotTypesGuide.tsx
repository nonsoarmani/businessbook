"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ShotTypesGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const shotTypes = [
    { name: 'Establishing Shot', description: 'Shows location/setting (wide view)' },
    { name: 'Wide Shot', description: 'Shows full body and surroundings' },
    { name: 'Medium Shot', description: 'Shows from waist up' },
    { name: 'Medium Close-Up', description: 'Shows from chest up' },
    { name: 'Close-Up', description: 'Shows face/head' },
    { name: 'Tight Close-Up', description: 'Shows eyes/specific detail' },
    { name: 'Over-Shoulder Shot', description: 'Camera behind one person looking at another' },
    { name: 'Insert Shot', description: 'Close-up of object or detail' },
    { name: 'Reaction Shot', description: 'Shows character reacting' },
    { name: 'Cutaway', description: 'Brief shot away from the main action' },
    { name: 'Transition Shot', description: 'Connects two scenes or moments' },
    { name: 'POV Shot', description: 'What character sees' },
    { name: 'Dutch Angle', description: 'Tilted camera (for dramatic/comedy effect)' },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Shot Types Guide
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 p-4 border rounded-md mt-2 bg-background">
        {shotTypes.map((type, index) => (
          <div key={index}>
            <h4 className="font-semibold">{type.name}</h4>
            <p className="text-sm text-muted-foreground">{type.description}</p>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ShotTypesGuide;